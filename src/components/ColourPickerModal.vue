<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Pick a colour</h2>
        <button class="close icon-only-button" @click="$emit('close')">
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
        <button class="close" @click="$emit('close')">Close</button>
        <button
          class="add"
          @click="
            $emit('add', {
              colour: colour,
              quantity: quantity,
              quantityUsed: 0,
            })
          "
        >
          Add
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  defineEmits,
  onBeforeUnmount,
  onActivated,
  onDeactivated,
} from "vue"
import XIcon from "../components/icons/XIcon.vue"
import { ColorChangeEvent, ColorPicker } from "vue-accessible-color-picker"
import PanelColour from "../interfaces/PanelColour"

const emit = defineEmits<{
  (e: "close"): void
  (e: "add", panelColour: PanelColour): void
}>()

const colour = ref("hsl(270 100% 50% / 0.8)")
const quantity = ref(1)

function updateColour(eventData: ColorChangeEvent) {
  colour.value = eventData.cssColor
}

function escapeClose(e: KeyboardEvent) {
  if (e.key === "Escape") emit("close")
}

onMounted(() => {
  document.body.addEventListener("keyup", escapeClose)
  document.body.style.overflow = "hidden" // prevent scrolling of body when modal shown
})
onBeforeUnmount(() => {
  document.body.style.overflow = "visible"
  document.body.removeEventListener("keyup", escapeClose)
})

onActivated(() => {
  document.body.addEventListener("keyup", escapeClose)
  document.body.style.overflow = "hidden" // prevent scrolling of body when modal shown
})
onDeactivated(() => {
  document.body.style.overflow = "visible"
  document.body.removeEventListener("keyup", escapeClose)
})
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
    color: var(--darkest-text);
    line-height: 38px;
    margin: 0 20px 0 0;
    span {
      color: var(--dark-text);
      font-size: 16px;
    }
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
