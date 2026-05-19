import { computed } from 'vue'

export function bindProp<T extends object, K extends keyof T>(obj: T, key: K) {
	return computed({
		get: () => obj[key],
		set: (value) => {
			obj[key] = value
		},
	})
}
