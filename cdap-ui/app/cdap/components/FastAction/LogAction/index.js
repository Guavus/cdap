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
import IconSVG from 'components/IconSVG';
import {MyProgramApi} from 'api/program';
import NamespaceStore from 'services/NamespaceStore';
import {convertProgramToApi} from 'services/program-api-converter';
import {Tooltip} from 'reactstrap';
import T from 'i18n-react';
import { pollRunsCount } from 'components/PipelineDetails/store/ActionCreator';
import PipelineDetailStore from 'components/PipelineDetails/store';
import { GLOBALS } from 'services/global-constants';


export default class LogAction extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isDisabled: false,
      runId: props.entity.runId,
      tooltipOpen: false
    };
    this.toggleTooltip = this.toggleTooltip.bind(this);
  }

  componentWillMount() {
    if (this.state.runId) { return; }
    let namespace = NamespaceStore.getState().selectedNamespace;

    let _pollRunsCount = pollRunsCount({
      appId: this.props.entity.applicationId,
      programType: convertProgramToApi(this.props.entity.programType) === GLOBALS.etlDataPipeline ? 'Workflow' : 'Spark',
      programName: this.props.entity.id,
      namespace: namespace
    });
    _pollRunsCount.subscribe(() => {
      let { runsCount } = PipelineDetailStore.getState();
      const limit = runsCount ? runsCount : 100;
      this.pollRuns$ = MyProgramApi.pollRuns({
        namespace,
        appId: this.props.entity.applicationId,
        programType: convertProgramToApi(this.props.entity.programType),
        programId: this.props.entity.id,
        limit
      }).subscribe((res) => {
        if (res.length > 0) {
          this.setState({
            runId: res[0].runid
          });
        }
      });
    });
  }

  componentWillUnmount() {
    if (this.pollRuns$) {
      this.pollRuns$.unsubscribe();
    }
  }

  generateLink() {
    if (!this.state.runId) { return null; }
    let namespace = NamespaceStore.getState().selectedNamespace,
        appId = this.props.entity.applicationId,
        programType = convertProgramToApi(this.props.entity.programType),
        programId = this.props.entity.id,
        runId = this.state.runId;

    let path = `/logviewer/view?namespace=${namespace}&appId=${appId}&programType=${programType}&programId=${programId}&runId=${runId}`;

    return path;
  }

  toggleTooltip() {
    this.setState({ tooltipOpen : !this.state.tooltipOpen});
  }

  render() {
    // have to do this because ID cannot start with a number
    const tooltipID = `logs-${this.props.entity.uniqueId}`;
    const renderDisabled = (
      <button
        className="btn btn-link"
        disabled
      >
        <IconSVG name='icon-file-text-o' />
      </button>
    );

    const link = this.generateLink();

    const renderLog = (
      <a
        href={link}
        target="_blank"
        className="btn btn-link"
      >
        <IconSVG name='icon-file-text' />
      </a>
    );

    return (
      <span className="btn btn-secondary btn-sm">
        <span id={tooltipID}>
          {this.state.runId ? renderLog : renderDisabled}
        </span>

        <Tooltip
          placement="top"
          className="fast-action-tooltip"
          isOpen={this.state.tooltipOpen}
          target={tooltipID}
          toggle={this.toggleTooltip}
          delay={0}
        >
          {this.state.runId ? T.translate('features.FastAction.logLabel') : T.translate('features.FastAction.logNotAvailable')}
        </Tooltip>
      </span>
    );
  }
}

LogAction.propTypes = {
  entity: PropTypes.shape({
    id: PropTypes.string.isRequired,
    uniqueId: PropTypes.string,
    applicationId: PropTypes.string.isRequired,
    programType: PropTypes.string.isRequired,
    runId: PropTypes.string
  }),
};
