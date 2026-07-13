import { mount, type VueWrapper } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { nextTick } from "vue"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import App from "./App.vue"
import { useMatrixStore } from "./useMatrixStore"

describe("App", () => {
  let store: ReturnType<typeof useMatrixStore>
  let wrapper: VueWrapper

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useMatrixStore()
    wrapper = mount(App)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  test("not enough variety msg is displayed when store.notEnoughVariety is true", async () => {
    expect(wrapper.find("#not_enough_variety_msg").exists()).toBe(false)
    store.notEnoughVariety = true
    await nextTick()
    expect(wrapper.find("#not_enough_variety_msg").exists()).toBe(true)
  })

  test("generate failed msg is displayed when store.generateFailed is true", async () => {
    expect(wrapper.find("#generate_failed_msg").exists()).toBe(false)
    store.generateFailed = true
    await nextTick()
    expect(wrapper.find("#generate_failed_msg").exists()).toBe(true)
  })
})
