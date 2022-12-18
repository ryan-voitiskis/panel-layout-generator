<template>
  <div class="modal-header">
    <h2>Pick a colour</h2>
    <button
      class="close icon-only-button"
      @click="store.showColourPicker = false"
    >
      <XIcon />
    </button>
  </div>
  <div class="modal-body">
    <ColorPicker
      alpha-channel="hide"
      :color="colour"
      @color-change="updateColour"
      :visible-formats="['hsl']"
    />
    <label for="quantity">
      Quantity
      <input
        type="number"
        id="quantity"
        v-model="quantity"
        min="1"
        max="1000"
      />
    </label>
  </div>
  <div class="modal-footer">
    <button class="close" @click="store.showColourPicker = false">Close</button>
    <button class="add" @click="addColour">Add</button>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from "vue"
import XIcon from "../components/icons/XIcon.vue"
import { ColorChangeEvent, ColorPicker } from "vue-accessible-color-picker"
import PanelColour from "../interfaces/PanelColour"
import { matrixStore } from "../matrixStore"
const store = matrixStore()

const emit = defineEmits<{
  (e: "close"): void
  (e: "add", panelColour: PanelColour): void
}>()

const colour = ref("hsl(270 100% 50% / 0.8)")
const textColour = ref("#111")
const quantity = ref(1)

const addColour = () =>
  store.addColour({
    colour: colour.value,
    textColour: textColour.value,
    quantity: quantity.value,
    quantityUsed: 0,
  })

// function to determine the luminance of a colour
// https://stackoverflow.com/a/56678483/7259172
function luminance(r: number, g: number, b: number) {
  const a = [r, g, b].map((v) => {
    v / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

function updateColour(eventData: ColorChangeEvent) {
  colour.value = eventData.cssColor
  const luminanceValue = luminance(
    eventData.colors.rgb.r,
    eventData.colors.rgb.g,
    eventData.colors.rgb.b
  )
  textColour.value = luminanceValue > 0.179 ? "#111" : "#fff"
}
</script>

<style lang="scss">
.modal-backdrop {
  position: fixed;
  background-color: rgba(120, 120, 120, 0.4);
  backdrop-filter: blur(2px);
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99;
  .modal {
    background: #fff;
    transition: background-color 200ms, color 200ms;
    border-radius: 10px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    width: 380px;
    margin: 10px;
    &.dynamic {
      max-height: calc(100% - 20px);
    }
    &.full {
      height: calc(100% - 20px);
    }
  }
}

.modal-header {
  display: grid;
  grid-template-columns: 1fr auto;
  padding: 30px 40px;
  h2 {
    font-weight: 500;
    line-height: 38px;
    margin: 0 20px 0 0;
  }
  .close {
    margin-left: auto; // right align when no h2
    padding: 0 8px;
  }
}

.modal-body {
  padding: 0 40px;
  margin-bottom: 40px;
  overflow-y: scroll;
  overflow-x: hidden;
  p {
    color: var(--dark-text);
  }
}

.modal-body-sticky-header {
  padding: 0 40px;
}

// for more complex forms with multiple control buttons
.modal-footer {
  margin-top: -20px;
  gap: 20px;
  padding: 20px 40px;
  width: 100%;
  display: flex;
  justify-content: end;
  background: var(--secondary);
  border-radius: 0 0 10px 10px;
  button[type="reset"] {
    margin-right: auto;
  }
  button.primary {
    margin-top: unset;
  }
}

.modal-footer-plain {
  margin-top: -20px;
  gap: 20px;
  padding: 20px 40px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.vacp-color-picker {
  padding: 0;
}
</style>
