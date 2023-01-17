import { VueWrapper, DOMWrapper, mount } from "@vue/test-utils"
import { describe, test, expect, beforeEach, afterEach } from "vitest"
import App from "./App.vue"
import { matrixStore } from "./matrixStore"
import { createPinia, setActivePinia } from "pinia"

describe("App", () => {
  let store: ReturnType<typeof matrixStore>
  let wrapper: VueWrapper<any>
  let toggleNumbersButton: DOMWrapper<Element>
  let shuffleButton: DOMWrapper<Element>
  let rowsInput: DOMWrapper<HTMLInputElement>
  let columnsInput: DOMWrapper<HTMLInputElement>
  let grid: DOMWrapper<Element>

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
    rowsInput = wrapper.find("#number_of_rows")
    columnsInput = wrapper.find("#number_of_columns")
    grid = wrapper.find("#grid")
  })

  afterEach(() => {
    wrapper.unmount()
  })

  test("changing number of rows input updates panel matrix", async () => {
    const rowsBeforeChange = grid.find(".column").findAll(".panel").length
    expect(rowsBeforeChange).toBe(rowsInput.element.valueAsNumber)
    await rowsInput.setValue(rowsBeforeChange - 1)
    const rowsAfterChange = grid.find(".column").findAll(".panel").length
    expect(rowsAfterChange).toBe(rowsBeforeChange - 1)
  })

  test("changing number of columns input updates panel matrix", async () => {
    const columnsBeforeChange = grid.findAll(".column").length
    expect(columnsBeforeChange).toBe(columnsInput.element.valueAsNumber)
    await columnsInput.setValue(columnsBeforeChange - 1)
    const columnsAfterChange = grid.findAll(".column").length
    expect(columnsAfterChange).toBe(columnsBeforeChange - 1)
  })

  test("increasing grid size beyond what panels can cover displays #not_enough_panels_msg", async () => {
    expect(wrapper.find("#not_enough_panels_msg").exists()).toBe(false)
    const totalAvailablePanels = store.panelColours.reduce(
      (total, colour) => total + colour.quantity,
      0
    )
    const newGridSize = Math.ceil(Math.sqrt(totalAvailablePanels))
    await rowsInput.setValue(newGridSize)
    await columnsInput.setValue(newGridSize + 1)
    expect(wrapper.find("#not_enough_panels_msg").exists()).toBe(true)
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

  test("clicking add colour button opens ColourPickerModal", async () => {
    expect(wrapper.findComponent({ name: "ColourPickerModal" }).exists()).toBe(
      false
    )
    await wrapper.find("#open_add_colour").trigger("click")
    expect(wrapper.findComponent({ name: "ColourPickerModal" }).exists()).toBe(
      true
    )
  })

  test("clicking close button on ColourPickerModal closes it", async () => {
    await wrapper.find("#open_add_colour").trigger("click")
    expect(wrapper.findComponent({ name: "ColourPickerModal" }).exists()).toBe(
      true
    )
    await wrapper
      .findComponent({ name: "ColourPickerModal" })
      .find(".close")
      .trigger("click")
    expect(wrapper.findComponent({ name: "ColourPickerModal" }).exists()).toBe(
      false
    )
  })

  test("esc key closes ColourPickerModal", async () => {
    await wrapper.find("#open_add_colour").trigger("click")
    expect(wrapper.findComponent({ name: "ColourPickerModal" }).exists()).toBe(
      true
    )
    await document.body.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape" })
    )
    expect(wrapper.findComponent({ name: "ColourPickerModal" }).exists()).toBe(
      false
    )
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

  test("clicking info button opens about modal", async () => {
    expect(wrapper.findComponent({ name: "AboutModal" }).exists()).toBe(false)
    await wrapper.find("#open_about").trigger("click")
    expect(wrapper.findComponent({ name: "AboutModal" }).exists()).toBe(true)
  })

  test("clicking close button on about modal closes about modal", async () => {
    await wrapper.find("#open_about").trigger("click")
    expect(wrapper.findComponent({ name: "AboutModal" }).exists()).toBe(true)
    await wrapper
      .findComponent({ name: "AboutModal" })
      .find(".close")
      .trigger("click")
    expect(wrapper.findComponent({ name: "AboutModal" }).exists()).toBe(false)
  })

  test("esc key closes about modal", async () => {
    await wrapper.find("#open_about").trigger("click")
    expect(wrapper.findComponent({ name: "AboutModal" }).exists()).toBe(true)
    await document.body.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape" })
    )
    expect(wrapper.findComponent({ name: "AboutModal" }).exists()).toBe(false)
  })

  test("esc key closes ColourControlsModal", async () => {
    await wrapper.find("#open_edit_colours").trigger("click")
    expect(
      wrapper.findComponent({ name: "ColourControlsModal" }).exists()
    ).toBe(true)
    await document.body.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape" })
    )
    expect(
      wrapper.findComponent({ name: "ColourControlsModal" }).exists()
    ).toBe(false)
  })
})
