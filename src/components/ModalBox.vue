<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal" role="dialog" aria-modal="true" :aria-label="label">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onBeforeUnmount, onActivated, onDeactivated } from "vue"

  export interface Props {
    label: string
    width?: string
  }

  withDefaults(defineProps<Props>(), {
    width: "440px",
  })

  const emit = defineEmits<{
    close: []
  }>()

  let isActive = false
  let previousBodyOverflow = ""

  function escapeClose(event: KeyboardEvent) {
    if (event.key === "Escape") emit("close")
  }

  function activateModal() {
    if (isActive) return

    isActive = true
    previousBodyOverflow = document.body.style.overflow
    document.body.addEventListener("keydown", escapeClose)
    document.body.style.overflow = "hidden"
  }

  function deactivateModal() {
    if (!isActive) return

    isActive = false
    document.body.style.overflow = previousBodyOverflow
    document.body.removeEventListener("keydown", escapeClose)
  }

  onMounted(activateModal)
  onActivated(activateModal)
  onDeactivated(deactivateModal)
  onBeforeUnmount(deactivateModal)
</script>

<style lang="scss">
  .modal-backdrop {
    position: fixed;
    background: hsla(0, 0%, 0%, 0.5);
    backdrop-filter: blur(4px);
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99;
    .modal {
      max-height: 100%;
      background-color: #fff;
      transition:
        background-color 200ms,
        color 200ms;
      border-radius: 10px;
      z-index: 100;
      display: flex;
      flex-direction: column;
      width: v-bind(width);
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
      padding: 0 8px;
    }
  }

  .modal-body {
    padding: 0 40px;
    margin-bottom: 40px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .modal-footer {
    margin-top: -20px;
    gap: 20px;
    padding: 20px 40px;
    width: 100%;
    display: flex;
    justify-content: end;
    border-radius: 0 0 10px 10px;
    button[type="reset"] {
      margin-right: auto;
    }
    button.primary {
      margin-top: unset;
    }
  }

  @media screen and (max-width: 768px) {
    .modal-backdrop {
      .modal {
        width: 100%;
        margin: 0;
        border-radius: 0;
      }
    }
    .modal-header {
      display: grid;
      grid-template-columns: 1fr auto;
      padding: 20px 10px;
    }
    .modal-body {
      margin: 0;
      padding: 0 10px;
    }
    .modal-footer {
      display: none;
    }
  }
</style>
