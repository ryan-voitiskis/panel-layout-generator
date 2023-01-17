import { VueWrapper, mount } from "@vue/test-utils"
import { describe, test, expect, beforeEach } from "vitest"
import ColourControlsModal from "./ColourControlsModal.vue"
import { matrixStore } from "../matrixStore"
import { createPinia, setActivePinia } from "pinia"

/*
  ColourControlsModal.vue is a <script setup> component  
  wrapper.vm.colour has to be cast like this in <script setup> components:
  (wrapper.vm as unknown as { colour: string }).colour because
  https://github.com/vuejs/test-utils/issues/1866
  also defineExport required for directly accessing component props with wrapper.vm
  * note: avoid <script setup> if you want to use vue test utils in this way
*/

describe("ColourControlsModal", () => {
  let store: ReturnType<typeof matrixStore>
  let wrapper: VueWrapper<any>
  let colourSwatches: VueWrapper<any>[]

  beforeEach(() => {
    // * https://pinia.vuejs.org/cookbook/testing.html#unit-testing-a-store
    setActivePinia(createPinia())
    store = matrixStore()
    wrapper = mount(ColourControlsModal, {
      global: {
        provide: {
          matrixStore: store,
        },
      },
    })
    colourSwatches = wrapper.findAllComponents({ name: "ColourSwatch" })
  })

  test("deleting a ColourSwatch removes it", async () => {
    await colourSwatches[0].find("button").trigger("click")
    expect(wrapper.findAllComponents({ name: "ColourSwatch" }).length).toBe(
      colourSwatches.length - 1
    )
  })

  test("adding a colour adds a ColourSwatch", async () => {
    await wrapper
      .findComponent({ name: "AddColourForm" })
      .find("#add_colour")
      .trigger("click")
    expect(wrapper.findAllComponents({ name: "ColourSwatch" }).length).toBe(
      colourSwatches.length + 1
    )
  })

  test("change quantity of a colour updates store", async () => {
    await colourSwatches[0].find("input").setValue(10)
    expect(store.panelColours[0].quantity).toBe(10)
  })
})
