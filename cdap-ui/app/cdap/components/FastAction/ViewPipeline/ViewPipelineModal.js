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
import {Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import T from 'i18n-react';
import CardActionFeedback from 'components/CardActionFeedback';
import NamespaceStore from 'services/NamespaceStore';

require('./ViewPipelineModal.scss');

/**
 * Datetime component will parse date as moment.js object
 **/
export default class ViewPipelineModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };

    this.viewPipeline = this.viewPipeline.bind(this);
  }

  viewPipeline() {
    let anchor = document.getElementById('placeholder-pipeline');
    let pipelineId = this.props.entity.id;
    let namespace = NamespaceStore.getState().selectedNamespace;
    let url = window.getHydratorUrl({
      stateName: 'hydrator.detail',
      stateParams: {
        namespace,
        pipelineId
      }
    });
    anchor.href = `${url}`;
    anchor.click();
  }

  renderFooter() {
    if (!this.state.error) { return null; }

    return (
      <ModalFooter>
        <CardActionFeedback
          type='DANGER'
          message={T.translate('features.FastAction.viewPipeline.failedMessage')}
          extendedMessage={this.state.error}
        />
      </ModalFooter>
    );
  }

  render() {
    const headerTitle = T.translate('features.FastAction.viewPipeline.label');

    return (
      <Modal
        isOpen={true}
        toggle={this.props.onClose}
        className="confirmation-modal view-pipeline-modal cdap-modal"
        size="lg"
        backdrop='static'
      >
        <ModalHeader className="clearfix">
          <div className="float-xs-left">
            {headerTitle}
          </div>
          <div className="float-xs-right">
            <div
              className="close-modal-btn"
              onClick={this.props.onClose}
            >
              <span className={"button-icon fa fa-times"}></span>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="modal-body">
          <a id='placeholder-pipeline'></a>
        </ModalBody>

        {this.renderFooter()}
      </Modal>
    );
  }
}

ViewPipelineModal.propTypes = {
  entity: PropTypes.shape({
    id: PropTypes.string.isRequired,
    uniqueId: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired
};
