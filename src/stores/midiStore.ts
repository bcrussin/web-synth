import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

export interface MIDIParam {
  displayName: 'Synth Attack'
  type: string
  property: string
  min: number
  max: number
}

export const useMidiStore = defineStore('midi', {
  state: () => ({
    params: [] as MIDIParam[],
  }),

  actions: {
    getParam(name: string) {
      return this.params.find((param: MIDIParam) => {
        return param.displayName == name
      })
    },
    async fetchParams() {
      const response = await fetch(`${import.meta.env.BASE_URL}data/parameters.json`)
      const jsonResponse = await response.json()
      this.params = reactive(jsonResponse) as MIDIParam[]
    },
  },
})
