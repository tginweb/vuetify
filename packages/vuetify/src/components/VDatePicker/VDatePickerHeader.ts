import './VDatePickerHeader.sass'

// Components
import VBtn from '../VBtn'
import VIcon from '../VIcon'

// Mixins
import Colorable from '../../mixins/colorable'
import Localable from '../../mixins/localable'
import Themeable from '../../mixins/themeable'

// Utils
import { createNativeLocaleFormatter, monthChange } from './util'
import mixins from '../../util/mixins'

// Types
import { VNode } from 'vue'
import { DatePickerFormatter } from './util/createNativeLocaleFormatter'
import { PropValidator } from 'vue/types/options'
import { PickerType } from './VDate'

export default mixins(
  Colorable,
  Localable,
  Themeable
/* @vue/component */
).extend({
  name: 'v-date-picker-header',

  props: {
    disabled: Boolean,
    yearFormat: Function as PropValidator<DatePickerFormatter>,
    monthFormat: Function as PropValidator<DatePickerFormatter>,
    min: String,
    max: String,
    nextIcon: {
      type: String,
      default: '$vuetify.icons.next'
    },
    prevIcon: {
      type: String,
      default: '$vuetify.icons.prev'
    },
    readonly: Boolean,
    value: {
      type: [Number, String],
      required: true
    },
    activePicker: Number as PropValidator<PickerType>
  },

  data () {
    return {
      isReversing: false
    }
  },

  computed: {
    isMonthPicker (): boolean {
      return this.activePicker === PickerType.Month
    },
    isDatePicker (): boolean {
      return this.activePicker === PickerType.Date
    },
    formatter (): DatePickerFormatter {
      switch (this.activePicker) {
        case PickerType.Date: return this.monthFormat
        case PickerType.Month: return this.yearFormat
        default: return v => v
      }
    }
  },

  watch: {
    value (newVal, oldVal) {
      this.isReversing = newVal < oldVal
    }
  },

  methods: {
    genBtn (change: number) {
      const disabled = this.disabled ||
        (change < 0 && this.min && this.calculateChange(change) < this.min) ||
        (change > 0 && this.max && this.calculateChange(change) > this.max)

      return this.$createElement(VBtn, {
        props: {
          dark: this.dark,
          disabled,
          icon: true,
          light: this.light
        },
        nativeOn: {
          click: (e: Event) => {
            e.stopPropagation()
            const newDate = this.calculateChange(change)
            if (this.isDatePicker) this.$emit('update:month', newDate)
            else this.$emit('update:year', newDate)
          }
        }
      }, [
        this.$createElement(VIcon, ((change < 0) === !this.$vuetify.rtl) ? this.prevIcon : this.nextIcon)
      ])
    },
    calculateChange (sign: number) {
      const [year, month] = String(this.value).split('-').map(Number)

      if (month == null) {
        return `${year + sign}`
      } else {
        return monthChange(String(this.value), sign)
      }
    },
    genHeader () {
      const color = !this.disabled && (this.color || 'accent')
      const header = this.$createElement('div', this.setTextColor(color, {
        key: String(this.value)
      }), [this.$createElement('button', {
        attrs: {
          type: 'button'
        },
        on: {
          click: () => this.$emit('update:activePicker', this.isDatePicker ? PickerType.Month : PickerType.Year)
        }
      }, [this.$slots.default || this.formatter(String(this.value))])])

      const transition = this.$createElement('transition', {
        props: {
          name: (this.isReversing === !this.$vuetify.rtl) ? 'tab-reverse-transition' : 'tab-transition'
        }
      }, [header])

      return this.$createElement('div', {
        staticClass: 'v-date-picker-header__value',
        class: {
          'v-date-picker-header__value--disabled': this.disabled
        }
      }, [transition])
    }
  },

  render (): VNode {
    return this.$createElement('div', {
      staticClass: 'v-date-picker-header',
      class: {
        'v-date-picker-header--disabled': this.disabled,
        ...this.themeClasses
      }
    }, [
      this.genBtn(-1),
      this.genHeader(),
      this.genBtn(+1)
    ])
  }
})
