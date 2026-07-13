import { mount, type VueWrapper } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { beforeEach, describe, expect, test } from "vitest"
import { useMatrixStore } from "../useMatrixStore"
import ColourControlsModal from "./ColourControlsModal.vue"

describe("ColourSwatch", () => {
  let store: ReturnType<typeof useMatrixStore>
  let wrapper: VueWrapper
  let colourSwatches: VueWrapper[]

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useMatrixStore()
    wrapper = mount(ColourControlsModal)
    colourSwatches = wrapper.findAllComponents({ name: "ColourSwatch" })
  })

  test("change quantity of a colour updates store", async () => {
    await colourSwatches[0]!.find("input").setValue(10)
    expect(store.panelColours[0]!.quantity).toBe(10)
  })
})
