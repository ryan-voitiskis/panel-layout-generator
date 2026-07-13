export interface MatrixGenerationOptions {
  numberOfRows: number
  numberOfColumns: number
  quantities: readonly number[]
  random?: () => number
  maxAttempts?: number
}

const DEFAULT_MAX_ATTEMPTS = 100

export function normalisePanelQuantity(value: unknown): number {
  const quantity = Number(value)

  if (!Number.isFinite(quantity)) return 0

  return Math.max(0, Math.floor(quantity))
}

export function hasEnoughVariety(
  quantities: readonly number[],
  panelsRequired: number,
): boolean {
  const available = quantities.map(normalisePanelQuantity)
  const largestQuantity = Math.max(0, ...available)
  const otherQuantities =
    available.reduce((total, quantity) => total + quantity, 0) - largestQuantity

  return otherQuantities >= Math.floor(panelsRequired / 2)
}

function pickWeightedCandidate(
  candidates: readonly number[],
  remaining: readonly number[],
  random: () => number,
): number {
  const totalWeight = candidates.reduce(
    (total, candidate) => total + (remaining[candidate] ?? 0),
    0,
  )
  const randomValue = Math.min(Math.max(random(), 0), 1 - Number.EPSILON)
  let target = randomValue * totalWeight

  for (const candidate of candidates) {
    target -= remaining[candidate] ?? 0
    if (target < 0) return candidate
  }

  const fallback = candidates.at(-1)
  if (fallback === undefined) {
    throw new Error("Cannot select from an empty candidate list")
  }

  return fallback
}

function generateDominantCheckerboard(
  numberOfRows: number,
  numberOfColumns: number,
  available: readonly number[],
  random: () => number,
): number[][] | null {
  const dominantColour = available.reduce(
    (highest, quantity, index) =>
      quantity > (available[highest] ?? 0) ? index : highest,
    0,
  )
  const dominantCellsRequired = Math.ceil((numberOfRows * numberOfColumns) / 2)

  if ((available[dominantColour] ?? 0) < dominantCellsRequired) return null

  const remaining = [...available]
  remaining[dominantColour] = 0
  const matrix = Array.from({ length: numberOfColumns }, () => [] as number[])

  for (let column = 0; column < numberOfColumns; column += 1) {
    const currentColumn = matrix[column]
    if (!currentColumn) return null

    for (let row = 0; row < numberOfRows; row += 1) {
      if ((column + row) % 2 === 0) {
        currentColumn.push(dominantColour)
        continue
      }

      const candidates = remaining.reduce<number[]>(
        (result, quantity, index) => {
          if (quantity > 0) result.push(index)
          return result
        },
        [],
      )

      if (candidates.length === 0) return null

      const colour = pickWeightedCandidate(candidates, remaining, random)
      currentColumn.push(colour)
      remaining[colour] = (remaining[colour] ?? 0) - 1
    }
  }

  return matrix
}

/**
 * Builds a column-major matrix while respecting each colour's available
 * quantity. Weighted selection keeps usage proportional to the quantities,
 * and bounded retries recover from the occasional greedy dead end.
 */
export function generatePanelMatrix({
  numberOfRows,
  numberOfColumns,
  quantities,
  random = Math.random,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
}: MatrixGenerationOptions): number[][] {
  const available = quantities.map(normalisePanelQuantity)

  if (
    !Number.isInteger(numberOfRows) ||
    !Number.isInteger(numberOfColumns) ||
    numberOfRows < 1 ||
    numberOfColumns < 1 ||
    available.length < 2 ||
    maxAttempts < 1
  ) {
    return []
  }

  const panelsRequired = numberOfRows * numberOfColumns
  const panelsAvailable = available.reduce(
    (total, quantity) => total + quantity,
    0,
  )

  if (
    panelsAvailable < panelsRequired ||
    !hasEnoughVariety(available, panelsRequired)
  ) {
    return []
  }

  const checkerboard = generateDominantCheckerboard(
    numberOfRows,
    numberOfColumns,
    available,
    random,
  )
  if (checkerboard) return checkerboard

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const remaining = [...available]
    const matrix = Array.from({ length: numberOfColumns }, () => [] as number[])
    let failed = false

    for (let column = 0; column < numberOfColumns && !failed; column += 1) {
      const currentColumn = matrix[column]
      if (!currentColumn) {
        failed = true
        break
      }

      for (let row = 0; row < numberOfRows; row += 1) {
        const colourToLeft = matrix[column - 1]?.[row]
        const colourAbove = currentColumn[row - 1]
        const candidates = remaining
          .map((quantity, index) => ({ index, quantity }))
          .filter(
            ({ index, quantity }) =>
              quantity > 0 && index !== colourToLeft && index !== colourAbove,
          )
          .map(({ index }) => index)

        if (candidates.length === 0) {
          failed = true
          break
        }

        const firstCandidate = candidates[0]
        if (firstCandidate === undefined) {
          failed = true
          break
        }

        const colour =
          column === 0 && row === 0
            ? candidates.reduce(
                (highest, candidate) =>
                  (remaining[candidate] ?? 0) > (remaining[highest] ?? 0)
                    ? candidate
                    : highest,
                firstCandidate,
              )
            : pickWeightedCandidate(candidates, remaining, random)

        currentColumn.push(colour)
        remaining[colour] = (remaining[colour] ?? 0) - 1
      }
    }

    if (!failed) return matrix
  }

  return []
}
