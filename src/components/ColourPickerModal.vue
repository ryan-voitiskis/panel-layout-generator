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
    <AddColourForm />
  </div>
</template>

<script setup lang="ts">
import XIcon from "../components/icons/XIcon.vue"
import { matrixStore } from "../matrixStore"
import AddColourForm from "./AddColourForm.vue"
const store = matrixStore()
</script>

<style lang="scss">
.vacp-color-picker {
  padding: 0;
  margin-bottom: 20px;
}
</style>
