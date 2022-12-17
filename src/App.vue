<template>
  <div class="app">
    <div class="controls">
      <label for="number_of_rows">
        Rows
        <input type="number" id="number_of_rows" v-model="state.numberOfRows" />
      </label>
      <label for="number_of_columns">
        Columns
        <input
          type="number"
          id="number_of_columns"
          v-model="state.numberOfColumns"
        />
      </label>
      <div class="colours">
        <div class="colour" v-for="(colour, index) in state.panelColours">
          <div
            class="colour-swatch"
            :style="{ backgroundColor: colour.colour }"
          >
            <button
              class="remove icon-only-button"
              @click="state.panelColours.splice(index, 1)"
            >
              <XIcon />
            </button>
            <input
              min="0"
              max="1000"
              type="number"
              id="colour-{{ index }}"
              v-model="colour.quantity"
              @change="regenerateMatrix"
            />
            used: {{ colour.quantityUsed }}
          </div>
        </div>
      </div>
      <button @click="state.showColourPicker = true">Add colour</button>
      <button @click="regenerateMatrix">Shuffle</button>
    </div>
    <p v-if="state.notEnoughPanels">Not enough panels to fill the grid.</p>
    <p v-if="state.generateFailed">
      Failed to generate a grid. Unknown reason.
    </p>
    <p v-if="state.notEnoughVariety">
      Not enough variety of panel colours. Try adding more colours.
    </p>
    <div class="grid">
      <div class="loader-backdrop" v-if="state.generating">
        <BallTriangleLoader class="loader" />
      </div>
      <div class="column" v-for="(column, index) in state.matrix">
        <div
          class="panel"
          v-for="(colour, index2) in column"
          :style="{ backgroundColor: state.panelColours[colour].colour }"
        >
          <!-- {{ index2 + 1 }} down<br />
          {{ index + 1 }} across -->
        </div>
      </div>
    </div>
  </div>
  <ColourPickerModal
    v-if="state.showColourPicker"
    @close="state.showColourPicker = false"
    @add="addColour($event)"
  />
</template>

<script setup lang="ts">
import { reactive, computed, watch } from "vue"
import XIcon from "./components/icons/XIcon.vue"
import ColourPickerModal from "./components/ColourPickerModal.vue"
import BallTriangleLoader from "./components/icons/BallTriangleLoader.vue"

interface PanelColour {
  colour: string
  quantity: number
  quantityUsed: number
}

const state = reactive({
  numberOfRows: 9,
  numberOfColumns: 9,
  panelColours: [
    { colour: "coral", quantity: 1, quantityUsed: 0 },
    { colour: "pink", quantity: 40, quantityUsed: 0 },
    { colour: "beige", quantity: 40, quantityUsed: 0 },
  ] as PanelColour[],
  showColourPicker: false,
  notEnoughPanels: false,
  notEnoughVariety: false,
  generateFailed: false,
  generating: false,
  matrix: [] as number[][],
})

function addColour(panelColour: PanelColour) {
  state.panelColours.push(panelColour)
  state.showColourPicker = false
}

function resetQuantityUsed() {
  state.panelColours = state.panelColours.map((c) => ({
    ...c,
    quantityUsed: 0,
  }))
}

// get a random colour option that uses quantity to determine the chance of being picked
function getColourOption(
  colourToLeft: number | null,
  colourAbove: number | null
): number | null {
  const possibilities: number[] = []
  state.panelColours.forEach((c, index) => {
    for (let i = 0; i < c.quantity - c.quantityUsed; i++) {
      possibilities.push(index)
    }
  })

  // if first panel return index of panelColour with highest quantity
  if (colourToLeft === null && colourAbove === null) {
    let highestQuantity = 0
    let highestQuantityIndex = 0
    state.panelColours.forEach((c, index) => {
      if (c.quantity > highestQuantity) {
        highestQuantity = c.quantity
        highestQuantityIndex = index
      }
    })
    return highestQuantityIndex
  }

  let option = possibilities[Math.floor(Math.random() * possibilities.length)]
  let attempts = 0
  while ((option === colourToLeft || option === colourAbove) && attempts < 20) {
    option = possibilities[Math.floor(Math.random() * possibilities.length)]
    attempts++
  }
  // if (option !== undefined && option !== null) return option
  if (attempts === 20) {
    possibilities.forEach((c) => {
      if (c !== colourToLeft && c !== colourAbove) {
        return c
      }
    })
  } else return option
  return null
}

// generate a matrix of colours, ensuring that no two adjacent colours are the same
function generateMatrix(): number[][] {
  state.notEnoughPanels = false
  state.generateFailed = false
  state.notEnoughVariety = false
  state.generating = true
  if (state.panelColours.length < 2) return []
  if (state.numberOfRows < 1 || state.numberOfColumns < 1) return []
  if (state.numberOfRows > 100 || state.numberOfColumns > 100) return []
  const totalPanelsRequired = state.numberOfRows * state.numberOfColumns
  const totalPanels = state.panelColours.reduce((acc, c) => acc + c.quantity, 0)
  if (totalPanels < totalPanelsRequired) {
    state.notEnoughPanels = true
    return []
  }
  // check that it is possible to generate a grid with enough variety so that no two adjacent panels are the same colour
  // the sum of the quantity of each colour except the largest quantity must be greater than or equal to half the total number of panels required
  const largestQuantityIndex = state.panelColours.reduce(
    (acc, c, index) =>
      c.quantity > acc.quantity ? { quantity: c.quantity, index } : acc,
    { quantity: 0, index: 0 }
  ).index
  const sumOfOtherQuantities = state.panelColours
    .filter((c, index) => index !== largestQuantityIndex)
    .reduce((acc, c) => acc + c.quantity, 0)
  if (sumOfOtherQuantities < totalPanelsRequired / 2 - 1) {
    state.notEnoughVariety = true
    return []
  }
  resetQuantityUsed()
  let matrix: number[][] = []
  let attempts = 1
  while (attempts < 200) {
    for (let i = 0; i < state.numberOfColumns; i++) {
      const row: number[] = []
      for (let j = 0; j < state.numberOfRows; j++) {
        const colourAbove = i > 0 ? matrix[i - 1][j] : null
        const colourToLeft = j > 0 ? row[j - 1] : null
        let colour = getColourOption(colourToLeft, colourAbove)
        if (colour !== null) {
          row.push(colour)
          state.panelColours[colour]!.quantityUsed++
        } else break
      }
      if (row.length < state.numberOfRows) break
      matrix.push(row)
    }
    if (matrix.length === state.numberOfColumns) {
      state.generating = false
      return matrix
    }
    resetQuantityUsed()
    matrix = []
    attempts++
  }
  state.generating = false
  state.generateFailed = true
  return []
}

// panelDimension will be calculated so that the whole grid is visible on the screen without scrolling
// each panel will be a square
const screenHeight = window.innerHeight - 140
const screenWidth = window.innerWidth
const panelHeight = computed(() => screenHeight / state.numberOfRows)
const panelWidth = computed(() => screenWidth / state.numberOfColumns)
const panelDimension = computed(() =>
  panelHeight.value < panelWidth.value
    ? panelHeight.value + "px"
    : panelWidth.value + "px"
)

function regenerateMatrix() {
  state.matrix = generateMatrix()
}

watch(
  () => state.numberOfRows,
  () => {
    state.matrix = generateMatrix()
  }
)

watch(
  () => state.numberOfColumns,
  () => {
    state.matrix = generateMatrix()
  }
)

state.matrix = generateMatrix()
</script>

<style lang="scss" scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  // justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: #f5f5f5;
}

.grid {
  position: relative;
  display: flex;
  .column {
    .panel {
      width: v-bind(panelDimension);
      height: v-bind(panelDimension);
      display: flex;
      flex: 1;
      font-size: 22px;
      justify-content: center;
      align-items: center;
    }
  }
}

.controls {
  height: 140px;
  display: flex;
  align-items: center;
  padding: 2px 20px;
}

.colours {
  display: flex;
  .colour-swatch {
    display: flex;
    justify-content: center;
    height: 140px;
    width: 140px;
    input {
      align-self: center;
      width: 80%;
    }
    .remove {
      justify-self: right;
      margin-left: auto;
    }
  }
}

.loader-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(150, 150, 150, 0.3);
  backdrop-filter: blur(12px);
  z-index: 2;
  .loader {
    color: #555;
    z-index: 3;
    position: relative;
    top: calc(50% - 100px);
    left: calc(50% - 100px);
    height: 200px;
    width: 200px;
  }
}
</style>
