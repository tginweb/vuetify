import { VNode, VNodeChildren } from 'vue'
import mixins from '../../util/mixins'
import Colorable from '../../mixins/colorable'
import Themeable from '../../mixins/themeable'
import { VDatePickerProps, DateEventColors } from './VDatePicker'
import VDatePickerHeader from './VDatePickerHeader'
import VDatePickerDateTable from './VDatePickerDateTable'
import VDatePickerMonthTable from './VDatePickerMonthTable'
import VDatePickerYears from './VDatePickerYears'
import { PickerType, DateEvents, getPickerTypeName, VDateFormatters } from './VDate'
import { PropValidator } from 'vue/types/options'
import { pad } from './util'
import Localable from '../../mixins/localable'
import { AllowedDateFunction } from './util/isDateAllowed'

// Adds leading zero to month/day if necessary, returns 'YYYY' if type = 'year',
// 'YYYY-MM' if 'month' and 'YYYY-MM-DD' if 'date'
function sanitizeDateString (dateString: string, type: 'date' | 'month' | 'year'): string {
  const [year, month = 1, date = 1] = dateString.split('-')
  return `${year}-${pad(month)}-${pad(date)}`.substr(0, { date: 10, month: 7, year: 4 }[type])
}

export default mixins(
  Colorable,
  Themeable,
  Localable
).extend({
  name: 'v-date-picker-body',

  inheritAttrs: false,

  props: {
    nextIcon: String,
    prevIcon: String,
    disabled: Boolean,
    readonly: Boolean,
    events: {
      type: [Array, Function, Object],
      default: () => null
    } as any as PropValidator<DateEvents>,
    eventColor: {
      type: [Array, Function, Object, String],
      default: () => 'warning'
    } as any as PropValidator<DateEventColors>,
    scrollable: Boolean,

    showWeekNumbers: Boolean,
    hideCurrentDate: Boolean,
    firstDayOfWeek: {
      type: [String, Number],
      default: 0
    },

    min: String,
    max: String,
    minMonth: String,
    maxMonth: String,
    minYear: String,
    maxYear: String,
    formatters: Object as PropValidator<VDateFormatters>,
    allowedDates: Function as PropValidator<AllowedDateFunction | undefined>,
    tableMonth: String,
    tableDate: String,
    tableYear: String,
    pickerDate: String,
    value: [String, Array] as PropValidator<string | string[]>,

    activePicker: Number as PropValidator<PickerType>
  },

  data () {
    return {
      now: new Date()
    }
  },

  computed: {
    isDatePicker (): boolean {
      return this.activePicker === PickerType.Date
    },
    isMonthPicker (): boolean {
      return this.activePicker === PickerType.Month
    },
    currentDate (): string | null {
      return sanitizeDateString(`${this.now.getFullYear()}-${this.now.getMonth() + 1}-${this.now.getDate()}`, 'date')
    },
    currentMonth (): string | null {
      return sanitizeDateString(`${this.now.getFullYear()}-${this.now.getMonth() + 1}-${this.now.getDate()}`, 'month')
    },
    selectedMonths (): string | string[] | undefined {
      if (!this.value || !this.value.length || this.activePicker === PickerType.Month) {
        return this.value
      } else if (this.multiple) {
        return (this.value as string[]).map(val => val.substr(0, 7))
      } else {
        return (this.value as string).substr(0, 7)
      }
    }
  },

  methods: {
    genTableHeader () {
      return this.$createElement(VDatePickerHeader, {
        props: {
          nextIcon: this.nextIcon,
          color: this.color,
          dark: this.dark,
          disabled: this.disabled,
          yearFormat: this.formatters.year,
          monthFormat: this.formatters.headerMonth,
          light: this.light,
          locale: this.locale,
          min: this.isDatePicker ? this.minMonth : this.minYear,
          max: this.isDatePicker ? this.maxMonth : this.maxYear,
          prevIcon: this.prevIcon,
          readonly: this.readonly,
          activePicker: this.activePicker,
          value: this.tableDate
        },
        on: {
          'update:activePicker': (picker: PickerType) => this.$emit('update:activePicker', picker/* this.isDateType ? PickerType.Month : PickerType.Year */),
          'update:month': (month: string) => this.$emit('update:month', month),
          'update:year': (year: number) => this.$emit('update:year', year)
        }
      })
    },
    genDateTable () {
      return this.$createElement(VDatePickerDateTable, {
        props: {
          allowedDates: this.allowedDates,
          color: this.color,
          currentDate: !this.hideCurrentDate ? this.currentDate : null,
          dark: this.dark,
          disabled: this.disabled,
          events: this.events,
          eventColor: this.eventColor,
          firstDayOfWeek: this.firstDayOfWeek,
          weekdayFormat: this.formatters.weekday,
          dateFormat: this.formatters.date,
          light: this.light,
          locale: this.locale,
          min: this.min,
          max: this.max,
          readonly: this.readonly,
          scrollable: this.scrollable,
          showWeekNumbers: this.showWeekNumbers,
          tableDate: this.tableDate,
          value: this.value
        },
        on: {
          input: (date: number) => this.$emit('update:date', date),
          'update:tableDate': (value: string) => this.$emit('update:tableDate', value),
          'click:date': (value: string) => this.$emit('click:date', value),
          'dblclick:date': (value: string) => this.$emit('dblclick:date', value)
        }
      })
    },
    genMonthTable () {
      return this.$createElement(VDatePickerMonthTable, {
        props: {
          allowedDates: this.allowedDates,
          color: this.color,
          currentMonth: this.currentMonth,
          dark: this.dark,
          disabled: this.disabled,
          events: this.events,
          eventColor: this.eventColor,
          dateFormat: this.formatters.month,
          light: this.light,
          locale: this.locale,
          min: this.minMonth,
          max: this.maxMonth,
          readonly: this.readonly,
          scrollable: this.scrollable,
          value: this.selectedMonths,
          tableDate: this.tableYear // `${pad(this.tableYear, 4)}`
        },
        on: {
          input: (month: number) => this.$emit('update:month', month),
          'update:tableDate': (value: string) => this.$emit('update:tableDate', value),
          'click:month': (value: string) => this.$emit('click:month', value),
          'dblclick:month': (value: string) => this.$emit('dblclick:month', value)
        }
      })
    },
    genYears () {
      return this.$createElement(VDatePickerYears, {
        props: {
          color: this.color,
          format: this.formatters.year,
          locale: this.locale,
          min: this.minYear,
          max: this.maxYear,
          value: this.tableYear
        },
        on: {
          input: (year: number) => this.$emit('update:year', year)
        }
      })
    },
    genMonths () {
      return [
        this.genTableHeader(),
        this.genMonthTable()
      ]
    },
    genDates () {
      return [
        this.genTableHeader(),
        this.genDateTable()
      ]
    }
  },

  render (h): VNode {
    let children: VNodeChildren = []

    switch (this.activePicker) {
      case PickerType.Year: children = [this.genYears()]; break
      case PickerType.Month: children = this.genMonths(); break
      case PickerType.Date: children = this.genDates(); break
    }

    return h('div', children)
  }
})
