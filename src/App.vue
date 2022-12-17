<template>
  <div class="app">
    <div class="controls">
      <div class="row-col-controls">
        <label for="number_of_rows"> Rows </label>
        <input
          type="number"
          min="1"
          max="50"
          id="number_of_rows"
          v-model="store.numberOfRows"
        />
        <label for="number_of_columns"> Columns </label>
        <input
          type="number"
          min="1"
          max="50"
          id="number_of_columns"
          v-model="store.numberOfColumns"
        />
      </div>
      <div class="colours">
        <ColourSwatch
          v-for="(colour, index) in store.panelColours"
          :colour="colour"
          :index="index"
          :key="index"
        />
        <div class="colour" v-for="(colour, index) in store.panelColours"></div>
      </div>
      <button @click="store.showColourPicker = true">Add colour</button>
      <button @click="store.attemptGenerateMatrix">
        {{ store.matrix.length ? "Shuffle" : "Generate" }}
      </button>
    </div>
    <p v-if="store.notEnoughPanels">Not enough panels to fill the grid.</p>
    <p v-if="store.generateFailed">
      Failed to generate a grid. Unknown reason.
    </p>
    <p v-if="store.notEnoughVariety">
      Not enough variety of panel colours. Probably too many of one colour and
      not enough of the others.
    </p>
    <div class="grid">
      <PanelMatrix
        :matrix="store.matrix"
        :panelColours="store.panelColours"
        :panel-dimension="panelDimension"
        v-cloak
      />
    </div>
  </div>
  <ColourPickerModal
    v-if="store.showColourPicker"
    @close="store.showColourPicker = false"
    @add="store.addColour($event)"
  />
</template>

<script setup lang="ts">
import { computed, watch } from "vue"
import { matrixStore } from "./matrixStore"
import ColourSwatch from "./components/ColourSwatch.vue"
import ColourPickerModal from "./components/ColourPickerModal.vue"
import PanelMatrix from "./components/PanelMatrix.vue"
const store = matrixStore()

const screenHeight = window.innerHeight - 140
const screenWidth = window.innerWidth
const panelHeight = computed(() => screenHeight / store.numberOfRows)
const panelWidth = computed(() => screenWidth / store.numberOfColumns)
const panelDimension = computed(() =>
  panelHeight.value < panelWidth.value
    ? panelHeight.value + "px"
    : panelWidth.value + "px"
)

watch(
  () => store.numberOfRows,
  () => store.attemptGenerateMatrix()
)

watch(
  () => store.numberOfColumns,
  () => store.attemptGenerateMatrix()
)

store.attemptGenerateMatrix()
</script>

<style lang="scss" scoped>
p {
  font-size: 24px;
  color: #777;
}
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #f5f5f5;
}

.grid {
  position: relative;
  display: flex;
}

.controls {
  height: 140px;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 0 10px;
  .row-col-controls {
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 100px;
    gap: 10px;
    label {
      line-height: 38px;
      &[for="number_of_rows"] {
        grid-template-areas: 1 / 1 / 2 / 2;
      }
      &[for="number_of_columns"] {
        grid-template-areas: 1 / 2 / 2 / 3;
      }
    }
    #number_of_rows {
      grid-template-areas: 2 / 1 / 3 / 2;
    }
    #number_of_columns {
      grid-template-areas: 2 / 2 / 3 / 3;
    }
  }
  .colours {
    display: flex;
    gap: 10px;
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
