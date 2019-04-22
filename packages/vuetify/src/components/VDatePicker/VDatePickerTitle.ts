import './VDatePickerTitle.sass'

// Components
import VIcon from '../VIcon'
import { genPickerButton } from '../VPicker'

// Types
import Vue, { VNode } from 'vue'
import { PropValidator } from 'vue/types/options'
import { DatePickerFormatter } from './util/createNativeLocaleFormatter'
import { PickerType } from './VDate'

export default Vue.extend({
  name: 'v-date-picker-title',

  props: {
    dateFormat: Function as PropValidator<DatePickerFormatter>,
    yearFormat: Function as PropValidator<DatePickerFormatter>,
    value: [String, Array] as PropValidator<string | string[]>,
    disabled: Boolean,
    readonly: Boolean,
    selectingYear: Boolean,
    yearIcon: {
      type: String
    }
  },

  data: () => ({
    isReversing: false
  }),

  computed: {
    computedTransition (): string {
      return this.isReversing ? 'picker-reverse-transition' : 'picker-transition'
    },
    date () {
      return (this.dateFormat as (v: any) => string)(this.value) // TODO: Why does function get string & string[] as type?
    },
    year () {
      return this.yearFormat(Array.isArray(this.value) ? this.value[0] : this.value)
    },
    key (): string {
      return Array.isArray(this.value) ? this.value[0] : this.value
    }
  },

  watch: {
    value (val: string, prev: string) {
      this.isReversing = val < prev
    }
  },

  methods: {
    genYearIcon (): VNode {
      return this.$createElement(VIcon, {
        props: {
          dark: true
        }
      }, this.yearIcon)
    },
    getYearBtn (): VNode {
      return genPickerButton(
        this.$createElement,
        [
          String(this.year),
          this.yearIcon ? this.genYearIcon() : null
        ],
        () => this.$emit('update:activePicker', PickerType.Year),
        this.selectingYear === true,
        false,
        'v-date-picker-title__year'
      )
    },
    genTitleText (): VNode {
      return this.$createElement('transition', {
        props: {
          name: this.computedTransition
        }
      }, [
        this.$createElement('div', {
          domProps: { innerHTML: this.date || '&nbsp;' },
          key: this.key
        })
      ])
    },
    genTitleDate (): VNode {
      return genPickerButton(
        this.$createElement,
        [this.genTitleText()],
        () => this.$emit('update:selectingYear', false),
        this.selectingYear === false,
        false,
        'v-date-picker-title__date'
      )
    }
  },

  render (h): VNode {
    return h('div', {
      staticClass: 'v-date-picker-title',
      'class': {
        'v-date-picker-title--disabled': this.disabled
      }
    }, [
      this.getYearBtn(),
      this.genTitleDate()
    ])
  }
})
