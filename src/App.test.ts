import { VueWrapper, DOMWrapper, mount } from "@vue/test-utils"
import { describe, test, expect, beforeEach } from "vitest"
import App from "./App.vue"
import { matrixStore } from "./matrixStore"
import { createPinia, setActivePinia } from "pinia"

/*
  App.vue is a <script setup> component  
  wrapper.vm.colour has to be cast like this in <script setup> components:
  (wrapper.vm as unknown as { colour: string }).colour because
  https://github.com/vuejs/test-utils/issues/1866
  also defineExport required for directly accessing component props with wrapper.vm
  * note: avoid <script setup> if you want to use vue test utils in this way
  ! ideally don't test component internals, test behaviour instead
*/

describe("App", () => {
  let store: ReturnType<typeof matrixStore>
  let wrapper: VueWrapper<any>
  let toggleNumbersButton: DOMWrapper<Element>
  let shuffleButton: DOMWrapper<Element>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = matrixStore()
    wrapper = mount(App, {
      global: {
        provide: {
          matrixStore: store,
        },
      },
    })

    toggleNumbersButton = wrapper.find("#toggle_numbers")
    shuffleButton = wrapper.find("#shuffle")
  })

  test("changing number of rows updates store", () => {
    wrapper.find("#number_of_rows").setValue(10)
    expect(store.numberOfRows).toBe(10)
  })

  test("changing number of columns updates store", () => {
    wrapper.find("#number_of_columns").setValue(10)
    expect(store.numberOfColumns).toBe(10)
  })

  test("increasing grid size beyond what panels can cover displays #not_enough_panels_msg", () => {
    wrapper.find("#number_of_rows").setValue(9)
    expect(wrapper.find("#not_enough_panels_msg").exists()).toBe(false)
  })

  test("deleting a ColourSwatch removes it", async () => {
    const colourSwatches = wrapper.findAllComponents({
      name: "ColourSwatch",
    })
    await colourSwatches[0].find("button").trigger("click")
    expect(wrapper.findAllComponents({ name: "ColourSwatch" }).length).toBe(
      colourSwatches.length - 1
    )
  })

  test("adding a colour adds a ColourSwatch", async () => {
    const colourSwatches = wrapper.findAllComponents({
      name: "ColourSwatch",
    })
    await wrapper.find("#open_add_colour").trigger("click")
    await wrapper.find("#add_colour").trigger("click")
    expect(wrapper.findAllComponents({ name: "ColourSwatch" }).length).toBe(
      colourSwatches.length + 1
    )
  })

  test("change quantity of a colour updates store", async () => {
    const colourSwatches = wrapper.findAllComponents({
      name: "ColourSwatch",
    })
    await colourSwatches[0].find("input").setValue(10)
    expect(store.panelColours[0].quantity).toBe(10)
  })

  test("toggle numbers button toggles numbers", async () => {
    await toggleNumbersButton.trigger("click")
    let matrixPanels = wrapper
      .findComponent({ name: "PanelMatrix" })
      .findAll('[data-test="panel"]')
    matrixPanels.forEach((panel) => {
      expect(panel.find("svg").exists()).toBe(true)
    })
    await toggleNumbersButton.trigger("click")
    matrixPanels.forEach((panel) => {
      expect(panel.find("svg").exists()).toBe(false)
    })
  })

  test("shuffle button shuffles panels", async () => {
    const coloursFromPanelMatrix = wrapper
      .findComponent({ name: "PanelMatrix" })
      .findAll('[data-test="panel"]')
      .map((panel) => panel.attributes("style"))
    await shuffleButton.trigger("click")
    const newColoursFromPanelMatrix = wrapper
      .findComponent({ name: "PanelMatrix" })
      .findAll('[data-test="panel"]')
      .map((panel) => panel.attributes("style"))
    expect(coloursFromPanelMatrix).not.toEqual(newColoursFromPanelMatrix)
  })
})
