/*
 * Copyright © 2018 Cask Data, Inc.
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
/* eslint react/prop-types: 0 */

import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
require('./AlertModal.scss');

class AlertModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'Alert'
    };
    this.onOk = this.onOk.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onCancel() {
    this.props.onClose('CANCEL');
  }

  onOk() {
    this.props.onClose('OK');
  }

  render() {
    return (
      <div>
        <Modal isOpen={this.props.open} zIndex="1090">
          <ModalHeader>{this.state.title}</ModalHeader>
          <ModalBody>
            <div>{this.props.message}</div>
          </ModalBody>
          <ModalFooter>
            <Button className="btn-margin" color="secondary" onClick={this.onCancel}>Cancel</Button>
            <Button className="btn-margin" color="primary" onClick={this.onOk}>OK</Button>{' '}
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default AlertModal;
