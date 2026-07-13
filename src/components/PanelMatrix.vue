<template>
  <div
    v-for="(column, columnIndex) in matrix"
    :key="columnIndex"
    class="column"
  >
    <div
      v-for="(colour, rowIndex) in column"
      :key="rowIndex"
      class="panel"
      :style="{ backgroundColor: panelColours[colour]?.colour }"
      :aria-label="`Row ${rowIndex + 1}, column ${columnIndex + 1}, ${panelColours[colour]?.colour ?? 'unknown colour'}`"
      data-test="panel"
    >
      <svg
        v-if="store.showNumbers"
        viewBox="0 0 100 100"
        aria-hidden="true"
        :style="{
          fill: panelColours[colour]?.textColour,
        }"
      >
        <text x="50" y="36">R:{{ rowIndex + 1 }}</text>
        <text x="50" y="80">C:{{ columnIndex + 1 }}</text>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { PanelColour } from "../interfaces/PanelColour"
  import { useMatrixStore } from "../useMatrixStore"

  const store = useMatrixStore()

  defineProps<{
    matrix: number[][]
    panelColours: PanelColour[]
    panelDimension: string
  }>()
</script>

<style lang="scss" scoped>
  .column {
    .panel {
      width: v-bind(panelDimension);
      height: v-bind(panelDimension);
      svg {
        font-size: 2em;
        height: 90%;
        width: 100%;
        text {
          text-anchor: middle;
          dominant-baseline: middle;
        }
      }
    }
  }
</style>
