import { mount, type VueWrapper } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { beforeEach, describe, expect, test } from "vitest"
import ColourControlsModal from "./ColourControlsModal.vue"

describe("ColourControlsModal", () => {
  let wrapper: VueWrapper
  let colourSwatches: VueWrapper[]

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(ColourControlsModal)
    colourSwatches = wrapper.findAllComponents({ name: "ColourSwatch" })
  })

  test("deleting a ColourSwatch removes it", async () => {
    await colourSwatches[0]!.find("button").trigger("click")
    expect(wrapper.findAllComponents({ name: "ColourSwatch" }).length).toBe(
      colourSwatches.length - 1,
    )
  })

  test("adding a colour adds a ColourSwatch", async () => {
    await wrapper
      .findComponent({ name: "AddColourForm" })
      .find("form")
      .trigger("submit")
    expect(wrapper.findAllComponents({ name: "ColourSwatch" }).length).toBe(
      colourSwatches.length + 1,
    )
  })
})
