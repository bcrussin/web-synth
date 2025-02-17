/* eslint-disable @typescript-eslint/no-explicit-any */
import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

export const useMidiStore = defineStore('midi', {
  state: () => ({
    params: [] as any,
  }),

  actions: {
    getParam(name: string) {
      return this.params.find((param: any) => {
        return param.displayName == name
      })
    },
    async fetchParams() {
      const response = await fetch(`${import.meta.env.BASE_URL}data/parameters.json`)
      const jsonResponse = await response.json()
      this.params = reactive(jsonResponse) as any
    },
  },
})
