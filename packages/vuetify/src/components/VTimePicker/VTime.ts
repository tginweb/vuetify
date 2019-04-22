// Utils
import pad from '../VDatePicker/util/pad'

// Types
import Vue, { VNode } from 'vue'
import { PropValidator } from 'vue/types/options'

enum SelectMode {
  Hour = 1,
  Minute = 2,
  Second = 3
}

const selectingNames = { 1: 'hour', 2: 'minute', 3: 'second' }
const getSelectModeName = (mode: SelectMode) => selectingNames[mode]

export { SelectMode, getSelectModeName }

export type Period = 'am' | 'pm'
export type AllowFunction = (val: number) => boolean

interface Allowed {
  hour: AllowFunction | number[]
  minute: AllowFunction | number[]
  second: AllowFunction | number[]
}

export interface Time {
  hour: number | null
  minute: number | null
  second: number | null
}

export function convert24to12 (hour: number) {
  return hour ? ((hour - 1) % 12 + 1) : 12
}

export function convert12to24 (hour: number, period: Period) {
  return hour % 12 + (period === 'pm' ? 12 : 0)
}

export function parseTime (value: string | null | Date): Time {
  let hour, minute, second

  if (value == null || value === '') {
    hour = null
    minute = null
    second = null
  } else if (value instanceof Date) {
    hour = value.getHours()
    minute = value.getMinutes()
    second = value.getSeconds()
  } else {
    const [, h, m, , s, p] = value.trim().toLowerCase().match(/^(\d+):(\d+)(:(\d+))?([ap]m)?$/) || new Array(6)

    hour = p ? convert12to24(parseInt(h, 10), p as Period) : parseInt(h, 10)
    minute = parseInt(m, 10)
    second = parseInt(s || 0, 10)
  }

  return {
    hour,
    minute,
    second
  } as Time
}

export default Vue.extend({
  name: 'v-time',

  props: {
    allowed: {
      type: Object,
      default: () => ({ hour: () => true, minute: () => true, second: () => true })
    } as PropValidator<Allowed>,
    format: {
      type: String,
      default: 'ampm',
      validator (val) {
        return ['ampm', '24hr'].includes(val)
      }
    } as PropValidator<'ampm' | '24hr'>,
    min: String,
    max: String,
    value: {
      type: String,
      default: () => null
    },
    useSeconds: Boolean
  },

  data () {
    return {
      period: 'am' as Period,
      selectMode: SelectMode.Hour,
      internalTime: parseTime(this.value)
    }
  },

  computed: {
    isAllowedHourCb (): AllowFunction {
      let cb: AllowFunction

      if (!this.allowed.hour) {
        cb = () => true
      } else if (this.allowed.hour instanceof Array) {
        cb = (val: number) => (this.allowed.hour as number[]).includes(val)
      } else {
        cb = this.allowed.hour
      }

      if (!this.min && !this.max) return cb

      const minHour = this.min ? Number(this.min.split(':')[0]) : 0
      const maxHour = this.max ? Number(this.max.split(':')[0]) : 23

      return (val: number) => {
        return val >= minHour * 1 &&
          val <= maxHour * 1 &&
          (!cb || cb(val))
      }
    },
    isAllowedMinuteCb (): AllowFunction {
      let cb: AllowFunction

      const isHourAllowed = !this.isAllowedHourCb || this.internalTime.hour === null || this.isAllowedHourCb(this.internalTime.hour)
      if (!this.allowed.minute) {
        cb = () => true
      } else if (this.allowed.minute instanceof Array) {
        cb = (val: number) => (this.allowed.minute as number[]).includes(val)
      } else {
        cb = this.allowed.minute
      }

      if (!this.min && !this.max) {
        return isHourAllowed ? cb : () => false
      }

      const [minHour, minMinute] = this.min ? this.min.split(':').map(Number) : [0, 0]
      const [maxHour, maxMinute] = this.max ? this.max.split(':').map(Number) : [23, 59]
      const minTime = minHour * 60 + minMinute * 1
      const maxTime = maxHour * 60 + maxMinute * 1

      return (val: number) => {
        const time = 60 * this.internalTime.hour! + val
        return time >= minTime &&
          time <= maxTime &&
          isHourAllowed &&
          (!cb || cb(val))
      }
    },
    isAllowedSecondCb (): AllowFunction {
      let cb: AllowFunction

      const isHourAllowed = !this.isAllowedHourCb || this.internalTime.hour === null || this.isAllowedHourCb(this.internalTime.hour)
      const isMinuteAllowed = isHourAllowed &&
        (!this.isAllowedMinuteCb ||
          this.internalTime.minute === null ||
          this.isAllowedMinuteCb(this.internalTime.minute)
        )

      if (!this.allowed.second) {
        cb = () => true
      } else if (this.allowed.second instanceof Array) {
        cb = (val: number) => (this.allowed.second as number[]).includes(val)
      } else {
        cb = this.allowed.second
      }

      if (!this.min && !this.max) {
        return isMinuteAllowed ? cb : () => false
      }

      const [minHour, minMinute, minSecond] = this.min ? this.min.split(':').map(Number) : [0, 0, 0]
      const [maxHour, maxMinute, maxSecond] = this.max ? this.max.split(':').map(Number) : [23, 59, 59]
      const minTime = minHour * 3600 + minMinute * 60 + (minSecond || 0) * 1
      const maxTime = maxHour * 3600 + maxMinute * 60 + (maxSecond || 0) * 1

      return (val: number) => {
        const time = 3600 * this.internalTime.hour! + 60 * this.internalTime.minute! + val
        return time >= minTime &&
          time <= maxTime &&
          isMinuteAllowed &&
          (!cb || cb(val))
      }
    },
    isAmPm (): boolean {
      return this.format === 'ampm'
    },
    scopedSlotProps (): any {
      return {
        allowed: {
          hour: this.isAllowedHourCb,
          minute: this.isAllowedMinuteCb,
          second: this.isAllowedSecondCb
        },
        format: this.format,
        isAmPm: this.isAmPm,
        time: this.internalTime,
        period: this.period,
        selectMode: this.selectMode,
        setPeriod: this.setPeriod,
        setTime: this.setTime,
        setSelectMode: this.setSelectMode
      }
    },
    timeAsString (): string | null {
      const { hour, minute, second } = this.internalTime
      if (hour != null && minute != null && (!this.useSeconds || second != null)) {
        return `${pad(hour)}:${pad(minute)}` + (this.useSeconds ? `:${pad(second!)}` : '')
      }

      return null
    }
  },

  watch: {
    value (value: string | null | Date) {
      this.internalTime = parseTime(value)
    },
    timeAsString (v: string | null) {
      if (v != null) this.$emit('input', v)
    },
    period (v: Period) {
      this.$emit('update:period', v)
    },
    selectMode (v: SelectMode) {
      this.$emit('update:selectMode', v)
    }
  },

  methods: {
    setPeriod (p: Period) { this.period = p },
    setTime (t: Time) { this.internalTime = t },
    setSelectMode (m: SelectMode) { this.selectMode = m }
  },

  render (): VNode {
    return this.$scopedSlots.default!(this.scopedSlotProps) as any
  }
})
