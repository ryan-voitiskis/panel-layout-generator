<template>
  <div class="modal-header">
    <h2>Pick a colour</h2>
    <button
      type="button"
      class="close icon-only-button"
      aria-label="Close colour picker"
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
  import { useMatrixStore } from "../useMatrixStore"
  import AddColourForm from "./AddColourForm.vue"
  import XIcon from "./icons/XIcon.vue"

  const store = useMatrixStore()
</script>

<style lang="scss" scoped>
  :deep(.vacp-color-picker) {
    padding: 0;
    margin-bottom: 20px;
  }
</style>
