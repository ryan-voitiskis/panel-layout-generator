import { createPinia, setActivePinia } from "pinia"
import { describe, beforeEach, test, expect } from "vitest"
import PanelColour from "./interfaces/PanelColour"
import { matrixStore } from "./matrixStore"

// the following tests are of unit style, testing the matrixStore in isolation
// some internal functionality is tested here to help manage complexity of application logic
describe("MatrixStore", () => {
  let store: ReturnType<typeof matrixStore>
  beforeEach(() => {
    setActivePinia(createPinia())
    store = matrixStore()
  })

  test("should load with enough colours to fill the matrix", () => {
    const totalColours = store.panelColours.reduce(
      (acc, c) => acc + c.quantity,
      0
    )
    expect(totalColours).toBeGreaterThanOrEqual(
      store.numberOfRows * store.numberOfColumns
    )
  })

  test("adding a colour should increase the number of colours", () => {
    const originalLength = store.panelColours.length
    store.addColour({
      colour: "#000",
      textColour: "#fff",
      quantity: 20,
      quantityUsed: 0,
    })
    expect(store.panelColours.length).toBe(originalLength + 1)
  })

  test("removing a colour should decrease the number of colours", () => {
    const originalLength = store.panelColours.length
    store.removeColour(0)
    expect(store.panelColours.length).toBe(originalLength - 1)
  })

  test("generates matrix with correct number of rows and columns", () => {
    store.attemptGenerateMatrix()
    expect(store.matrix.length).toBe(store.numberOfColumns)
    expect(store.matrix[0].length).toBe(store.numberOfRows)
  })

  test("generates matrix, using the colour with the highest quantity first", () => {
    store.panelColours = [
      { colour: "#F5D0A9", textColour: "#111", quantity: 20, quantityUsed: 0 },
      { colour: "#F5A9BC", textColour: "#111", quantity: 20, quantityUsed: 0 },
      { colour: "#A9BCF5", textColour: "#111", quantity: 21, quantityUsed: 0 },
      { colour: "#A9F5D0", textColour: "#111", quantity: 20, quantityUsed: 0 },
      { colour: "#F3F781", textColour: "#111", quantity: 20, quantityUsed: 0 },
    ]
    store.attemptGenerateMatrix()
    expect(store.matrix[0][0]).toBe(2)
  })

  // this one is a bit silly because it's simply doing the opposite of the setQuantityUsed() function
  // but it may help if refactoring the setQuantityUsed() function
  // it's still testing an outcome represented in the UI directly
  test("sets the correct quantityUsed for each colour", () => {
    store.attemptGenerateMatrix()
    store.matrix.forEach((row) => {
      row.forEach((c) => {
        store.panelColours[c].quantityUsed--
      })
    })
    store.panelColours.forEach((c) => {
      expect(c.quantityUsed).toBe(0)
    })
  })

  test("no two adjacent colours are the same in a generated matrix", () => {
    store.attemptGenerateMatrix()
    store.matrix.forEach((row, rowIndex) => {
      row.forEach((c, colIndex) => {
        const left = row[colIndex - 1]
        const top = store.matrix[rowIndex - 1]?.[colIndex]
        expect(c).not.toBe(left)
        expect(c).not.toBe(top)
      })
    })
  })

  // notEnoughVariety should be true if the sum of quantity of all panelColours
  // except the one with the highest quantity is less than half the number of
  // panels required to fill the grid
  test.each([
    {
      notEnoughVariety: true,
      grid: [3, 3],
      panelColourQuantities: [9, 3],
    },
    {
      notEnoughVariety: false,
      grid: [3, 3],
      panelColourQuantities: [9, 4],
    },
    {
      notEnoughVariety: false,
      grid: [2, 2],
      panelColourQuantities: [1, 1, 1, 1],
    },
    {
      notEnoughVariety: false, // false because notEnoughPanels exited attemptGenerateMatrix before notEnoughVariety was set
      grid: [20, 20], // 400 panels
      panelColourQuantities: [200, 199], // 399 panels
    },
    // ! uncomment these to test more scenarios + better coverage, but they take a while to run
    // {
    //   notEnoughVariety: true,
    //   grid: [20, 20],
    //   panelColourQuantities: [300, 199],
    // },
    // {
    //   notEnoughVariety: false,
    //   grid: [20, 20],
    //   panelColourQuantities: [200, 200],
    // },
    // {
    //   notEnoughVariety: true,
    //   grid: [20, 20],
    //   panelColourQuantities: [300, 100, 99],
    // },
    // {
    //   notEnoughVariety: false,
    //   grid: [20, 20],
    //   panelColourQuantities: [200, 100, 100],
    // },
  ])("notEnoughVariety true when not enough variety", (data) => {
    store.panelColours = data.panelColourQuantities.map((q) => ({
      colour: "#fff",
      textColour: "#111",
      quantity: q,
      quantityUsed: 0,
    })) as PanelColour[]
    store.numberOfRows = data.grid[0]
    store.numberOfColumns = data.grid[1]
    store.attemptGenerateMatrix()
    expect(store.notEnoughVariety).toBe(data.notEnoughVariety)
  })
})
