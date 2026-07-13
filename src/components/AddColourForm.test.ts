import { type DOMWrapper, mount, type VueWrapper } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { useMatrixStore } from "../useMatrixStore"
import AddColourForm from "./AddColourForm.vue"

describe("AddColourForm", () => {
  let store: ReturnType<typeof useMatrixStore>
  let wrapper: VueWrapper
  let quantityInput: DOMWrapper<Element>
  let panelColoursLength: number

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useMatrixStore()
    wrapper = mount(AddColourForm)
    quantityInput = wrapper.find("#quantity")
    panelColoursLength = store.panelColours.length
  })

  afterEach(() => {
    wrapper.unmount()
  })

  test("submitting adds colour to store", async () => {
    await wrapper.find("form").trigger("submit")
    expect(store.panelColours.length).toBe(panelColoursLength + 1)
  })

  test("submitting adds colour to store with correct quantity", async () => {
    await quantityInput.setValue(128)
    await wrapper.find("form").trigger("submit")
    expect(store.panelColours[panelColoursLength]!.quantity).toBe(128)
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
    async (data) => {
      const mockColor = {
        to: () => ({ coords: data.srgb }),
      }
      wrapper.findComponent({ name: "ColorPicker" }).vm.$emit("color-change", {
        cssColor: "#000",
        color: mockColor,
      })
      await wrapper.find("form").trigger("submit")
      expect(store.panelColours[panelColoursLength]!.textColour).toBe(
        data.textColour,
      )
    },
  )
})
