import { toRef } from 'vue'
import type Parameter from '@/classes/Parameter'

export function useParameter(parameter: Parameter) {
	return {
		value: toRef(parameter, 'value'),
		baseValue: toRef(parameter, 'baseValue'),
		min: toRef(parameter, 'min'),
		max: toRef(parameter, 'max'),
	}
}
