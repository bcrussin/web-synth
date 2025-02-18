/* eslint-disable @typescript-eslint/no-explicit-any */
export interface MidiChannelOptions {
  param?: string
  min?: number
  max?: number
  inverted?: boolean
}

export default class MidiChannel {
  param: string
  min: number
  max: number
  inverted: boolean

  constructor(options?: MidiChannelOptions) {
    this.param = options?.param ?? ''
    this.min = options?.min ?? 0
    this.max = options?.max ?? 1
    this.inverted = options?.inverted ?? false
  }

  getProperty(property: keyof MidiChannelOptions) {
    return (this as any)[property]
  }

  setProperty<K extends keyof MidiChannelOptions>(property: K, value: MidiChannelOptions[K]) {
    ;(this as any)[property] = value
  }

  setProperties(data: MidiChannelOptions) {
    Object.entries(data).forEach(([key, value]) => {
      ;(this as any)[key] = value
    })
  }
}
