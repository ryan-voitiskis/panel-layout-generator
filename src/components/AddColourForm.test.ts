import { mount, VueWrapper, DOMWrapper } from "@vue/test-utils"
import { describe, test, expect, beforeEach, afterEach } from "vitest"
import AddColourForm from "./AddColourForm.vue"
import { matrixStore } from "../matrixStore"
import { createPinia, setActivePinia } from "pinia"

/*
  AddColourForm.vue is a <script setup> component  
  wrapper.vm.colour has to be cast like this in <script setup> components:
  (wrapper.vm as unknown as { colour: string }).colour because
  https://github.com/vuejs/test-utils/issues/1866
  also defineExport required for directly accessing component props with wrapper.vm
  * note: avoid <script setup> if you want to use vue test utils in this way
*/

describe("AddColourForm", () => {
  let store: ReturnType<typeof matrixStore>
  let wrapper: VueWrapper<any>
  let quantityInput: DOMWrapper<Element>
  let submitButton: DOMWrapper<Element>
  let panelColoursLength: number

  beforeEach(() => {
    setActivePinia(createPinia())
    store = matrixStore()
    wrapper = mount(AddColourForm, {
      global: {
        provide: {
          matrixStore: store,
        },
      },
    })
    quantityInput = wrapper.find("#quantity")
    submitButton = wrapper.find("#add_colour")
    panelColoursLength = store.panelColours.length
  })

  afterEach(() => {
    wrapper.unmount()
  })

  test("submitting adds colour to store", () => {
    submitButton.trigger("click")
    expect(store.panelColours.length).toBe(panelColoursLength + 1)
  })

  test("submitting adds colour to store with correct quantity", () => {
    quantityInput.setValue(128)
    submitButton.trigger("click")
    expect(store.panelColours[panelColoursLength].quantity).toBe(128)
  })

  // test colour is added to store with correct textColour
  // rgb values are in [0, 1] range (sRGB coords from colorjs.io)
  test.each([
    { srgb: [0, 0, 0], textColour: "#fff" },
    { srgb: [1, 1, 1], textColour: "#111" },
    { srgb: [0.713, 0.358, 0.358], textColour: "#111" },
    { srgb: [0.702, 0.352, 0.352], textColour: "#fff" },
  ])(
    "should set textColour appropriate to %s when color picker emits %p",
    (data) => {
      const mockColor = {
        to: () => ({ coords: data.srgb }),
      }
      wrapper
        .findComponent({ name: "ColorPicker" })
        .vm.$emit("color-change", {
          cssColor: "#000",
          color: mockColor,
        })
      submitButton.trigger("click")
      expect(store.panelColours[panelColoursLength].textColour).toBe(
        data.textColour
      )
    }
  )
})
