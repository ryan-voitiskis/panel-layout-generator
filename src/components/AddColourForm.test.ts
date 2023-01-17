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
    setActivePinia(createPinia()) // * https://pinia.vuejs.org/cookbook/testing.html#unit-testing-a-store
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

    // get panelColours length before adding colour
    panelColoursLength = store.panelColours.length
  })

  afterEach(() => {
    wrapper.unmount()
  })

  test("submitting adds colour to store with correct quantity", () => {
    // add colour to store
    quantityInput.setValue(28)
    submitButton.trigger("click")

    // changes to the store are the expected outcomes of the fn, not visual changes
    expect(store.panelColours.length).toBe(panelColoursLength + 1) // test colour is added to store
    expect(store.panelColours[panelColoursLength].quantity).toBe(28) // test colour is added to store with correct quantity
  })

  // test colour is added to store with correct textColour
  // should be #fff for emitted dark colours and #111 for emitted light colours
  test.each([
    { rgb: { r: 0, g: 0, b: 0 }, textColour: "#fff" },
    { rgb: { r: 1, g: 1, b: 1 }, textColour: "#111" },
    { rgb: { r: 0.713, g: 0.358, b: 0.358 }, textColour: "#111" },
    { rgb: { r: 0.702, g: 0.352, b: 0.352 }, textColour: "#fff" },
  ])(
    "should set textColour appropriate to %s when color picker emits %p",
    (data) => {
      // emit colour from colour picker
      wrapper
        .findComponent({ name: "ColorPicker" })
        .vm.$emit("color-change", { colors: { rgb: data.rgb } })

      // click submit button
      submitButton.trigger("click")

      expect(store.panelColours[panelColoursLength].textColour).toBe(
        data.textColour
      )
    }
  )
})
