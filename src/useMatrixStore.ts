import { defineStore } from "pinia"
import type { PanelColour } from "./interfaces/PanelColour"
import {
  generatePanelMatrix,
  hasEnoughVariety,
  normalisePanelQuantity,
} from "./matrixGenerator"

const MAX_GRID_DIMENSION = 50

const defaultPanelColours: PanelColour[] = [
  { colour: "#d26470", textColour: "#111", quantity: 20, quantityUsed: 0 },
  { colour: "#ef8268", textColour: "#111", quantity: 20, quantityUsed: 0 },
  { colour: "#ffa660", textColour: "#111", quantity: 20, quantityUsed: 0 },
  { colour: "#ffce60", textColour: "#111", quantity: 20, quantityUsed: 0 },
  { colour: "#f9f871", textColour: "#111", quantity: 20, quantityUsed: 0 },
]

export const useMatrixStore = defineStore("matrix", {
  state: () => ({
    numberOfRows: 8,
    numberOfColumns: 12,
    panelColours: defaultPanelColours.map((colour) => ({ ...colour })),
    matrix: [] as number[][],
    showNumbers: false,
    showColourPicker: false,
    showColourControls: false,
    showAbout: false,
    notEnoughPanels: false,
    notEnoughVariety: false,
    generateFailed: false,
  }),

  actions: {
    addColour(panelColour: PanelColour) {
      this.panelColours.push({
        ...panelColour,
        quantity: normalisePanelQuantity(panelColour.quantity),
        quantityUsed: 0,
      })
      this.showColourPicker = false
      this.attemptGenerateMatrix()
    },

    removeColour(index: number) {
      if (index < 0 || index >= this.panelColours.length) return

      this.panelColours.splice(index, 1)
      this.attemptGenerateMatrix()
    },

    setColourQuantity(index: number, quantity: unknown) {
      const panelColour = this.panelColours[index]
      if (!panelColour) return

      panelColour.quantity = normalisePanelQuantity(quantity)
      this.attemptGenerateMatrix()
    },

    resetGeneration() {
      this.matrix = []
      this.notEnoughPanels = false
      this.notEnoughVariety = false
      this.generateFailed = false

      for (const panelColour of this.panelColours) {
        panelColour.quantityUsed = 0
      }
    },

    updateQuantityUsed() {
      for (const column of this.matrix) {
        for (const colourIndex of column) {
          const panelColour = this.panelColours[colourIndex]
          if (panelColour) panelColour.quantityUsed += 1
        }
      }
    },

    attemptGenerateMatrix() {
      this.resetGeneration()

      if (
        this.panelColours.length < 2 ||
        !Number.isInteger(this.numberOfRows) ||
        !Number.isInteger(this.numberOfColumns) ||
        this.numberOfRows < 1 ||
        this.numberOfColumns < 1 ||
        this.numberOfRows > MAX_GRID_DIMENSION ||
        this.numberOfColumns > MAX_GRID_DIMENSION
      ) {
        return
      }

      const quantities = this.panelColours.map((panelColour) => {
        const normalisedQuantity = normalisePanelQuantity(panelColour.quantity)
        panelColour.quantity = normalisedQuantity
        return normalisedQuantity
      })
      const panelsRequired = this.numberOfRows * this.numberOfColumns
      const panelsAvailable = quantities.reduce(
        (total, quantity) => total + quantity,
        0,
      )

      if (panelsAvailable < panelsRequired) {
        this.notEnoughPanels = true
        return
      }

      if (!hasEnoughVariety(quantities, panelsRequired)) {
        this.notEnoughVariety = true
        return
      }

      this.matrix = generatePanelMatrix({
        numberOfRows: this.numberOfRows,
        numberOfColumns: this.numberOfColumns,
        quantities,
      })

      if (this.matrix.length === 0) {
        this.generateFailed = true
        return
      }

      this.updateQuantityUsed()
    },
  },
})
