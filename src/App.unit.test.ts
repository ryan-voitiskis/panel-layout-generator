import { VueWrapper, DOMWrapper, mount } from "@vue/test-utils"
import { describe, test, expect, beforeEach, afterEach } from "vitest"
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
*/

describe("App", () => {
  let store: ReturnType<typeof matrixStore>
  let wrapper: VueWrapper<any>

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
  })

  afterEach(() => {
    wrapper.unmount()
  })

  // logic of notEnoughVariety state is tested in matrixStore.test.ts
  test("not enough variety msg is displayed when store.notEnoughVariety is true", async () => {
    expect(wrapper.find("#not_enough_variety_msg").exists()).toBe(false)
    await (store.notEnoughVariety = true)
    expect(wrapper.find("#not_enough_variety_msg").exists()).toBe(true)
  })

  // logic of generateFailed state is impractical to test as it shouldn't occur in normal use.
  // manual testing of this state has been done.
  // generateFailed is a possibility, as a limit of 1000 attempts is set to generate a matrix.
  // if this limit is reached, generateFailed is set to true.
  test("generate failed msg is displayed when store.generateFailed is true", async () => {
    expect(wrapper.find("#generate_failed_msg").exists()).toBe(false)
    await (store.generateFailed = true)
    expect(wrapper.find("#generate_failed_msg").exists()).toBe(true)
  })
})
