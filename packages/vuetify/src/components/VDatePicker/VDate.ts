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
import { VNode } from 'vue'

export type DateEventColorValue = string | string[]
export type DateEvents = string[] | ((date: string) => boolean | DateEventColorValue) | Record<string, DateEventColorValue>
export type DateEventColors = DateEventColorValue | Record<string, DateEventColorValue> | ((date: string) => DateEventColorValue)
type DatePickerValue = string | string[] | undefined
type DatePickerType = 'date' | 'month'
type DatePickerMultipleFormatter = (date: string[]) => string

export interface VDateFormatters {
  year: DatePickerFormatter
  titleDate: DatePickerFormatter | DatePickerMultipleFormatter
  landscapeTitleDate: DatePickerFormatter | DatePickerMultipleFormatter
  headerDate: DatePickerFormatter
  headerMonth: DatePickerFormatter
  date: DatePickerFormatter
  month: DatePickerFormatter
  weekday: DatePickerFormatter
}

// Adds leading zero to month/day if necessary, returns 'YYYY' if type = 'year',
// 'YYYY-MM' if 'month' and 'YYYY-MM-DD' if 'date'
function sanitizeDateString (dateString: string, type: 'date' | 'month' | 'year'): string {
  const [year, month = 1, date = 1] = dateString.split('-')
  return `${year}-${pad(month)}-${pad(date)}`.substr(0, { date: 10, month: 7, year: 4 }[type])
}

export enum PickerType {
  Year = 0,
  Month = 1,
  Date = 2
}

const PickerTypeNames = <const>['year', 'month', 'date']

export const getPickerTypeName = (pickerType: number) => PickerTypeNames[pickerType]

const substrOptions = { date: 10, month: 7, year: 4 }

const getSubstrOption = <K extends keyof typeof substrOptions>(key: K) => substrOptions[key]

export default mixins(
  Localable
/* @vue/component */
).extend({
  name: 'v-date',

  inheritAttrs: false,

  props: {
    formatters: {
      type: Object,
      default: () => ({})
    } as PropValidator<Partial<VDateFormatters>>,
    allowedDates: Function as PropValidator<AllowedDateFunction | undefined>,
    max: String,
    min: String,
    multiple: Boolean,
    pickerDate: String,
    reactive: Boolean,
    type: {
      type: String,
      default: 'date',
      validator: (type: any) => PickerTypeNames.includes(type) // TODO: year
    } as any as PropValidator<DatePickerType>,
    value: [Array, String] as PropValidator<DatePickerValue>
  },

  data () {
    const now = new Date()
    return {
      internalDate: {
        year: null as number | null,
        month: null as number | null,
        date: null as number | null
      },
      activePicker: PickerTypeNames.findIndex(v => v === this.type),
      inputDay: null as number | null,
      inputMonth: null as number | null,
      inputYear: null as number | null,
      isReversing: false,
      now,
      // tableDate is a string in 'YYYY' / 'YYYY-M' format (leading zero for month is not required)
      tableDate: (() => {
        if (this.pickerDate) {
          return this.pickerDate
        }

        const date = (this.multiple ? (this.value as string[])[(this.value as string[]).length - 1] : this.value) ||
          `${now.getFullYear()}-${now.getMonth() + 1}`

        return sanitizeDateString(date as string, 'month')
      })()
    }
  },

  computed: {
    lastValue (): string | null {
      return this.multiple ? (this.value as string[])[(this.value as string[]).length - 1] : (this.value as string | null)
    },
    selectedMonths (): string | string[] | undefined {
      if (!this.value || !this.value.length || this.type === 'month') {
        return this.value
      } else if (this.multiple) {
        return (this.value as string[]).map(val => val.substr(0, 7))
      } else {
        return (this.value as string).substr(0, 7)
      }
    },
    inputDate (): string {
      return this.type === 'date'
        ? `${this.inputYear}-${pad(this.inputMonth! + 1)}-${pad(this.inputDay!)}`
        : `${this.inputYear}-${pad(this.inputMonth! + 1)}`
    },
    tableMonth (): string {
      return String(Number((this.pickerDate || this.tableDate).split('-')[1]) - 1)
    },
    tableYear (): string {
      return (this.pickerDate || this.tableDate).split('-')[0]
    },
    minMonth (): string | null {
      return this.min ? sanitizeDateString(this.min, 'month') : null
    },
    maxMonth (): string | null {
      return this.max ? sanitizeDateString(this.max, 'month') : null
    },
    minYear (): string | null {
      return this.min ? sanitizeDateString(this.min, 'year') : null
    },
    maxYear (): string | null {
      return this.max ? sanitizeDateString(this.max, 'year') : null
    },
    computedFormatters (): VDateFormatters {
      return {
        year: this.formatters.year || createNativeLocaleFormatter(this.currentLocale, { year: 'numeric', timeZone: 'UTC' }, { length: 4 }),
        titleDate: this.formatters.titleDate || (this.multiple ? this.defaultTitleMultipleDateFormatter : this.defaultTitleDateFormatter),
        landscapeTitleDate: this.formatters.landscapeTitleDate || this.defaultLandscapeTitleDate,
        weekday: this.formatters.weekday || createNativeLocaleFormatter(this.currentLocale, { weekday: 'narrow', timeZone: 'UTC' }) || (v => v),
        date: this.formatters.date || createNativeLocaleFormatter(this.currentLocale, { day: 'numeric', timeZone: 'UTC' }, { start: 8, length: 2 }) || (v => v),
        headerMonth: this.formatters.headerMonth || createNativeLocaleFormatter(this.currentLocale, { month: 'long', year: 'numeric', timeZone: 'UTC' }, { length: 7 }),
        month: this.formatters.month || (v => v),
        headerDate: this.formatters.headerDate || (v => v)
      }
    },
    defaultTitleMultipleDateFormatter (): DatePickerMultipleFormatter {
      if ((this.value as string[]).length < 2) {
        return dates => dates.length ? this.defaultTitleDateFormatter(dates[0]) : '0 selected'
      }

      return dates => `${dates.length} selected`
    },
    defaultTitleDateFormatter (): DatePickerFormatter {
      const titleFormats = {
        year: { year: 'numeric', timeZone: 'UTC' },
        month: { month: 'long', timeZone: 'UTC' },
        date: { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }
      }

      const titleDateFormatter = createNativeLocaleFormatter(this.currentLocale, titleFormats[this.type], {
        start: 0,
        length: getSubstrOption(this.type)
      })

      return titleDateFormatter
    },
    defaultLandscapeTitleDate (): DatePickerFormatter {
      return (date: string) => this.defaultTitleDateFormatter(date)
        .replace(/([^\d\s])([\d])/g, (match, nonDigit, digit) => `${nonDigit} ${digit}`)
        .replace(', ', ',<br>')
    },
    scopedSlotProps (): any {
      return {
        dateClick: this.dateClick,
        monthClick: this.monthClick,
        yearClick: this.yearClick,
        formatters: this.computedFormatters,
        value: this.value,
        activePicker: this.activePicker,
        updateActivePicker: this.updateActivePicker,
        pickerDate: this.pickerDate,
        tableDate: this.tableDate,
        tableMonth: this.tableMonth,
        tableYear: this.tableYear
      }
    }
  },

  watch: {
    tableDate (val: string, prev: string) {
      // Make a ISO 8601 strings from val and prev for comparision, otherwise it will incorrectly
      // compare for example '2000-9' and '2000-10'
      const sanitizeType = this.type === 'month' ? 'year' : 'month'
      this.isReversing = sanitizeDateString(val, sanitizeType) < sanitizeDateString(prev, sanitizeType)
      this.$emit('update:pickerDate', val)
    },
    pickerDate (val: string | null) {
      if (val) {
        this.tableDate = val
      } else if (this.lastValue && this.type === 'date') {
        this.tableDate = sanitizeDateString(this.lastValue, 'month')
      } else if (this.lastValue && this.type === 'month') {
        this.tableDate = sanitizeDateString(this.lastValue, 'year')
      }
    },
    value (newValue: DatePickerValue, oldValue: DatePickerValue) {
      this.checkMultipleProp()
      this.setInputDate()

      if (!this.multiple && this.value && !this.pickerDate) {
        this.tableDate = sanitizeDateString(this.inputDate, this.type === 'month' ? 'year' : 'month')
      } else if (this.multiple && (this.value as string[]).length && !(oldValue as string[]).length && !this.pickerDate) {
        this.tableDate = sanitizeDateString(this.inputDate, this.type === 'month' ? 'year' : 'month')
      }
    },
    type (type: DatePickerType) {
      this.activePicker = PickerTypeNames.findIndex(v => v === type)

      if (this.value && this.value.length) {
        const output = (this.multiple ? (this.value as string[]) : [this.value as string])
          .map((val: string) => sanitizeDateString(val, type))
          .filter(this.isDateAllowed)
        this.$emit('input', this.multiple ? output : output[0])
      }
    }
  },

  created () {
    this.checkMultipleProp()

    if (this.pickerDate !== this.tableDate) {
      this.$emit('update:pickerDate', this.tableDate)
    }
    this.setInputDate()
  },

  methods: {
    updateActivePicker (type: PickerType) {
      this.activePicker = type
    },
    emitInput (newInput: string) {
      console.log('emitInput')
      const output = this.multiple
        ? (
          (this.value as string[]).indexOf(newInput) === -1
            ? (this.value as string[]).concat([newInput])
            : (this.value as string[]).filter(x => x !== newInput)
        )
        : newInput

      this.$emit('input', output)
      this.multiple || this.$emit('change', newInput)
    },
    checkMultipleProp () {
      if (this.value == null) return
      const valueType = this.value.constructor.name
      const expected = this.multiple ? 'Array' : 'String'
      if (valueType !== expected) {
        consoleWarn(`Value must be ${this.multiple ? 'an' : 'a'} ${expected}, got ${valueType}`, this)
      }
    },
    isDateAllowed (value: string) {
      return isDateAllowed(value, this.min, this.max, this.allowedDates)
    },
    yearClick (value: number) {
      this.inputYear = value
      if (this.type === 'month') {
        this.tableDate = `${value}`
      } else {
        console.log('here', this.tableMonth)
        this.tableDate = `${value}-${pad((parseInt(this.tableMonth) || 0) + 1)}`
      }
      this.activePicker = PickerType.Month
      // if (this.reactive && !this.readonly && !this.multiple && this.isDateAllowed(this.inputDate)) {
      //   this.$emit('input', this.inputDate)
      // }
      // TODO: Why not always emit here?
      // if (!this.multiple && this.isDateAllowed(this.inputDate)) {
      //   this.$emit('input', this.inputDate)
      // }
    },
    monthClick (value: string) {
      this.inputYear = parseInt(value.split('-')[0], 10)
      this.inputMonth = parseInt(value.split('-')[1], 10) - 1

      if (this.type === 'date') {
        // if (this.inputDay) {
        //   this.inputDay = Math.min(this.inputDay, daysInMonth(this.inputYear, this.inputMonth + 1))
        // }

        this.tableDate = value
        this.activePicker = PickerType.Date
        // if (this.reactive && !this.readonly && !this.multiple && this.isDateAllowed(this.inputDate)) {
        //   this.$emit('input', this.inputDate)
        // }
        // TODO: Why not always emit here?
        // if (!this.multiple && this.isDateAllowed(this.inputDate)) {
        //   this.$emit('input', this.inputDate)
        // }
      } else {
        // this.emitInput(this.inputDate)
      }
    },
    dateClick (value: string) {
      this.inputYear = parseInt(value.split('-')[0], 10)
      this.inputMonth = parseInt(value.split('-')[1], 10) - 1
      this.inputDay = parseInt(value.split('-')[2], 10)
      this.emitInput(this.inputDate)
    },
    setInputDate () {
      if (this.lastValue) {
        const array = this.lastValue.split('-')
        this.inputYear = parseInt(array[0], 10)
        this.inputMonth = parseInt(array[1], 10) - 1
        if (this.type === 'date') {
          this.inputDay = parseInt(array[2], 10)
        }
      } else {
        this.inputYear = this.inputYear || this.now.getFullYear()
        this.inputMonth = this.inputMonth == null ? this.inputMonth : this.now.getMonth()
        this.inputDay = this.inputDay || this.now.getDate()
      }
    }
  },

  render (): VNode {
    // return this.genPicker('v-picker--date')
    return this.$scopedSlots.default!(this.scopedSlotProps) as any
  }
})
