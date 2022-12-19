<template>
  <div class="colour-swatch" :style="{ backgroundColor: colour.colour }">
    <span class="hex">{{ colour.colour }}</span>
    <button class="remove icon-only-button" @click="store.removeColour(index)">
      <XIcon />
    </button>
    <label for="colour-{{ index }}">Q:</label>
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

const props = defineProps<{
  colour: PanelColour
  index: number
}>()

const textColour = store.panelColours[props.index].textColour
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
  .hex {
    grid-area: 1 / 1 / 2 / 3;
    align-self: center;
    margin-left: 10px;
    font-size: 14px;
    font-style: italic;

    display: block;
    color: v-bind(textColour);
  }
  .used {
    grid-area: 2 / 1 / 3 / 3;
    align-self: center;
    text-align: center;
    display: block;
    color: v-bind(textColour);
  }
  label {
    grid-area: 3 / 1 / 4 / 2;
    align-self: center;
    justify-self: flex-start;
    margin-left: 10px;
    margin-bottom: 10px;
    color: v-bind(textColour);
  }
  input {
    border: none;
    grid-area: 3 / 1 / 4 / 3;
    background: hsla(0, 0%, 100%, 0.5);
    align-self: flex-end;
    justify-self: flex-end;
    margin: 0 10px 10px 0;
    width: 74px;
  }
  .remove {
    color: v-bind(textColour);
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
