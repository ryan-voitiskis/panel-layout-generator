<template>
  <form class="add-colour-form" @submit.prevent="addColour">
    <ColorPicker
      alpha-channel="hide"
      :color="colour"
      :visible-formats="['hex']"
      @color-change="updateColour"
    />
    <div class="quantity-control">
      <label for="quantity">Quantity</label>
      <input
        id="quantity"
        v-model.number="quantity"
        type="number"
        min="1"
        max="1000"
      />
    </div>
    <button id="add_colour" type="submit" class="add">Add</button>
  </form>
</template>

<script setup lang="ts">
  import { ref } from "vue"
  import {
    ColorPicker,
    type ColorChangeDetail,
  } from "vue-accessible-color-picker"
  import "vue-accessible-color-picker/styles"
  import { useMatrixStore } from "../useMatrixStore"

  const store = useMatrixStore()

  const colour = ref("#ffa7ef")
  const textColour = ref("#111")
  const quantity = ref(1)

  function addColour() {
    store.addColour({
      colour: colour.value,
      textColour: textColour.value,
      quantity: quantity.value,
      quantityUsed: 0,
    })
  }

  // function to determine the luminance of a colour
  // https://stackoverflow.com/a/56678483/7259172
  function luminance(r: number, g: number, b: number): number {
    const linearise = (value: number) =>
      value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)

    return linearise(r) * 0.2126 + linearise(g) * 0.7152 + linearise(b) * 0.0722
  }

  function updateColour(eventData: ColorChangeDetail) {
    colour.value = eventData.cssColor
    const [r, g, b] = eventData.color.to("srgb").coords as [
      number,
      number,
      number,
    ]
    const luminanceValue = luminance(r, g, b)
    textColour.value = luminanceValue > 0.179 ? "#111" : "#fff"
  }
</script>

<style lang="scss" scoped>
  .add-colour-form {
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
