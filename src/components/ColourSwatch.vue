<template>
  <div class="colour-swatch" :style="{ backgroundColor: colour.colour }">
    <button class="remove icon-only-button" @click="store.removeColour(index)">
      <XIcon />
    </button>
    <input
      min="0"
      max="999"
      type="number"
      id="colour-{{ index }}"
      v-model="colour.quantity"
      @change="store.attemptGenerateMatrix"
    />
    <span class="used">Used: {{ colour.quantityUsed }}</span>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue"
import { matrixStore } from "../matrixStore"
import PanelColour from "../interfaces/PanelColour"
import XIcon from "./icons/XIcon.vue"
const store = matrixStore()

defineProps<{
  colour: PanelColour
  index: number
}>()
</script>

<style lang="scss" scoped>
.colour-swatch {
  border-radius: 8px;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  justify-content: center;
  height: 120px;
  width: 120px;
  .used {
    grid-area: 2 / 1 / 3 / 3;
    align-self: center;
    text-align: center;
    display: block;
  }
  input {
    border: none;
    grid-area: 3 / 1 / 4 / 3;
    background: hsla(0, 0%, 100%, 0.5);
    align-self: flex-end;
    justify-self: center;
    margin-bottom: 10px;
    width: 100px;
  }
  .remove {
    grid-area: 1 / 1 / 2 / 3;
    background: transparent;
    border-radius: 0;
    justify-self: right;
    margin-left: auto;
    &:hover {
      background: hsla(0, 0%, 100%, 0.5);
    }
  }
}
</style>
