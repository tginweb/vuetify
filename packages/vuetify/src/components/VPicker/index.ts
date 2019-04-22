import { CreateElement, VNodeChildren } from 'vue'
import VPicker from './VPicker'
import VPickerBtn from './VPickerBtn'

export function genPickerButton (
  h: CreateElement,
  children: VNodeChildren,
  click: () => void,
  active: Boolean,
  readonly = false,
  staticClass = ''
) {
  return h(VPickerBtn, {
    staticClass,
    props: {
      active,
      readonly
    },
    on: {
      click
    }
  }, children)
}

export { VPicker, VPickerBtn }
export default VPicker
