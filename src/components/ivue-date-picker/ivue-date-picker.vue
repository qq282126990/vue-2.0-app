<script>
import IvueDatePickerTitle from './ivue-date-picker-title';
import IvueDatePickerHeader from './ivue-date-picker-header';
import IvueDatePickerDate from './ivue-date-picker-date';
import IvueDatePickerMonth from './ivue-date-picker-month';
import IvueDatePickerYears from './ivue-date-picker-years';

import Pad from '../../utils/pad';
import Picker from '../../utils/mixins/picker';
import isDateAllowed from '../../utils/is-date-allowed';
import CreateNativeLocaleFormatter from '../../utils/create-native-locale-formatter';

export default {
  name: 'ivue-date-picker',
  mixins: [Picker],
  props: {
    // Function formatting the year in table header and pickup title
    titleYearFormat: {
      type: Function,
      default: null
    },
    // Function formatting currently selected date in the picker title
    titleDateFormat: {
      type: Function,
      default: null
    },
    // Function formatting the day in date picker table
    dayFormat: {
      type: Function,
      default: null
    },
    // Function formatting month in the months table
    monthFormat: {
      type: Function,
      default: null
    },
    // Function formatting the tableDate in the day/month table header
    headerDateFormat: {
      type: Function,
      default: null
    },
    /*
    * 语言
    *
    * @type{String}
    */
    locale: {
      type: String,
      default: 'en-us'
    },
    /*
    * 日期 时间
    *
    * @type{String,Array}
    */
    value: [Array, String],
    /*
    * 日历显示的类型 默认显示为日期
    *
    * @type{String}
    */
    type: {
      type: String,
      default: 'date',
      validator: type => ['date', 'month'].includes(type)
    },
    /*
    * 一周的第一天
    *
    * @type{String,Number}
    */
    firstDayOfWeek: {
      type: [String, Number],
      default: 0
    },
    /*
    * 最小年份或月份
    *
    * @type{String}
    */
    min: String,
    /*
    * 最大年份或月份
    *
    * @type{String}
    */
    max: String,
    /*
    * 是否显示当前日期
    *
    * @type{String}
    */
    showCurrent: {
      type: [Boolean, String],
      default: true
    },
    /*
    * 点击月份或者年份时日期月份或年份是否跟随改变
    *
    * @type{String}
    */
    reactive: Boolean,
    /*
    * 设置允许选择日期函数
    *
    * @type{Function}
    */
    allowedDates: Function,
    /*
    * 是否支持日期多选
    *
    * @type{Function}
    */
    multiple: Boolean,
    /*
    * 便签用于标记需要注意的日期
    *
    * @type{Array,Function}
    */
    note: {
      type: [Array, Function],
      default: null
    },
    /*
    * 便签用于标记需要注意的日期的颜色
    *
    * @type{String, Function, Object}
    */
    noteColor: {
      type: [String, Function, Object],
      default: 'warning'
    },
    /*
    * 是否只读
    *
    * @type{Boolean}
    */
    readonly: Boolean,
    nextIcon: {
      type: String,
      default: 'chevron_right'
    },
    prevIcon: {
      type: String,
      default: 'chevron_left'
    },
    yearIcon: {
      type: String
    },
    /*
    * 用于监听月份或者年份的变化
    *
    * @type{Boolean}
    */
    pickerDate: String
  },
  data () {
    const now = new Date();

    return {
      // 日期
      inputDay: null,
      // 输入年份
      inputYear: null,
      // 输入月份
      inputMonth: null,
      // 当前激活的type
      activeType: this.type.toUpperCase(),
      // tableDate is a string in 'YYYY' / 'YYYY-M' format (leading zero for month is not required)
      tableDate: null,
      // 当前时间
      now: now
    }
  },
  created () {
    this.checkMultipleProp();

    this.setInputDate();

    this.tableDate = (() => {
      if (this.pickerDate) {
        return this.pickerDate;
      }

      const date = (this.multiple ? this.value[this.value.length - 1] : this.value) ||
        `${this.now.getFullYear()}-${this.now.getMonth() + 1}`

      const type = this.type === 'date' ? 'month' : 'year';

      return this.sanitizeDateString(date, type)
    })();

    if (this.pickerDate !== this.tableDate) {
      this.$emit('update:pickerDate', this.tableDate)
    }
  },
  computed: {
    computedValue () {
      return this.multiple ? this.value[this.value.length - 1] : this.value;
    },
    // 格式化日期
    formatters () {
      return {
        // UTC时区
        titleYear: this.titleYearFormat || CreateNativeLocaleFormatter(this.locale, { year: 'numeric', timeZone: 'UTC' }, { length: 4 }),
        titleDate: this.titleDateFormat || (this.multiple ? this.defaultTitleMultipleDateFormatter : this.defaultTitleDateFormatter)
      }
    },
    // 年份
    tableYear () {
      return (this.pickerDate || this.tableDate).split('-')[0] * 1;
    },
    // 月份
    tableMonth () {
      return (this.pickerDate || this.tableDate).split('-')[1] - 1;
    },
    // 选择的日期
    inputDate () {
      return this.type === 'date' ?
        `${this.inputYear}-${Pad(this.inputMonth + 1)}-${Pad(this.inputDay)}` :
        `${this.inputYear}-${Pad(this.inputMonth + 1)}`
    },
    // 默认日期格式
    defaultTitleDateFormatter () {
      // 标题格式
      const titleFormats = {
        year: { year: 'numeric', timeZone: 'UTC' },
        month: { month: 'long', timeZone: 'UTC' },
        date: { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }
      }

      // 格式化
      const titleDateFormatter = CreateNativeLocaleFormatter(this.locale, titleFormats[this.type], {
        start: 0,
        length: { date: 10, month: 7, year: 4 }[this.type]
      });

      // 日期换行
      const landscapeFormatter = (date) => titleDateFormatter(date)
        .replace(/([^\d\s])([\d])/g, (match, nonDigit, digit) => `${nonDigit} ${digit}`)
        .replace(', ', ',<br>');

      return this.landscape ? landscapeFormatter : titleDateFormatter;
    },
    // 默认格式化日期多选
    defaultTitleMultipleDateFormatter () {
      if (this.value.length < 2) {
        return (dates) => dates.length ? this.defaultTitleDateFormatter(dates[0]) : '0 selected';
      }

      return (dates) => `${dates.length} selected`;
    },
    // 选择的日期
    selectedMonths () {
      if (!this.value || !this.value.length || this.type === 'month') {
        return this.value;
      }
      else if (this.multiple) {
        return this.value.map(val => val.substr(0, 7));
      }
      else {
        return this.value.substr(0, 7);
      }
    },
    // 最小月份
    minMonth () {
      return this.min ? this.sanitizeDateString(this.min, 'month') : null;
    },
    // 最大月份
    maxMonth () {
      return this.max ? this.sanitizeDateString(this.max, 'month') : null;
    },
    // 最小年份
    minYear () {
      return this.min ? this.sanitizeDateString(this.min, 'year') : null;
    },
    // 最大年份
    maxYear () {
      return this.max ? this.sanitizeDateString(this.max, 'year') : null;
    },
    // 当前日期
    current () {
      if (this.showCurrent) {
        return this.sanitizeDateString(`${this.now.getFullYear()}-${this.now.getMonth() + 1}-${this.now.getDate()}`, this.type);
      }
      else {
        return this.showCurrent || null
      }
    }
  },
  methods: {
    // 点击日期事件
    emitInput (newInput) {
      const output = this.multiple
        ? (
          this.value.indexOf(newInput) === -1
            ? this.value.concat([newInput])
            : this.value.filter(x => x !== newInput)
        )
        : newInput;

      this.$emit('input', output);
      this.multiple || this.$emit('change', newInput)
    },
    // 检查设置为多选后value值是否正确
    checkMultipleProp () {
      if (this.value == null) return
      const valueType = this.value.constructor.name
      const expected = this.multiple ? 'Array' : 'String'
      if (valueType !== expected) {
        console.warn(`Value must be ${this.multiple ? 'an' : 'a'} ${expected}, got ${valueType}`, this)
      }
    },
    // 渲染标题内容
    genPickerTitle () {
      return this.$createElement(IvueDatePickerTitle, {
        props: {
          date: this.value ? this.formatters.titleDate(this.value) : '',
          year: this.formatters.titleYear(`${this.inputYear}`),
          value: this.multiple ? this.value[0] : this.value,
          selectingYear: this.activeType === 'YEAR',
          yearIcon: this.yearIcon
        },
        slot: 'title',
        style: this.readonly ? {
          'pointer-events': 'none'
        } : undefined,
        on: {
          'update:selectingYear': value => this.activeType = value ? 'YEAR' : this.type.toUpperCase()
        }
      });
    },
    // 渲染内容头部
    genTableHeader () {
      return this.$createElement(IvueDatePickerHeader, {
        props: {
          locale: this.locale,
          value: this.activeType === 'DATE' ? `${this.tableYear}-${Pad(this.tableMonth + 1)}` : `${this.tableYear}`,
          max: this.activeType === 'DATE' ? this.maxMonth : this.maxYear,
          min: this.activeType === 'DATE' ? this.minMonth : this.minYear,
          color: this.color,
          nextIcon: this.nextIcon,
          prevIcon: this.prevIcon,
          readonly: this.readonly,
          activeType: this.activeType,
          format: this.headerDateFormat
        },
        on: {
          input: value => this.tableDate = value,
          toggle: () => this.activeType = (this.activeType === 'DATE' ? 'MONTH' : 'YEAR')
        }
      });
    },
    // 渲染内容
    genPickerBody () {
      const children = this.activeType === 'YEAR' ? [
        this.genTableHeader(),
        this.genYears()
      ] :
        [
          this.genTableHeader(),
          this.activeType === 'DATE' ? this.genDateTable() : this.genMonthTable()
        ];

      return this.$createElement('div', {
        key: this.activeType,
        style: this.readonly ? {
          'pointer-events': 'none'
        } : undefined
      }, children);
    },
    // 渲染日期
    genDateTable () {
      return this.$createElement(IvueDatePickerDate, {
        props: {
          tableDate: `${this.tableYear}-${Pad(this.tableMonth + 1)}`,
          value: this.value,
          locale: this.locale,
          firstDayOfWeek: this.firstDayOfWeek,
          max: this.max,
          min: this.min,
          current: this.current,
          color: this.color,
          allowedDates: this.allowedDates,
          note: this.note,
          noteColor: this.noteColor,
          readonly: this.readonly,
          format: this.dayFormat
        },
        on: {
          input: this.dateClick,
          tableDate: value => this.tableDate = value
        },
        ref: 'table'
      });
    },
    // 渲染月
    genMonthTable () {
      return this.$createElement(IvueDatePickerMonth, {
        props: {
          color: this.color,
          tableDate: `${this.tableYear}`,
          locale: this.locale,
          value: this.selectedMonths,
          max: this.maxMonth,
          min: this.minMonth,
          allowedDates: this.type === 'month' ? this.allowedDates : null,
          readonly: this.readonly,
          current: this.current ? this.sanitizeDateString(this.current, 'month') : null,
          activeType: this.activeType,
          format: this.monthFormat
        },
        on: {
          input: this.monthClick,
          tableDate: value => this.tableDate = value
        },
        ref: 'table'
      });
    },
    // 渲染年
    genYears () {
      return this.$createElement(IvueDatePickerYears, {
        props: {
          tableDate: `${this.tableYear}`,
          color: this.color,
          max: this.maxYear,
          min: this.minYear,
          locale: this.locale,
          value: `${this.tableYear}`,
          current: this.current,
          activeType: this.activeType,
          year: `${this.inputYear}`
        },
        on: {
          input: this.yearClick,
          tableDate: value => this.tableDate = value
        }
      });
    },
    // 设置年，月，日值
    setInputDate () {
      if (this.computedValue) {
        const computedValue = this.computedValue.split('-')
        this.inputYear = parseInt(computedValue[0], 10);
        this.inputMonth = parseInt(computedValue[1], 10) - 1;

        if (this.type === 'date') {
          this.inputDay = parseInt(computedValue[2], 10)
        }
      }
      else {
        this.inputYear = this.inputYear || this.now.getFullYear();
        this.inputMonth = this.inputMonth == null ? this.inputMonth : this.now.getMonth();
        this.inputDay = this.inputDay || this.now.getDate();
      }

    },
    // Adds leading zero to month/day if necessary, returns 'YYYY' if type = 'year',
    // 'YYYY-MM' if 'month' and 'YYYY-MM-DD' if 'date'
    sanitizeDateString (dateString, type) {
      const [year, month = 1, date = 1] = dateString.split('-');

      return `${year}-${Pad(month)}-${Pad(date)}`.substr(0, { date: 10, month: 7, year: 4 }[type]);
    },
    // 日期点击事件
    dateClick (value) {
      this.inputYear = parseInt(value.split('-')[0], 10);
      this.inputMonth = parseInt(value.split('-')[1], 10) - 1;
      this.inputDay = parseInt(value.split('-')[2], 10);

      this.emitInput(this.inputDate);
    },
    // 月期点击事件
    monthClick (value) {
      this.inputYear = parseInt(value.split('-')[0], 10);
      this.inputMonth = parseInt(value.split('-')[1], 10) - 1;

      if (this.type === 'date') {
        this.tableDate = value;
        this.activeType = 'DATE';

        this.reactive && !this.multiple && this.isDateAllowed(this.inputDate) && this.$emit('input', this.inputDate);

      }
      else {
        this.emitInput(this.inputDate);
      }

    },
    // 年份点击事件
    yearClick (value) {
      this.inputYear = value;
      if (this.type === 'month') {
        this.tableDate = `${value}`;
      }
      else {
        this.tableDate = `${value}-${Pad(this.tableMonth + 1)}`;
      }

      this.activeType = 'MONTH';

      this.reactive && !this.multiple && this.isDateAllowed(this.inputDate) && this.$emit('input', this.inputDate);
    },
    isDateAllowed (value) {
      return isDateAllowed(value, this.min, this.max, this.allowedDates)
    },
  },
  watch: {
    tableDate (val, prev) {

      // 发送月份或年份改变事件
      this.$emit('update:pickerDate', val)
    },
    value (newValue, oldValue) {
      this.checkMultipleProp();
      this.setInputDate();

      if (!this.multiple && this.value && !this.pickerDate) {
        this.tableDate = this.sanitizeDateString(this.inputDate, this.type === 'month' ? 'year' : 'month')
      } else if (this.multiple && this.value.length && !oldValue.length && !this.pickerDate) {
        this.tableDate = this.sanitizeDateString(this.inputDate, this.type === 'month' ? 'year' : 'month')
      }

    },
    // 监听月份或者年份的变化
    pickerDate (value) {
      if (value) {
        this.tableDate = value;
      } else if (this.computedValue && this.type === 'date') {
        this.tableDate = this.sanitizeDateString(this.computedValue, 'month');
      } else if (this.computedValue && this.type === 'month') {
        this.tableDate = this.sanitizeDateString(this.computedValue, 'year');
      }
    },
    // 监听日历类型变化
    type (type) {
      this.activeType = type.toUpperCase();

      if (this.value && this.value.length) {
        const output = (this.multiple ? this.value : [this.value])
          .map(val => this.sanitizeDateString(val, type))
          .filter(this.isDateAllowed);

        this.$emit('input', this.multiple ? output : output[0])
      }
    }
  },
  render () {
    return this.genPicker();
  }
}
</script>
