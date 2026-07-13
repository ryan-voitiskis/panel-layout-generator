<template>
  <div class="colour-swatch" :style="{ backgroundColor: colour.colour }">
    <span class="hex">{{ colour.colour }}</span>
    <button
      type="button"
      class="remove icon-only-button"
      :aria-label="`Remove ${colour.colour}`"
      @click="store.removeColour(index)"
    >
      <XIcon />
    </button>
    <label :for="quantityInputId">Q:</label>
    <input
      :id="quantityInputId"
      :value="colour.quantity"
      min="0"
      max="999"
      type="number"
      @change="updateQuantity"
    />
    <span class="used">Used: {{ colour.quantityUsed }}</span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue"
  import type { PanelColour } from "../interfaces/PanelColour"
  import { useMatrixStore } from "../useMatrixStore"
  import XIcon from "./icons/XIcon.vue"

  const store = useMatrixStore()

  const props = defineProps<{
    colour: PanelColour
    index: number
  }>()

  const textColour = computed(() => props.colour.textColour)
  const quantityInputId = computed(() => `colour-${props.index}-quantity`)

  function updateQuantity(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    store.setColourQuantity(props.index, input.valueAsNumber)
  }
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
