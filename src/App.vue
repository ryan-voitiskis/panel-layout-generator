<template>
  <div class="app">
    <div class="controls">
      <MainControls />
    </div>
    <p v-if="store.notEnoughPanels" id="not_enough_panels_msg" role="status">
      Not enough panels to fill the grid.
    </p>
    <p v-if="store.generateFailed" id="generate_failed_msg" role="status">
      Could not generate a grid with these settings. Try shuffling again.
    </p>
    <p v-if="store.notEnoughVariety" id="not_enough_variety_msg" role="status">
      Not enough colour variety. Add more panels in the other colours.
    </p>
    <div id="grid">
      <PanelMatrix
        :matrix="store.matrix"
        :panel-colours="store.panelColours"
        :panel-dimension="panelDimension"
        v-cloak
      />
    </div>
  </div>
  <ModalBox
    v-if="store.showColourPicker"
    label="Pick a colour"
    width="380px"
    @close="store.showColourPicker = false"
  >
    <ColourPickerModal />
  </ModalBox>
  <ModalBox
    v-if="store.showAbout"
    label="About Panel layout generator"
    width="640px"
    @close="store.showAbout = false"
  >
    <AboutModal />
  </ModalBox>
  <KeepAlive>
    <ModalBox
      v-if="store.showColourControls"
      label="Edit panel colours"
      width="800px"
      @close="store.showColourControls = false"
    >
      <ColourControlsModal />
    </ModalBox>
  </KeepAlive>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, reactive, watch } from "vue"
  import ColourPickerModal from "./components/ColourPickerModal.vue"
  import ColourControlsModal from "./components/ColourControlsModal.vue"
  import PanelMatrix from "./components/PanelMatrix.vue"
  import AboutModal from "./components/AboutModal.vue"
  import ModalBox from "./components/ModalBox.vue"
  import MainControls from "./components/MainControls.vue"
  import { useMatrixStore } from "./useMatrixStore"

  const CONTROLS_HEIGHT = 140
  const store = useMatrixStore()

  const viewport = reactive({
    height: window.innerHeight,
    width: window.innerWidth,
  })
  const panelDimension = computed(() => {
    const panelHeight =
      Math.max(0, viewport.height - CONTROLS_HEIGHT) / store.numberOfRows
    const panelWidth = viewport.width / store.numberOfColumns

    return `${Math.min(panelHeight, panelWidth)}px`
  })

  watch(
    [() => store.numberOfRows, () => store.numberOfColumns],
    () => store.attemptGenerateMatrix(),
    { immediate: true },
  )

  function updateViewport() {
    viewport.height = window.innerHeight
    viewport.width = window.innerWidth
  }

  onMounted(() => window.addEventListener("resize", updateViewport))
  onBeforeUnmount(() => window.removeEventListener("resize", updateViewport))
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
    #grid {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }
</style>
