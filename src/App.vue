<template>
  <div class="app">
    <div class="controls">
      <div class="row-col-controls">
        <label for="number_of_rows">Rows</label>
        <input
          type="number"
          min="1"
          max="50"
          id="number_of_rows"
          v-model="store.numberOfRows"
        />
        <label for="number_of_columns">Columns</label>
        <input
          type="number"
          min="1"
          max="50"
          id="number_of_columns"
          v-model="store.numberOfColumns"
        />
      </div>
      <div class="colours hide-on-mobile">
        <ColourSwatch
          v-for="(colour, index) in store.panelColours"
          :colour="colour"
          :index="index"
          :key="index"
        />
      </div>
      <div class="button-controls">
        <button
          class="square-icon-button hide-on-large"
          @click="store.showColourControls = true"
          id="open_edit_colours"
        >
          <PaletteIcon /><label>Edit colours</label>
        </button>
        <button
          class="square-icon-button hide-on-mobile"
          @click="store.showColourPicker = true"
          id="open_add_colour"
        >
          <PaletteIcon /><label>Add colour</label>
        </button>
        <button
          class="square-icon-button hide-on-mobile"
          @click="store.showNumbers = !store.showNumbers"
          id="toggle_numbers"
        >
          <GridIcon /><label
            >{{ store.showNumbers ? "Hide" : "Show" }} numbers</label
          >
        </button>
        <button
          class="square-icon-button large"
          @click="store.attemptGenerateMatrix"
          id="shuffle"
        >
          <ShuffleIcon />
          <label>{{ store.matrix.length ? "Shuffle" : "Generate" }}</label>
        </button>
        <div class="secondary-button-controls">
          <button
            class="secondary-button"
            @click="store.showAbout = true"
            id="open_about"
          >
            <InfoIcon />
          </button>
          <button
            class="secondary-button hide-on-mobile"
            @click="print"
            id="print"
          >
            <PrintIcon />
          </button>
          <button
            class="secondary-button hide-on-large"
            @click="store.showNumbers = !store.showNumbers"
            id="toggle_numbers_mobile"
          >
            <GridIcon />
          </button>
        </div>
      </div>
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
    <div class="grid">
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
  <ModalBox
    v-if="store.showColourControls"
    @close="store.showColourControls = false"
    width="800px"
  >
    <ColourControlsModal />
  </ModalBox>
</template>

<script setup lang="ts">
import { computed, watch } from "vue"
import { matrixStore } from "./matrixStore"
import ColourSwatch from "./components/ColourSwatch.vue"
import ColourPickerModal from "./components/ColourPickerModal.vue"
import ColourControlsModal from "./components/ColourControlsModal.vue"
import PanelMatrix from "./components/PanelMatrix.vue"
import PaletteIcon from "./components/icons/PaletteIcon.vue"
import ShuffleIcon from "./components/icons/ShuffleIcon.vue"
import InfoIcon from "./components/icons/InfoIcon.vue"
import AboutModal from "./components/AboutModal.vue"
import ModalBox from "./components/ModalBox.vue"
import PrintIcon from "./components/icons/PrintIcon.vue"
import GridIcon from "./components/icons/GridIcon.vue"
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

const print = () => window.print()

const coloursTemplateColumns = computed(
  () => `repeat(${store.panelColours.length}, 120px)`
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

.grid {
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

.row-col-controls {
  align-self: center;
  display: grid;
  grid-template-rows: 38px 38px;
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
  height: 138px; // 140px - 2px so scroll bar doesn't touch grid
  padding: 10px 0;
  display: grid;
  grid-gap: 10px;
  grid-template-columns: v-bind(coloursTemplateColumns);
  overflow-x: scroll;
  overflow-y: hidden;
}

.button-controls {
  display: flex;
  gap: 10px;
  height: 140px;
  padding: 10px 0;
  .square-icon-button {
    display: grid;
    grid-template-rows: 80px 40px;
    width: 120px;
    height: 120px;
    svg {
      margin: auto;
      height: 60px;
      width: 60px;
    }
    label {
      font-size: 16px;
      vertical-align: middle;
    }
  }

  .secondary-button-controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
    .secondary-button {
      width: 55px;
      height: 55px;
      svg {
        height: 30px;
        width: 30px;
      }
    }
  }
}

@media screen and (max-width: 840px) {
  .hide-on-mobile {
    display: none !important;
  }
  .row-col-controls {
    width: 100px;
    grid-template-columns: 1fr;
    gap: 0;
    grid-template-rows: 22px 36px 26px 36px;
    label {
      line-height: 22px;
      &[for="number_of_rows"] {
        grid-template-areas: 1 / 1 / 2 / 2;
      }
      &[for="number_of_columns"] {
        margin-top: 4px;
        grid-template-areas: 1 / 3 / 2 / 4;
      }
    }
    input {
      width: 100%;
      height: 36px;
    }
    #number_of_rows {
      grid-template-areas: 1 / 2 / 2 / 3;
    }
    #number_of_columns {
      grid-template-areas: 1 / 4 / 2 / 5;
    }
  }
}

@media screen and (min-width: 841px) {
  .hide-on-large {
    display: none !important;
  }
}

@media screen and (max-width: 448px) {
  .button-controls {
    .square-icon-button {
      width: 100px;
    }
  }
}

@media screen and (max-width: 408px) {
  .button-controls {
    .square-icon-button {
      width: 80px;
      label {
        font-size: 14px;
      }
    }
  }
}

@media screen and (max-width: 368px) {
  .controls {
    gap: 6px;
    padding: 0;
  }
  .button-controls {
    gap: 6px;
  }
  .row-col-controls {
    width: 80px;
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
