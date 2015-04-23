'use strict';

import React from 'react';
import { FlatButton, RaisedButton, FontIcon } from 'material-ui';
import _ from 'lodash';
import tv4 from 'tv4';
import tv4formats from 'tv4-formats';
tv4.addFormat(tv4formats);

import SchemaItem from './SchemaItem.jsx';
import i18n from '../../i18n';

/**
 * SchemaForm is generating form from JSON schema definitions
 */
let SchemaForm = React.createClass({

  propTypes: {
    name: React.PropTypes.string,
    schema: React.PropTypes.object.isRequired,
    value: React.PropTypes.object,
    onSubmit: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    submitLabel: React.PropTypes.string,
  },

  getInitialState() {
    return {};
  },

  componentWillMount() {
    this._setProps(this.props);
  },

  componentWillReceiveProps(props) {
    this._setProps(props);
    this.state.saving = false;
  },

  _setProps(props) {
    let schema = props.schema || { type: 'object', properties: [] };
    this.state.schema = this._normalizeSchema(schema);
    this.state.value = props.value || {};
  },

  render() {
    let schema = this.state.schema;
    let value = this.state.value;
    let saving = !!this.state.saving;
    let submitLabel = this.props.submitLabel || i18n('Save');
    let submitButton = saving ?
      <RaisedButton primary={true} type="submit" onClick={this._didSubmit}>
        <FontIcon className="md-spin-reverse md-loop md-2x .schema-form__icon" />
      </RaisedButton> :
      <RaisedButton label={submitLabel} primary={true} type="submit" onClick={this._didSubmit} />;

    return (
      <div className="schema-form">
        <form onSubmit={this._didSubmit} ref="form">
          <SchemaItem form={this} name="" path="" schema={schema} value={value} errors={this.state.errors} ref="item" />
          <div className="schema-form__buttons">
            <div className="schema-form__buttons__button">
              {submitButton}
            </div>
            <div className="schema-form__buttons__button">
              <FlatButton type="button" label={i18n("Cancel")} onClick={this._didCancel} iconClassName="md-cancel" />
            </div>
          </div>
        </form>
      </div>
    );
  },

  /**
   * Normalize schema
   */
  _normalizeSchema(schema) {
    if (typeof schema === 'string') {
      return { type: schema };
    }
    if (schema.type === 'object') {
      var props = {};
      _.each(schema.properties || {}, (value,key) => {
        props[key] = this._normalizeSchema(value);
      });
      schema.properties = props;
    }
    if (schema.type === 'array') {
      schema.items = this._normalizeSchema(schema.items);
    }
    return schema;
  },

  _validate(value) {
    return tv4.validateMultiple(value, this.state.schema);
  },

  _didSubmit(e) {
    e.preventDefault();
    // Get value from current form
    let value = this.refs.item.getValue();
    console.info("Submitting schema form", value);

    let result = this._validate(value);
    if (result.valid) {
      if (this.props.onSubmit) {
        this.props.onSubmit(value);
        this.setState({ saving: true });
      }
    } else {
      console.error("SchemaForm validation failed", result);
      this.setState({ errors: result.errors });
    }
  },

  _didCancel(e) {
    if (this.props.onCancel) {
      this.props.onCancel(e);
    }
  },
});

export default SchemaForm;
