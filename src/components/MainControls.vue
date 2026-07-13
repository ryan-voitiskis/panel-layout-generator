<template>
  <div class="row-col-controls">
    <label for="number_of_rows">Rows</label>
    <input
      id="number_of_rows"
      v-model.number="store.numberOfRows"
      type="number"
      min="1"
      max="50"
    />
    <label for="number_of_columns">Columns</label>
    <input
      id="number_of_columns"
      v-model.number="store.numberOfColumns"
      type="number"
      min="1"
      max="50"
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
      id="open_edit_colours"
      type="button"
      @click="store.showColourControls = true"
    >
      <PaletteIcon /><span>Edit colours</span>
    </button>
    <button
      class="square-icon-button hide-on-mobile"
      id="open_add_colour"
      type="button"
      @click="store.showColourPicker = true"
    >
      <PaletteIcon /><span>Add colour</span>
    </button>
    <button
      class="square-icon-button hide-on-mobile"
      id="toggle_numbers"
      type="button"
      @click="store.showNumbers = !store.showNumbers"
    >
      <GridIcon />
      <span>{{ store.showNumbers ? "Hide" : "Show" }} numbers</span>
    </button>
    <button
      class="square-icon-button large"
      id="shuffle"
      type="button"
      @click="store.attemptGenerateMatrix"
    >
      <ShuffleIcon />
      <span>{{ store.matrix.length ? "Shuffle" : "Generate" }}</span>
    </button>
    <div class="secondary-button-controls">
      <button
        class="secondary-button"
        id="open_about"
        type="button"
        aria-label="About"
        @click="store.showAbout = true"
      >
        <InfoIcon />
      </button>
      <button
        id="print"
        type="button"
        class="secondary-button hide-on-mobile"
        aria-label="Print"
        @click="printPage"
      >
        <PrintIcon />
      </button>
      <button
        class="secondary-button hide-on-large"
        id="toggle_numbers_mobile"
        type="button"
        :aria-label="store.showNumbers ? 'Hide numbers' : 'Show numbers'"
        @click="store.showNumbers = !store.showNumbers"
      >
        <GridIcon />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue"
  import { useMatrixStore } from "../useMatrixStore"
  import ColourSwatch from "./ColourSwatch.vue"
  import PaletteIcon from "./icons/PaletteIcon.vue"
  import ShuffleIcon from "./icons/ShuffleIcon.vue"
  import InfoIcon from "./icons/InfoIcon.vue"
  import PrintIcon from "./icons/PrintIcon.vue"
  import GridIcon from "./icons/GridIcon.vue"

  const store = useMatrixStore()

  const printPage = () => window.print()

  const coloursTemplateColumns = computed(
    () => `repeat(${store.panelColours.length}, 120px)`,
  )
</script>

<style lang="scss" scoped>
  .row-col-controls {
    align-self: center;
    display: grid;
    grid-template-rows: 38px 38px;
    grid-template-columns: 1fr 100px;
    gap: 10px;
    label {
      line-height: 38px;
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
      span {
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
        &[for="number_of_columns"] {
          margin-top: 4px;
        }
      }
      input {
        width: 100%;
        height: 36px;
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
        span {
          font-size: 14px;
        }
      }
    }
  }

  @media screen and (max-width: 368px) {
    .button-controls {
      gap: 6px;
    }
    .row-col-controls {
      width: 80px;
    }
  }
</style>
