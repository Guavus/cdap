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

import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import PropTypes from 'prop-types';

require('./AlertModal.scss');

class AlertModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'Alert'
    };
  }

  onBtnClick(btnText) {
    if (this.props.onClose) {
      this.props.onClose(btnText);
    }
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
            {
              this.props.showCancel && <Button className="btn-margin" color="secondary" onClick={this.onBtnClick.bind(this, this.props.secondaryBtnText)}>{this.props.secondaryBtnText}</Button>
            }
            <Button className="btn-margin" color="primary" onClick={this.onBtnClick.bind(this, this.props.primaryBtnText)}>{this.props.primaryBtnText}</Button>{' '}
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

AlertModal.defaultProps = {
  showCancel: true,
  primaryBtnText: "Ok",
  secondaryBtnText: "Cancel"
};

export default AlertModal;
AlertModal.propTypes = {
  onClose: PropTypes.func,
  showCancel: PropTypes.bool,
  open: PropTypes.any,
  message: PropTypes.string,
  primaryBtnText: PropTypes.string,
  secondaryBtnText: PropTypes.string
};
