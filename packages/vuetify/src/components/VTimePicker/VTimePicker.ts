// Components
import VPicker from '../VPicker'
import VTime, { SelectMode, Time, Period } from './VTime'
import VTimePickerTitle from './VTimePickerTitle'
import VTimePickerClock from './VTimePickerClock'

// Mixins
import Colorable from '../../mixins/colorable'
import Themeable from '../../mixins/themeable'

// Types
import Vue, { VNode } from 'vue'

export default Vue.extend({
  name: 'v-time-picker',

  props: {
    ...VPicker.options.props,
    ...Colorable.options.props,
    ...Themeable.options.props,
    ...VTime.options.props,
    readonly: Boolean,
    disabled: Boolean,
    scrollable: Boolean,
    useSeconds: Boolean,
    showAmPmInTitle: Boolean
  },

  methods: {
    genClock (props: any) {
      return this.$createElement(VTimePickerClock, {
        props: {
          allowedValues: props.allowedValues,
          color: this.color,
          dark: this.dark,
          disabled: this.disabled,
          isAmPm: props.isAmPm,
          light: this.light,
          readonly: this.readonly,
          scrollable: this.scrollable,
          showAmPm: !this.showAmPmInTitle && props.isAmPm,
          selectMode: props.selectMode,
          time: props.time,
          period: props.period,
          size: 290
        },
        on: {
          'update:period': (p: Period) => props.setPeriod(p),
          'update:time': (t: Time) => props.setTime(t),
          'update:selectMode': (m: SelectMode) => props.setSelectMode(m)
        }
      })
    },
    genTitle (props: any) {
      return this.$createElement(VTimePickerTitle, {
        props: {
          isAmPm: this.showAmPmInTitle && props.isAmPm,
          disabled: this.disabled,
          time: props.time,
          period: props.period,
          readonly: this.readonly,
          useSeconds: props.useSeconds,
          selectMode: props.selectMode
        },
        on: {
          'update:selectMode': (m: SelectMode) => props.setSelectMode(m),
          'update:period': (p: Period) => props.setPeriod(p)
        },
        slot: 'title'
      })
    },
    genPicker (props: any) {
      return this.$createElement(VPicker, {
        staticClass: 'v-picker--time',
        props: this.$attrs
      }, [
        this.genTitle(props),
        this.genClock(props)
      ])
    }
  },

  render (h): VNode {
    return h(VTime, {
      props: {
        allowed: this.allowed,
        format: this.format,
        min: this.min,
        max: this.max,
        value: this.value
      },
      scopedSlots: {
        default: (props: any) => this.genPicker(props)
      },
      on: {
        input: (v: string) => this.$emit('input', v)
      }
    })
  }
})
