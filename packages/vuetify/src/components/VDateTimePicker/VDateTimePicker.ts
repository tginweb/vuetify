// Styles
import './VDateTimePicker.sass'

// Types
import Vue, { VNode } from 'vue'

// Components
import VPicker from '../VPicker'
import { VTabs, VTab, VTabsItems, VTabItem } from '../VTabs'
import VTime, { Period, Time, SelectMode } from '../VTimePicker/VTime'
import VDate, { PickerType } from '../VDatePicker/VDate'
import VDatePickerBody from '../VDatePicker/VDatePickerBody'

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
    timeProps: {
      type: Object,
      default: () => ({
        scrollable: false,
        showAmPmInTitle: false
      })
    },
    dateProps: {
      type: Object,
      default: () => ({})
    }
  },

  data: () => ({
    mode: 0,
    date: '2019-04-01',
    scopedTimeProps: null,
    scopedDateProps: null
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
      const timeProps = this.scopedTimeProps || {} as any
      // TODO: We need some sane defaults here because
      // scoped data props are not available on first render
      const dateProps = this.scopedDateProps || {
        formatters: {
          year: (v: string) => v,
          titleDate: (v: string) => v,
          landscapeTitleDate: (v: string) => v,
          headerDate: (v: string) => v
        },
        updateActivePicker: () => {}
      } as any

      return this.$createElement('div', {
        staticClass: 'v-date-time-picker__headers'
      }, [
        this.$createElement(VDatePickerTitle, {
          props: {
            value: dateProps.value,
            disabled: this.disabled,
            readonly: this.readonly,
            yearIcon: this.dateProps.yearIcon,
            selectingYear: dateProps.type === PickerType.Year,
            dateFormat: this.landscape ? dateProps.formatters.landscapeTitleDate : dateProps.formatters.titleDate,
            yearFormat: dateProps.formatters.year
          },
          on: {
            'update:activePicker': dateProps.updateActivePicker
          }
        }),
        this.$createElement(VTimePickerTitle, {
          props: {
            isAmPm: this.timeProps.showAmPmInTitle && timeProps.isAmPm,
            disabled: this.disabled,
            time: timeProps.time,
            period: timeProps.period,
            readonly: this.readonly,
            useSeconds: timeProps.useSeconds,
            selectMode: timeProps.selectMode
          },
          on: {
            'update:selectMode': (m: SelectMode) => timeProps.setSelectMode(m),
            'update:period': (p: Period) => timeProps.setPeriod(p)
          }
        })
      ])
    },
    genDatePicker () {
      return this.$createElement(VDate, {
        props: {
          ...this.dateProps,
          value: this.date
        },
        on: {
          input: (date: string) => this.date = date
        },
        scopedSlots: {
          default: (props: any) => {
            this.scopedDateProps = props
            return this.$createElement(VDatePickerBody, {
              props: {
                ...this.dateProps,
                ...props
              },
              on: {
                'update:year': props.yearClick,
                'update:month': props.monthClick,
                'update:date': props.dateClick,
                'update:activePicker': props.updateActivePicker
              }
            })
          }
        }
      })
    },
    genClock (v: any) {
      this.scopedTimeProps = v

      return this.$createElement(VTimePickerClock, {
        props: {
          allowedValues: v.allowedValues,
          color: this.color,
          dark: this.dark,
          disabled: this.disabled,
          isAmPm: v.isAmPm,
          light: this.light,
          readonly: this.readonly,
          scrollable: this.timeProps.scrollable,
          showAmPm: !this.timeProps.showAmPmInTitle && v.isAmPm,
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
        props: this.timeProps,
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
        this.$createElement(VTabItem, { props: { eager: true } }, [this.genDatePicker()]),
        this.$createElement(VTabItem, { props: { eager: true } }, [this.genTimePicker()])
      ])
    }
  },

  render (h): VNode {
    return h(VPicker, {
      staticClass: 'v-date-time-picker',
      props: this.$props
    }, [
      h('template', { slot: 'title' }, [
        this.genHeaders(),
        this.genTabs()
      ]),
      this.genBody()
    ])
  }
})
