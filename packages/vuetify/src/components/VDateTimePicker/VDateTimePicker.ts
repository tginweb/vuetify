// Styles
import './VDateTimePicker.sass'

// Types
import Vue, { VNode } from 'vue'

// Components
import VPicker from '../VPicker'
import { VTabs, VTab, VTabsItems, VTabItem } from '../VTabs'
import VTime, { Period, Time, SelectMode } from '../VTimePicker/VTime'

// Mixins
import { VDatePickerTitle } from '../VDatePicker'
import { VTimePickerTitle, VTimePickerClock } from '../VTimePicker'
import Colorable from '../../mixins/colorable'
import Themeable from '../../mixins/themeable'

export default Vue.extend({
  name: 'v-date-time-picker',

  props: {
    ...VPicker.options.props,
    ...Colorable.options.props,
    ...Themeable.options.props,
    disabled: Boolean,
    readonly: Boolean,
    clockProps: {
      type: Object,
      default: () => ({
        scrollable: false,
        showAmPmInTitle: false
      })
    }
  },

  data: () => ({
    mode: 1,
    date: '2019-04-01',
    scopedClockProps: null
  }),

  methods: {
    genTabs () {
      const tabs = [
        { text: 'Date' },
        { text: 'Time' }
      ].map(tab => this.$createElement(VTab, {

      }, [tab.text]))

      return this.$createElement(VTabs, {
        props: {
          value: this.mode,
          fixedTabs: true,
          dark: true
        },
        on: {
          change: (v: any) => this.mode = v
        }
      }, tabs)
    },
    genHeaders () {
      const v = this.scopedClockProps || {} as any

      return this.$createElement('div', {
        staticClass: 'v-date-time-picker__headers'
      }, [
        this.$createElement(VDatePickerTitle, {
          props: {
            date: 'Apr 17'
          }
        }),
        this.$createElement(VTimePickerTitle, {
          props: {
            isAmPm: this.clockProps.showAmPmInTitle && v.isAmPm,
            disabled: this.disabled,
            time: v.time,
            period: v.period,
            readonly: this.readonly,
            useSeconds: v.useSeconds,
            selectMode: v.selectMode
          },
          on: {
            'update:selectMode': (m: SelectMode) => v.setSelectMode(m),
            'update:period': (p: Period) => v.setPeriod(p)
          }
        })
      ])
    },
    genDatePicker () {
      return this.$createElement('div')
    },
    genClock (v: any) {
      this.scopedClockProps = v

      return this.$createElement(VTimePickerClock, {
        props: {
          allowedValues: v.allowedValues,
          color: this.color,
          dark: this.dark,
          disabled: this.disabled,
          isAmPm: v.isAmPm,
          light: this.light,
          readonly: this.readonly,
          scrollable: this.clockProps.scrollable,
          showAmPm: !this.clockProps.showAmPmInTitle && v.isAmPm,
          selectMode: v.selectMode,
          time: v.time,
          period: v.period,
          size: 290
        },
        on: {
          'update:period': (p: Period) => v.setPeriod(p),
          'update:time': (t: Time) => v.setTime(t),
          'update:selectMode': (m: SelectMode) => v.setSelectMode(m)
        }
      })
    },
    genTimePicker () {
      return this.$createElement(VTime, {
        props: this.clockProps,
        scopedSlots: {
          default: (v: any) => this.genClock(v)
        }
      })
    },
    genBody () {
      return this.$createElement(VTabsItems, {
        props: {
          value: this.mode
        }
      }, [
        this.$createElement(VTabItem, [this.genDatePicker()]),
        this.$createElement(VTabItem, [this.genTimePicker()])
      ])
    }
  },

  render (h): VNode {
    return h(VPicker, {
      staticClass: 'v-date-time-picker',
      props: {

      }
    }, [
      h('template', { slot: 'title' }, [
        this.genHeaders(),
        this.genTabs()
      ]),
      this.genBody()
    ])
  }
})
