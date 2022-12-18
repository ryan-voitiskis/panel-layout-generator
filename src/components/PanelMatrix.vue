<template>
  <div class="column" v-for="(column, index) in matrix">
    <div
      class="panel"
      v-for="(colour, index2) in column"
      :style="{ backgroundColor: panelColours[colour].colour }"
    >
      <svg
        viewBox="0 0 100 100"
        v-if="store.showArrows"
        :style="{
          fill: panelColours[colour].textColour,
        }"
      >
        <text x="26" y="44">{{ index2 + 1 }} 🠗</text>
        <text x="26" y="98">{{ index + 1 }} 🠖</text>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue"
import { matrixStore } from "../matrixStore"
import PanelColour from "../interfaces/PanelColour"
const store = matrixStore()

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
      height: 80%;
      width: 100%;
    }
  }
}
</style>
