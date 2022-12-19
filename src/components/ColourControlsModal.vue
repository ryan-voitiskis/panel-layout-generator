<template>
  <div class="modal-header">
    <h2>Edit panel colours</h2>
    <button
      class="close icon-only-button"
      @click="store.showColourControls = false"
    >
      <XIcon />
    </button>
  </div>
  <div class="modal-body">
    <div class="colours">
      <ColourSwatch
        v-for="(colour, index) in store.panelColours"
        :colour="colour"
        :index="index"
        :key="index"
      />
    </div>
    <h3 class="center-300">Add a colour</h3>
    <AddColourForm class="center-300" />
  </div>
</template>

<script setup lang="ts">
import XIcon from "../components/icons/XIcon.vue"
import { matrixStore } from "../matrixStore"
import AddColourForm from "./AddColourForm.vue"
import ColourSwatch from "./ColourSwatch.vue"

const store = matrixStore()
</script>

<style lang="scss">
.colours {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
}
.center-300 {
  width: 300px;
  margin: 20px auto;
}
</style>
