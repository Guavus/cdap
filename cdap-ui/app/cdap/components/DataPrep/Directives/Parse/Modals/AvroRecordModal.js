/*
 * Copyright © 2017 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import PropTypes from 'prop-types';

import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import T from 'i18n-react';
import MouseTrap from 'mousetrap';

const PREFIX = 'features.DataPrep.Directives.Parse';

export default class AvroRecordModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      avroSchema: '',
      warning: false
    };

    this.apply = this.apply.bind(this);
    this.handleAvroSchemaChange = this.handleAvroSchemaChange.bind(this);
    this.formatSchema = this.formatSchema.bind(this);
  }

  componentDidMount() {
    MouseTrap.bind('enter', this.apply);
  }

  componentWillUnmount() {
    MouseTrap.unbind('enter');
  }

  apply() {
    const a = `${this.state.avroSchema}`;
    this.props.onApply('AVRORECORD', `'${a}'`);
    this.props.toggle();
  }

  handleAvroSchemaChange(e) {
    this.setState({avroSchema: e.target.value});
  }

  renderCustomText() {
    return (
      <div className="json-editor">
        {
          this.state.warning ?
            <div className='text-warning'>
              {this.state.warning}
            </div>
            : null
        }

        <div className="textarea-container">
          <textarea className="form-control"
            placeholder={T.translate(`${PREFIX}.Parsers.AVRORECORD.placeholder`)}
            value={this.state.avroSchema}
            onChange={this.handleAvroSchemaChange}
            autoFocus
          >
            {this.state.avroSchema}
          </textarea>
        </div>
      </div>
    );
  }

  render() {

    let disabled = this.state.avroSchema.length === 0;

    return (
      <Modal
        isOpen={true}
        toggle={this.props.toggle}
        size="md"
        backdrop="static"
        zIndex="1061"
        className="dataprep-parse-modal cdap-modal"
      >
        <ModalHeader>
          <span>
            {T.translate(`${PREFIX}.modalTitle`, {parser: 'AVRORECORD'})}
          </span>

          <div
            className="close-section float-xs-right"
            onClick={this.props.toggle}
          >
            <span className="fa fa-times" />
          </div>
        </ModalHeader>
        <ModalBody>
          <h5>
            {T.translate(`${PREFIX}.Parsers.AVRORECORD.modalTitle`)}
          </h5>

          {this.renderCustomText()}

        </ModalBody>

        <ModalFooter>
          <button
            className="btn btn-primary"
            onClick={this.apply}
            disabled={disabled}
          >
            {T.translate('features.DataPrep.Directives.apply')}
          </button>
          <button
            className="btn btn-secondary"
            onClick={this.props.toggle}
          >
            {T.translate('features.DataPrep.Directives.cancel')}
          </button>
        </ModalFooter>
      </Modal>
    );
  }
}


AvroRecordModal.propTypes = {
  toggle: PropTypes.func,
  onApply: PropTypes.func,
};
