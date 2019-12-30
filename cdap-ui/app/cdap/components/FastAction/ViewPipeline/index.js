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
import FastActionButton from '../FastActionButton';
import T from 'i18n-react';
import { Tooltip } from 'reactstrap';
import NamespaceStore from 'services/NamespaceStore';

export default class ViewPipelineAccess extends Component {
  constructor(props) {
    super(props);

    this.state = {
      entity: this.props.entity,
      tooltipOpen: false
    };

    this.goToPipelinePage = this.goToPipelinePage.bind(this);
    this.toggleTooltip = this.toggleTooltip.bind(this);
  }

  goToPipelinePage() {
    let pipelineId = this.state.entity.id;
    let namespace = NamespaceStore.getState().selectedNamespace;
    let url = window.getHydratorUrl({
      stateName: 'hydrator.detail',
      stateParams: {
        namespace,
        pipelineId
      }
    });
    window.open(url, '_blank');
  }

  toggleTooltip() {
    this.setState({tooltipOpen: !this.state.tooltipOpen});
  }

  render() {
    const tooltipId = `viewPipeline-${this.props.entity.uniqueId}`;

    return (
      <span className="btn btn-secondary btn-sm">
        <FastActionButton
          icon="view-pipeline"
          action={this.goToPipelinePage}
          id={tooltipId}
        />

        <Tooltip
          placement="top"
          isOpen={this.state.tooltipOpen}
          target={tooltipId}
          toggle={this.toggleTooltip}
          delay={0}
        >
          {T.translate('features.FastAction.viewPipeline.label')}
        </Tooltip>
      </span>
    );
  }
}

ViewPipelineAccess.propTypes = {
  entity: PropTypes.shape({
    id: PropTypes.string.isRequired,
    uniqueId: PropTypes.string,
  }),
};
