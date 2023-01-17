import { defineStore } from "pinia"
import PanelColour from "./interfaces/PanelColour"

export const matrixStore = defineStore("matrixStore", {
  state: () => ({
    numberOfRows: 8,
    numberOfColumns: 12,
    panelColours: [
      { colour: "#F5D0A9", textColour: "#111", quantity: 20, quantityUsed: 0 },
      { colour: "#F5A9BC", textColour: "#111", quantity: 20, quantityUsed: 0 },
      { colour: "#A9BCF5", textColour: "#111", quantity: 20, quantityUsed: 0 },
      { colour: "#A9F5D0", textColour: "#111", quantity: 20, quantityUsed: 0 },
      { colour: "#F3F781", textColour: "#111", quantity: 20, quantityUsed: 0 },
    ] as PanelColour[],
    possibilities: [] as number[], // array of indexes of panelColours, used for generating matrix
    showColourPicker: false, // shows ColourPickerModal.vue
    showNumbers: false,
    notEnoughPanels: false,
    notEnoughVariety: false,
    generateFailed: false,
    showAbout: false, // shows AboutModal.vue
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

    // return index of panelColour with highest quantity
    getHighestQuantityIndex(): number {
      let highestQuantity = 0
      let highestQuantityIndex = 0
      this.panelColours.forEach((c, index) => {
        if (c.quantity > highestQuantity) {
          highestQuantity = c.quantity
          highestQuantityIndex = index
        }
      })
      return highestQuantityIndex
    },

    getFirstColour(): number {
      let highestQuantityIndex = this.getHighestQuantityIndex()
      const optionIndex = this.possibilities.findIndex(
        (i) => i === highestQuantityIndex
      )
      const colour = this.possibilities[optionIndex]
      this.possibilities.splice(optionIndex, 1)
      return colour
    },

    // return a random colour from the panelColours array, ensuring that it is not the same as the colour to the left or above
    getColourOption(
      colourToLeft: number | null,
      colourAbove: number | null
    ): number | null {
      if (colourToLeft === null && colourAbove === null)
        return this.getFirstColour()
      let optionIndex = Math.floor(Math.random() * this.possibilities.length)
      let attempts = 0
      while (
        (this.possibilities[optionIndex] === colourToLeft ||
          this.possibilities[optionIndex] === colourAbove) &&
        attempts < 20
      ) {
        optionIndex = Math.floor(Math.random() * this.possibilities.length)
        attempts++
      }
      if (attempts === 20) {
        this.possibilities.forEach((c, index) => {
          if (c !== colourToLeft && c !== colourAbove) {
            this.possibilities.splice(index, 1)
            return c
          }
        })
      } else {
        const colour = this.possibilities[optionIndex]
        this.possibilities.splice(optionIndex, 1)
        return colour
      }
      return null
    },

    generatePossibilites() {
      this.possibilities = []
      this.panelColours.forEach((c, index) => {
        for (let i = 0; i < c.quantity; i++) {
          this.possibilities.push(index)
        }
      })
    },

    setQuantityUsed() {
      this.panelColours.forEach((c, index) => {
        this.panelColours[index].quantityUsed = 0
      })
      this.matrix.forEach((row) => {
        row.forEach((c) => {
          this.panelColours[c].quantityUsed++
        })
      })
    },

    // generate a matrix of colours, ensuring that no two adjacent colours are the same
    generateMatrix(): number[][] {
      let matrix: number[][] = []
      let attempts = 1
      this.generatePossibilites()
      while (attempts < 1000) {
        for (let i = 0; i < this.numberOfColumns; i++) {
          const row: number[] = []
          for (let j = 0; j < this.numberOfRows; j++) {
            const colourAbove = i > 0 ? matrix[i - 1][j] : null
            const colourToLeft = j > 0 ? row[j - 1] : null
            let colour = this.getColourOption(colourToLeft, colourAbove)
            if (colour !== null) {
              row.push(colour)
            } else break
          }
          if (row.length < this.numberOfRows) break
          matrix.push(row)
        }
        if (matrix.length === this.numberOfColumns) return matrix
        this.generatePossibilites()
        matrix = []
        attempts++
      }
      return []
    },

    // if not enough variety of colours, returns false
    testVariety(totalPanelsRequired: number) {
      this.notEnoughVariety = false
      const largestQuantityIndex = this.getHighestQuantityIndex()
      const sumOfOtherQuantities = this.panelColours
        .filter((c, index) => index !== largestQuantityIndex)
        .reduce((acc, c) => acc + Math.abs(c.quantity), 0)
      const minSumOfOtherQuantities =
        totalPanelsRequired % 2 === 0
          ? totalPanelsRequired / 2
          : totalPanelsRequired / 2 - 1
      if (sumOfOtherQuantities < minSumOfOtherQuantities) {
        this.matrix = []
        this.notEnoughVariety = true
        return false
      }
      return true
    },

    testNotEnoughPanels(totalPanelsRequired: number) {
      this.notEnoughPanels = false
      const totalPanels = this.panelColours.reduce(
        (acc, c) => acc + Math.abs(c.quantity),
        0
      )
      if (totalPanels < totalPanelsRequired) {
        this.matrix = []
        this.notEnoughPanels = true
        return false
      }
      return true
    },

    // attempt to generate a matrix, and handle errors
    attemptGenerateMatrix() {
      this.generateFailed = false
      if (this.panelColours.length < 2) return
      if (this.numberOfRows < 1 || this.numberOfColumns < 1) return
      if (this.numberOfRows > 51 || this.numberOfColumns > 51) return
      const totalPanelsRequired = this.numberOfRows * this.numberOfColumns

      // prevent running generateMatrix with an array of panelColours that wont work
      if (!this.testNotEnoughPanels(totalPanelsRequired)) return
      if (!this.testVariety(totalPanelsRequired)) return

      this.matrix = this.generateMatrix()
      if (this.matrix.length === 0) {
        this.generateFailed = true
      } else this.setQuantityUsed()
    },
  },
})
