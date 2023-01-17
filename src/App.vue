<template>
  <div class="app">
    <div class="controls">
      <MainControls />
    </div>
    <p v-if="store.notEnoughPanels" id="not_enough_panels_msg">
      Not enough panels to fill the grid.
    </p>
    <p v-if="store.generateFailed" id="generate_failed_msg">
      Failed to generate a grid. Unknown reason.
    </p>
    <p v-if="store.notEnoughVariety" id="not_enough_variety_msg">
      Not enough variety of panel colours. Probably too many of one colour and
      not enough of the others.
    </p>
    <div id="grid">
      <PanelMatrix
        :matrix="store.matrix"
        :panelColours="store.panelColours"
        :panel-dimension="panelDimension"
        v-cloak
      />
    </div>
  </div>
  <ModalBox
    v-if="store.showColourPicker"
    @close="store.showColourPicker = false"
    width="380px"
  >
    <ColourPickerModal />
  </ModalBox>
  <ModalBox
    v-if="store.showAbout"
    @close="store.showAbout = false"
    width="640px"
  >
    <AboutModal />
  </ModalBox>
  <KeepAlive>
    <ModalBox
      v-if="store.showColourControls"
      @close="store.showColourControls = false"
      width="800px"
    >
      <ColourControlsModal />
    </ModalBox>
  </KeepAlive>
</template>

<script setup lang="ts">
import { computed, watch } from "vue"
import { matrixStore } from "./matrixStore"
import ColourPickerModal from "./components/ColourPickerModal.vue"
import ColourControlsModal from "./components/ColourControlsModal.vue"
import PanelMatrix from "./components/PanelMatrix.vue"
import AboutModal from "./components/AboutModal.vue"
import ModalBox from "./components/ModalBox.vue"
import MainControls from "./components/MainControls.vue"
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
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  width: 100vw;
}

#grid {
  position: relative;
  display: flex;
}

.controls {
  height: 140px;
  max-width: 1800px;
  display: grid;
  grid-template-columns: auto minmax(150px, 1fr) auto;
  grid-template-rows: 140px;
  gap: 10px;
  padding: 0 10px;
}

@media screen and (max-width: 368px) {
  .controls {
    gap: 6px;
    padding: 0;
  }
}

@media print {
  .controls {
    display: none;
  }
  .grid {
    padding: 0 10cm;
    page-break-inside: avoid;
  }
}
</style>
