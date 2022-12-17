<template>
  <div class="column" v-for="(column, index) in matrix">
    <div
      class="panel"
      v-for="(colour, index2) in column"
      :style="{ backgroundColor: panelColours[colour].colour }"
    >
      {{ index2 + 1 }} down<br />
      {{ index + 1 }} across
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue"
import PanelColour from "../interfaces/PanelColour"

const props = defineProps<{
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
    display: flex;
    flex: 1;
    font-size: 22px;
    justify-content: center;
    align-items: center;
  }
}
</style>
