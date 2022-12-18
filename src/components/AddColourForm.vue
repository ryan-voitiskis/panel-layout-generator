<template>
  <div class="container">
    <ColorPicker
      alpha-channel="hide"
      :color="colour"
      @color-change="updateColour"
      :visible-formats="['hsl']"
    />
    <div class="quantity-control">
      <label for="quantity_mobile">Quantity</label>
      <input
        type="number"
        id="quantity_mobile"
        v-model="quantity"
        min="1"
        max="1000"
      />
    </div>
    <button class="add" @click="addColour">Add</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { ColorPicker, ColorChangeEvent } from "vue-accessible-color-picker"
import { matrixStore } from "../matrixStore"
const store = matrixStore()

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
.container {
  width: 300px;
  display: flex;
  flex-wrap: wrap;
}

.quantity-control {
  width: 145px;
  label {
    height: 22px;
    margin-bottom: 6px;
  }
  input {
    width: 100%;
  }
}

.add {
  width: 145px;
  margin: 28px 0 0 10px;
}
</style>
