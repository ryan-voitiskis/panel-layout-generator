import { createPinia, setActivePinia } from "pinia"
import { beforeEach, describe, expect, test } from "vitest"
import type { PanelColour } from "./interfaces/PanelColour"
import { useMatrixStore } from "./useMatrixStore"

describe("useMatrixStore", () => {
  let store: ReturnType<typeof useMatrixStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useMatrixStore()
  })

  test("loads with enough colours to fill the default matrix", () => {
    const totalColours = store.panelColours.reduce(
      (total, colour) => total + colour.quantity,
      0,
    )

    expect(totalColours).toBeGreaterThanOrEqual(
      store.numberOfRows * store.numberOfColumns,
    )
  })

  test("adds and removes colours", () => {
    const originalLength = store.panelColours.length
    store.addColour({
      colour: "#000",
      textColour: "#fff",
      quantity: 20,
      quantityUsed: 0,
    })
    expect(store.panelColours).toHaveLength(originalLength + 1)

    store.removeColour(originalLength)
    expect(store.panelColours).toHaveLength(originalLength)
  })

  test("generates the requested matrix and records colour usage", () => {
    store.attemptGenerateMatrix()

    expect(store.matrix).toHaveLength(store.numberOfColumns)
    expect(
      store.matrix.every((column) => column.length === store.numberOfRows),
    ).toBe(true)

    const panelsUsed = store.panelColours.reduce(
      (total, colour) => total + colour.quantityUsed,
      0,
    )
    expect(panelsUsed).toBe(store.numberOfRows * store.numberOfColumns)
  })

  test("clears a stale matrix and usage when dimensions become invalid", () => {
    store.attemptGenerateMatrix()
    expect(store.matrix.length).toBeGreaterThan(0)

    store.numberOfRows = 0
    store.attemptGenerateMatrix()

    expect(store.matrix).toEqual([])
    expect(
      store.panelColours.every(({ quantityUsed }) => quantityUsed === 0),
    ).toBe(true)
  })

  test("normalises edited quantities before generating", () => {
    store.setColourQuantity(0, -10)

    expect(store.panelColours[0]!.quantity).toBe(0)
  })

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
      notEnoughVariety: false,
      grid: [20, 20],
      panelColourQuantities: [200, 199],
    },
  ])("reports whether a matrix lacks colour variety", (data) => {
    store.panelColours = data.panelColourQuantities.map((quantity) => ({
      colour: "#fff",
      textColour: "#111",
      quantity,
      quantityUsed: 0,
    })) as PanelColour[]
    store.numberOfRows = data.grid[0]!
    store.numberOfColumns = data.grid[1]!

    store.attemptGenerateMatrix()

    expect(store.notEnoughVariety).toBe(data.notEnoughVariety)
  })
})
