import _ from 'lodash';
import RadioComponent from '../radio/Radio';

export default class SelectBoxesComponent extends RadioComponent {
  static schema(...extend) {
    return RadioComponent.schema({
      type: 'selectboxes',
      label: 'Select Boxes',
      key: 'selectBoxes',
      inline: false
    }, ...extend);
  }

  static get builderInfo() {
    return {
      title: 'Select Boxes',
      group: 'basic',
      icon: 'fa fa-plus-square',
      weight: 60,
      documentation: 'http://help.form.io/userguide/#selectboxes',
      schema: SelectBoxesComponent.schema()
    };
  }

  constructor(component, options, data) {
    super(component, options, data);

    this.validators = this.validators.concat(['minSelectedCount', 'maxSelectedCount']);
    this.component.inputType = 'checkbox';
  }

  get defaultSchema() {
    return SelectBoxesComponent.schema();
  }

  elementInfo() {
    const info = super.elementInfo();
    info.attr.name += '[]';
    info.attr.type = 'checkbox';
    info.attr.class = 'form-check-input';
    return info;
  }

  get emptyValue() {
    return this.component.values.reduce((prev, value) => {
      prev[value.value] = false;
      return prev;
    }, {});
  }

  /**
   * Only empty if the values are all false.
   *
   * @param value
   * @return {boolean}
   */
  isEmpty(value) {
    let empty = true;
    for (const key in value) {
      if (value.hasOwnProperty(key) && value[key]) {
        empty = false;
        break;
      }
    }

    return empty;
  }

  getValue() {
    if (this.viewOnly) {
      return this.dataValue;
    }
    const value = {};
    _.each(this.inputs, (input) => {
      value[input.value] = !!input.checked;
    });
    return value;
  }

  /**
   * Set the value of this component.
   *
   * @param value
   * @param flags
   */
  setValue(value, flags) {
    value = value || {};
    if (typeof value !== 'object') {
      if (typeof value === 'string') {
        value = {
          [value]: true
        };
      }
      else {
        value = {};
      }
    }
    flags = this.getFlags.apply(this, arguments);
    if (Array.isArray(value)) {
      _.each(value, (val) => {
        value[val] = true;
      });
    }

    _.each(this.inputs, (input) => {
      if (_.isUndefined(value[input.value])) {
        value[input.value] = false;
      }
      input.checked = !!value[input.value];
    });

    return this.updateValue(flags);
  }

  checkValidity(data, dirty, rowData) {
    const maxCount = this.component.validate.maxSelectedCount;

    if (maxCount) {
      const count = Object.keys(this.validationValue).reduce((total, key) =>{
        if (this.validationValue[key]) {
          total++;
        }
        return total;
      }, 0);

      if (count >= maxCount) {
        this.inputs.forEach(item => {
          if (!item.checked) {
            item.disabled = true;
          }
        });
        const message = this.component.maxSelectedCountMessage
          ? this.component.maxSelectedCountMessage
          : `You can only select up to ${maxCount} items to continue.`;
        this.setCustomValidity(message);
        return false;
      }
      else {
        this.inputs.forEach(item => {
          item.disabled = false;
        });
      }
    }

    return super.checkValidity(data, dirty, rowData);
  }

  get validationValue() {
    return super.validationValue;
  }

  getView(value) {
    if (!value) {
      return '';
    }
    return _(this.component.values || [])
      .filter((v) => value[v.value])
      .map('label')
      .join(', ');
  }
}
