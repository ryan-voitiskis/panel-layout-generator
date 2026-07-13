<template>
  <div class="modal-header">
    <h2>Edit panel colours</h2>
    <button
      type="button"
      class="close icon-only-button"
      aria-label="Close colour controls"
      @click="store.showColourControls = false"
    >
      <XIcon />
    </button>
  </div>
  <div class="modal-body">
    <div class="colour-list">
      <ColourSwatch
        v-for="(colour, index) in store.panelColours"
        :colour="colour"
        :index="index"
        :key="index"
      />
    </div>
    <h3 class="colour-controls__form">Add a colour</h3>
    <AddColourForm class="colour-controls__form" />
  </div>
</template>

<script setup lang="ts">
  import { useMatrixStore } from "../useMatrixStore"
  import AddColourForm from "./AddColourForm.vue"
  import ColourSwatch from "./ColourSwatch.vue"
  import XIcon from "./icons/XIcon.vue"

  const store = useMatrixStore()
</script>

<style lang="scss" scoped>
  .colour-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
  }
  .colour-controls__form {
    width: 300px;
    margin: 20px auto;
  }
</style>
