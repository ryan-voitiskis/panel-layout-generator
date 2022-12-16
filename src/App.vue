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
            />
            used: {{ colour.quantityUsed }}
          </div>
        </div>
      </div>
      <button @click="state.showColourPicker = true">Add colour</button>
    </div>
    <p v-if="state.notEnoughColours">Not enough panels to fill the grid.</p>
    <p v-if="state.generateFailed">
      Failed to generate a grid. Probably not enough variety of panel colours.
    </p>
    <div class="grid">
      <div class="column" v-for="(column, index) in matrix">
        <div
          class="panel"
          v-for="(colour, index2) in column"
          :style="{ backgroundColor: colour }"
        >
          {{ index2 + 1 }} down<br />
          {{ index + 1 }} across
        </div>
      </div>
    </div>
  </div>
  <ColourPickerModal v-if="state.showColourPicker" />
</template>

<script setup lang="ts">
import { reactive, computed } from "vue"
import XIcon from "./components/icons/XIcon.vue"
import ColourPickerModal from "./components/ColourPickerModal.vue"

interface PanelColour {
  colour: string
  quantity: number
  quantityUsed: number
}

const state = reactive({
  numberOfRows: 3,
  numberOfColumns: 3,
  panelColours: [
    { colour: "beige", quantity: 5, quantityUsed: 0 },
    { colour: "coral", quantity: 5, quantityUsed: 0 },
    { colour: "pink", quantity: 7, quantityUsed: 0 },
    // { colour: "plum", quantity: 10, quantityUsed: 0 },
    // { colour: "silver", quantity: 10, quantityUsed: 0 },
  ] as PanelColour[],
  showColourPicker: false,
  notEnoughColours: false,
  generateFailed: false,
})

// get a random colour option that uses quantity to determine the chance of being picked
const getColourOption = (
  colourToLeft: string | null,
  colourAbove: string | null,
  totalPanels: number
): string | null => {
  const possibilities: string[] = []
  state.panelColours.forEach((c) => {
    for (let i = 0; i < c.quantity - c.quantityUsed; i++) {
      possibilities.push(c.colour)
    }
  })
  let option = possibilities[Math.floor(Math.random() * totalPanels)]
  if (colourToLeft === null && colourAbove === null) return option
  let attempts = 0
  while ((option === colourToLeft || option === colourAbove) && attempts < 20) {
    option = possibilities[Math.floor(Math.random() * totalPanels)]
    attempts++
  }
  if (attempts === 20) {
    possibilities.forEach((c) => {
      if (c !== colourToLeft && c !== colourAbove) {
        return c
      }
    })
    return null
  } else return option
}

function resetQuantityUsed() {
  state.panelColours = state.panelColours.map((c) => ({
    ...c,
    quantityUsed: 0,
  }))
}

//? why is this not running when colour quantities change after failed generation? change numberOfRows or numberOfColumns recomputes it.
// generate a matrix of colours, ensuring that no two adjacent colours are the same
const matrix = computed(() => {
  console.log("Ran")
  if (state.panelColours.length < 2) return []
  if (state.numberOfRows < 1 || state.numberOfColumns < 1) return []
  if (state.numberOfRows > 100 || state.numberOfColumns > 100) return []
  const totalPanels = state.panelColours.reduce((acc, c) => acc + c.quantity, 0)
  if (totalPanels < state.numberOfRows * state.numberOfColumns) {
    state.notEnoughColours = true
    return []
  }
  state.notEnoughColours = false
  state.generateFailed = false
  resetQuantityUsed()
  let matrix: string[][] = []
  let attempts = 1
  while (attempts < 10000) {
    for (let i = 0; i < state.numberOfColumns; i++) {
      const row: string[] = []
      for (let j = 0; j < state.numberOfRows; j++) {
        const colourAbove = i > 0 ? matrix[i - 1][j] : null
        const colourToLeft = j > 0 ? row[j - 1] : null
        let colour = getColourOption(colourToLeft, colourAbove, totalPanels)
        if (colour) {
          row.push(colour)
          state.panelColours.find((c) => c.colour === colour)!.quantityUsed++
        } else break
      }
      if (row.length < state.numberOfRows) break
      matrix.push(row)
    }
    if (matrix.length === state.numberOfColumns) return matrix
    resetQuantityUsed()
    matrix = []
    attempts++
  }
  state.generateFailed = true
  return []
})

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
</style>
