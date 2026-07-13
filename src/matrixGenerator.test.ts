import { describe, expect, test } from "vitest"
import {
  generatePanelMatrix,
  hasEnoughVariety,
  normalisePanelQuantity,
} from "./matrixGenerator"

function seededRandom(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0
    return state / 2 ** 32
  }
}

function expectValidMatrix(
  matrix: number[][],
  numberOfRows: number,
  numberOfColumns: number,
  quantities: readonly number[],
) {
  expect(matrix).toHaveLength(numberOfColumns)
  expect(matrix.every((column) => column.length === numberOfRows)).toBe(true)

  const quantityUsed = Array.from({ length: quantities.length }, () => 0)

  matrix.forEach((column, columnIndex) => {
    column.forEach((colour, rowIndex) => {
      expect(colour).not.toBe(column[rowIndex - 1])
      expect(colour).not.toBe(matrix[columnIndex - 1]?.[rowIndex])
      quantityUsed[colour] = (quantityUsed[colour] ?? 0) + 1
    })
  })

  quantityUsed.forEach((used, index) => {
    expect(used).toBeLessThanOrEqual(quantities[index] ?? 0)
  })
}

describe("normalisePanelQuantity", () => {
  test.each([
    [12, 12],
    [3.8, 3],
    [-4, 0],
    [Number.NaN, 0],
    ["7", 7],
    [undefined, 0],
  ])("normalises %p to %i", (quantity, expected) => {
    expect(normalisePanelQuantity(quantity)).toBe(expected)
  })
})

describe("hasEnoughVariety", () => {
  test.each([
    [[9, 3], 9, false],
    [[9, 4], 9, true],
    [[2, 2], 4, true],
    [[3, 1], 4, false],
  ])("checks %p for a %i-panel matrix", (quantities, required, expected) => {
    expect(hasEnoughVariety(quantities, required)).toBe(expected)
  })
})

describe("generatePanelMatrix", () => {
  test("generates a complete matrix without adjacent matching colours", () => {
    const quantities = [20, 20, 20, 20, 20]
    const matrix = generatePanelMatrix({
      numberOfRows: 8,
      numberOfColumns: 12,
      quantities,
      random: seededRandom(1),
    })

    expectValidMatrix(matrix, 8, 12, quantities)
  })

  test("handles the tight two-colour case deterministically", () => {
    const quantities = [13, 12]
    const matrix = generatePanelMatrix({
      numberOfRows: 5,
      numberOfColumns: 5,
      quantities,
      random: () => 0,
    })

    expectValidMatrix(matrix, 5, 5, quantities)
  })

  test("starts with the colour that has the most panels", () => {
    const matrix = generatePanelMatrix({
      numberOfRows: 2,
      numberOfColumns: 3,
      quantities: [2, 2, 3],
    })

    expect(matrix[0]?.[0]).toBe(2)
  })

  test.each([
    { rows: 10, columns: 10, quantities: [50, 49, 1] },
    { rows: 10, columns: 10, quantities: [50, 25, 25] },
    { rows: 10, columns: 10, quantities: [40, 30, 30] },
    { rows: 10, columns: 10, quantities: [34, 33, 33] },
    { rows: 10, columns: 10, quantities: [30, 25, 25, 20] },
    { rows: 20, columns: 20, quantities: [200, 100, 100] },
    { rows: 50, columns: 50, quantities: [1_250, 625, 625] },
  ])("handles constrained quantity mix $quantities", (scenario) => {
    for (let seed = 1; seed <= 5; seed += 1) {
      const matrix = generatePanelMatrix({
        numberOfRows: scenario.rows,
        numberOfColumns: scenario.columns,
        quantities: scenario.quantities,
        random: seededRandom(seed),
      })

      expectValidMatrix(
        matrix,
        scenario.rows,
        scenario.columns,
        scenario.quantities,
      )
    }
  })

  test("returns an empty matrix for impossible input", () => {
    expect(
      generatePanelMatrix({
        numberOfRows: 3,
        numberOfColumns: 3,
        quantities: [9, 3],
      }),
    ).toEqual([])
  })
})
