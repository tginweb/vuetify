// Components
import VDatePickerTitle from './VDatePickerTitle'
import VDatePickerHeader from './VDatePickerHeader'
import VDatePickerDateTable from './VDatePickerDateTable'
import VDatePickerMonthTable from './VDatePickerMonthTable'
import VDatePickerYears from './VDatePickerYears'

// Mixins
import Localable from '../../mixins/localable'

// Utils
import { pad, createNativeLocaleFormatter } from './util'
import isDateAllowed, { AllowedDateFunction } from './util/isDateAllowed'
import { consoleWarn } from '../../util/console'
import { daysInMonth } from '../VCalendar/util/timestamp'
import mixins from '../../util/mixins'

// Types
import { PropValidator } from 'vue/types/options'
import { DatePickerFormatter } from './util/createNativeLocaleFormatter'
import Vue, { VNode } from 'vue'
import VPicker from '../VPicker'
import VDate, { PickerType } from './VDate'
import VDatePickerBody from './VDatePickerBody'

export type DateEventColorValue = string | string[]
export type DateEvents = string[] | ((date: string) => boolean | DateEventColorValue) | Record<string, DateEventColorValue>
export type DateEventColors = DateEventColorValue | Record<string, DateEventColorValue> | ((date: string) => DateEventColorValue)
type DatePickerValue = string | string[] | undefined
type DatePickerType = 'date' | 'month'
type DatePickerMultipleFormatter = (date: string[]) => string
interface Formatters {
  year: DatePickerFormatter
  titleDate: DatePickerFormatter | DatePickerMultipleFormatter
}

export const VDatePickerProps = {
  disabled: Boolean,
  nextIcon: {
    type: String,
    default: '$vuetify.icons.next'
  },
  pickerDate: String,
  prevIcon: {
    type: String,
    default: '$vuetify.icons.prev'
  },
  reactive: Boolean,
  readonly: Boolean,
  scrollable: Boolean,
  showCurrent: {
    type: [Boolean, String],
    default: true
  },
  showWeek: Boolean,
  value: [Array, String] as PropValidator<DatePickerValue>,
  yearIcon: String
}

export default Vue.extend({
  name: 'v-date-picker',

  inheritAttrs: false,

  props: {
    ...VPicker.options.props,
    ...VDate.options.props,
    ...Localable.options.props,
    ...VDatePickerProps
  },

  data () {
    return {

    }
  },

  computed: {
    // lastValue (): string | null {
    //   return this.multiple ? (this.value as string[])[(this.value as string[]).length - 1] : (this.value as string | null)
    // },
    // selectedMonths (): string | string[] | undefined {
    //   if (!this.value || !this.value.length || this.type === 'month') {
    //     return this.value
    //   } else if (this.multiple) {
    //     return (this.value as string[]).map(val => val.substr(0, 7))
    //   } else {
    //     return (this.value as string).substr(0, 7)
    //   }
    // },
    // current (): string | null {
    //   if (this.showCurrent === true) {
    //     return sanitizeDateString(`${this.now.getFullYear()}-${this.now.getMonth() + 1}-${this.now.getDate()}`, this.type)
    //   }

    //   return this.showCurrent || null
    // },
    // inputDate (): string {
    //   return this.type === 'date'
    //     ? `${this.inputYear}-${pad(this.inputMonth! + 1)}-${pad(this.inputDay!)}`
    //     : `${this.inputYear}-${pad(this.inputMonth! + 1)}`
    // },
    // tableMonth (): number {
    //   return Number((this.pickerDate || this.tableDate).split('-')[1]) - 1
    // },
    // tableYear (): number {
    //   return Number((this.pickerDate || this.tableDate).split('-')[0])
    // },
    // minMonth (): string | null {
    //   return this.min ? sanitizeDateString(this.min, 'month') : null
    // },
    // maxMonth (): string | null {
    //   return this.max ? sanitizeDateString(this.max, 'month') : null
    // },
    // minYear (): string | null {
    //   return this.min ? sanitizeDateString(this.min, 'year') : null
    // },
    // maxYear (): string | null {
    //   return this.max ? sanitizeDateString(this.max, 'year') : null
    // }
  },

  watch: {
    // tableDate (val: string, prev: string) {
    //   // Make a ISO 8601 strings from val and prev for comparision, otherwise it will incorrectly
    //   // compare for example '2000-9' and '2000-10'
    //   const sanitizeType = this.type === 'month' ? 'year' : 'month'
    //   this.isReversing = sanitizeDateString(val, sanitizeType) < sanitizeDateString(prev, sanitizeType)
    //   this.$emit('update:pickerDate', val)
    // },
    // pickerDate (val: string | null) {
    //   if (val) {
    //     this.tableDate = val
    //   } else if (this.lastValue && this.type === 'date') {
    //     this.tableDate = sanitizeDateString(this.lastValue, 'month')
    //   } else if (this.lastValue && this.type === 'month') {
    //     this.tableDate = sanitizeDateString(this.lastValue, 'year')
    //   }
    // },
    // value (newValue: DatePickerValue, oldValue: DatePickerValue) {
    //   this.checkMultipleProp()
    //   this.setInputDate()

    //   if (!this.multiple && this.value && !this.pickerDate) {
    //     this.tableDate = sanitizeDateString(this.inputDate, this.type === 'month' ? 'year' : 'month')
    //   } else if (this.multiple && (this.value as string[]).length && !(oldValue as string[]).length && !this.pickerDate) {
    //     this.tableDate = sanitizeDateString(this.inputDate, this.type === 'month' ? 'year' : 'month')
    //   }
    // },
    // type (type: DatePickerType) {
    //   this.activePicker = type.toUpperCase()

    //   if (this.value && this.value.length) {
    //     const output = (this.multiple ? (this.value as string[]) : [this.value as string])
    //       .map((val: string) => sanitizeDateString(val, type))
    //       .filter(this.isDateAllowed)
    //     this.$emit('input', this.multiple ? output : output[0])
    //   }
    // }
  },

  // created () {
  //   this.checkMultipleProp()

  //   if (this.pickerDate !== this.tableDate) {
  //     this.$emit('update:pickerDate', this.tableDate)
  //   }
  //   this.setInputDate()
  // },

  methods: {
    // emitInput (newInput: string) {
    //   const output = this.multiple
    //     ? (
    //       (this.value as string[]).indexOf(newInput) === -1
    //         ? (this.value as string[]).concat([newInput])
    //         : (this.value as string[]).filter(x => x !== newInput)
    //     )
    //     : newInput

    //   this.$emit('input', output)
    //   this.multiple || this.$emit('change', newInput)
    // },
    // checkMultipleProp () {
    //   if (this.value == null) return
    //   const valueType = this.value.constructor.name
    //   const expected = this.multiple ? 'Array' : 'String'
    //   if (valueType !== expected) {
    //     consoleWarn(`Value must be ${this.multiple ? 'an' : 'a'} ${expected}, got ${valueType}`, this)
    //   }
    // },
    // isDateAllowed (value: string) {
    //   return isDateAllowed(value, this.min, this.max, this.allowedDates)
    // },
    // yearClick (value: number) {
    //   this.inputYear = value
    //   if (this.type === 'month') {
    //     this.tableDate = `${value}`
    //   } else {
    //     this.tableDate = `${value}-${pad((this.tableMonth || 0) + 1)}`
    //   }
    //   this.activePicker = 'MONTH'
    //   if (this.reactive && !this.readonly && !this.multiple && this.isDateAllowed(this.inputDate)) {
    //     this.$emit('input', this.inputDate)
    //   }
    // },
    // monthClick (value: string) {
    //   this.inputYear = parseInt(value.split('-')[0], 10)
    //   this.inputMonth = parseInt(value.split('-')[1], 10) - 1
    //   if (this.type === 'date') {
    //     if (this.inputDay) {
    //       this.inputDay = Math.min(this.inputDay, daysInMonth(this.inputYear, this.inputMonth + 1))
    //     }

    //     this.tableDate = value
    //     this.activePicker = 'DATE'
    //     if (this.reactive && !this.readonly && !this.multiple && this.isDateAllowed(this.inputDate)) {
    //       this.$emit('input', this.inputDate)
    //     }
    //   } else {
    //     this.emitInput(this.inputDate)
    //   }
    // },
    // dateClick (value: string) {
    //   this.inputYear = parseInt(value.split('-')[0], 10)
    //   this.inputMonth = parseInt(value.split('-')[1], 10) - 1
    //   this.inputDay = parseInt(value.split('-')[2], 10)
    //   this.emitInput(this.inputDate)
    // },
    genPickerTitle (props: any) {
      return this.$createElement(VDatePickerTitle, {
        props: {
          dateFormat: props.formatters.titleDate,
          yearFormat: props.formatters.year,
          value: props.value,
          disabled: this.disabled,
          readonly: this.readonly,
          selectingYear: props.type === PickerType.Year,
          yearIcon: this.yearIcon
        },
        slot: 'title',
        on: {
          'update:activePicker': props.updateActivePicker /* props.activePicker = value ? 'YEAR' : this.type.toUpperCase() */
        }
      })
    },
    genPickerBody (props: any) {
      // const children = this.activePicker === 'YEAR' ? [
      //   this.genYears()
      // ] : [
      //   this.genTableHeader(),
      //   this.activePicker === 'DATE' ? this.genDateTable() : this.genMonthTable()
      // ]

      // return this.$createElement('div', {
      //   key: this.activePicker
      // }, children)
      return this.$createElement(VDatePickerBody, {
        props: {
          ...this.$props,
          ...props
        },
        on: {
          'update:year': props.yearClick,
          'update:month': props.monthClick,
          'update:date': props.dateClick,
          'update:activePicker': props.updateActivePicker
        }
      })
    },
    genPicker (props: any) {
      return this.$createElement(VPicker, {
        staticClass: 'v-picker--date',
        props: this.$props
      }, [
        this.genPickerTitle(props),
        this.genPickerBody(props)
      ])
    }
    // setInputDate () {
    //   if (this.lastValue) {
    //     const array = this.lastValue.split('-')
    //     this.inputYear = parseInt(array[0], 10)
    //     this.inputMonth = parseInt(array[1], 10) - 1
    //     if (this.type === 'date') {
    //       this.inputDay = parseInt(array[2], 10)
    //     }
    //   } else {
    //     this.inputYear = this.inputYear || this.now.getFullYear()
    //     this.inputMonth = this.inputMonth == null ? this.inputMonth : this.now.getMonth()
    //     this.inputDay = this.inputDay || this.now.getDate()
    //   }
    // }
  },

  render (h): VNode {
    return h(VDate, {
      props: this.$props,
      scopedSlots: {
        default: (props: any) => this.genPicker(props)
      },
      on: {
        input: (date: string) => this.$emit('input', date)
      }
    })
  }
})
