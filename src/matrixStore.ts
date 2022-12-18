import { defineStore } from "pinia"
import PanelColour from "./interfaces/PanelColour"

export const matrixStore = defineStore("matrixStore", {
  state: () => ({
    numberOfRows: 20,
    numberOfColumns: 25,
    panelColours: [
      { colour: "#F5D0A9", quantity: 100, quantityUsed: 0 },
      { colour: "#F5A9BC", quantity: 100, quantityUsed: 0 },
      { colour: "#A9BCF5", quantity: 100, quantityUsed: 0 },
      { colour: "#A9F5D0", quantity: 100, quantityUsed: 0 },
      { colour: "#F3F781", quantity: 100, quantityUsed: 0 },
    ] as PanelColour[],
    showColourPicker: false,
    showArrows: false,
    notEnoughPanels: false,
    notEnoughVariety: false,
    generateFailed: false,
    showAbout: false,
    showColourControls: false, // shows ColourControlsModal.vue, used for small screens
    matrix: [] as number[][],
  }),
  actions: {
    addColour(panelColour: PanelColour) {
      this.panelColours.push(panelColour)
      this.showColourPicker = false
      this.attemptGenerateMatrix()
    },

    removeColour(index: number) {
      this.matrix = []
      this.panelColours.splice(index, 1)
      this.attemptGenerateMatrix()
    },

    resetQuantityUsed() {
      this.panelColours = this.panelColours.map((c) => ({
        ...c,
        quantityUsed: 0,
      }))
    },

    // return a random colour from the panelColours array, ensuring that it is not the same as the colour to the left or above
    getColourOption(
      colourToLeft: number | null,
      colourAbove: number | null
    ): number | null {
      const possibilities: number[] = []
      this.panelColours.forEach((c, index) => {
        for (let i = 0; i < c.quantity - c.quantityUsed; i++) {
          possibilities.push(index)
        }
      })

      // if first panel return index of panelColour with highest quantity
      if (colourToLeft === null && colourAbove === null) {
        let highestQuantity = 0
        let highestQuantityIndex = 0
        this.panelColours.forEach((c, index) => {
          if (c.quantity > highestQuantity) {
            highestQuantity = c.quantity
            highestQuantityIndex = index
          }
        })
        return highestQuantityIndex
      }

      let option =
        possibilities[Math.floor(Math.random() * possibilities.length)]
      let attempts = 0
      while (
        (option === colourToLeft || option === colourAbove) &&
        attempts < 20
      ) {
        option = possibilities[Math.floor(Math.random() * possibilities.length)]
        attempts++
      }
      if (attempts === 20) {
        possibilities.forEach((c) => {
          if (c !== colourToLeft && c !== colourAbove) {
            return c
          }
        })
      } else return option
      return null
    },

    // generate a matrix of colours, ensuring that no two adjacent colours are the same
    generateMatrix(): number[][] {
      let matrix: number[][] = []
      let attempts = 1
      while (attempts < 1000) {
        for (let i = 0; i < this.numberOfColumns; i++) {
          const row: number[] = []
          for (let j = 0; j < this.numberOfRows; j++) {
            const colourAbove = i > 0 ? matrix[i - 1][j] : null
            const colourToLeft = j > 0 ? row[j - 1] : null
            let colour = this.getColourOption(colourToLeft, colourAbove)
            if (colour !== null) {
              row.push(colour)
              this.panelColours[colour]!.quantityUsed++
            } else break
          }
          if (row.length < this.numberOfRows) break
          matrix.push(row)
        }
        if (matrix.length === this.numberOfColumns) {
          return matrix
        }
        this.resetQuantityUsed()
        matrix = []
        attempts++
      }
      return []
    },

    // attempt to generate a matrix, and handle errors
    attemptGenerateMatrix() {
      this.notEnoughPanels = false
      this.generateFailed = false
      this.notEnoughVariety = false
      if (this.panelColours.length < 2) return
      if (this.numberOfRows < 1 || this.numberOfColumns < 1) return
      if (this.numberOfRows > 51 || this.numberOfColumns > 51) return
      const totalPanelsRequired = this.numberOfRows * this.numberOfColumns
      const totalPanels = this.panelColours.reduce(
        (acc, c) => acc + c.quantity,
        0
      )
      if (totalPanels < totalPanelsRequired) {
        this.matrix = []
        this.notEnoughPanels = true
        return
      }
      const largestQuantityIndex = this.panelColours.reduce(
        (acc, c, index) =>
          c.quantity > acc.quantity ? { quantity: c.quantity, index } : acc,
        { quantity: 0, index: 0 }
      ).index
      const sumOfOtherQuantities = this.panelColours
        .filter((c, index) => index !== largestQuantityIndex)
        .reduce((acc, c) => acc + c.quantity, 0)
      const minSumOfOtherQuantities =
        totalPanelsRequired % 2 === 0
          ? totalPanelsRequired / 2
          : totalPanelsRequired / 2 - 1
      if (sumOfOtherQuantities < minSumOfOtherQuantities) {
        this.notEnoughVariety = true
        return []
      }
      this.resetQuantityUsed()
      this.matrix = this.generateMatrix()
      if (this.matrix.length === 0) {
        this.generateFailed = true
      }
    },
  },
})
