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

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import IconSVG from 'components/IconSVG';
import Popover from 'components/Popover';
import T from 'i18n-react';

const PREFIX = 'features.PipelineDetails.RunLevel';

const mapStateToProps = (state) => {
  return {
    currentRun: state.currentRun
  };
};

const RunSparkJobInfo = ({ currentRun }) => {
  const url = currentRun && currentRun.hasOwnProperty('properties') && currentRun.properties.hasOwnProperty('yarnApplicationTrackingUrl.phase-1') ? currentRun.properties['yarnApplicationTrackingUrl.phase-1'] : '';

  const SparkUIBtnComp = () => (
    <div className='run-sparkui-btn'>
      <IconSVG name='icon-spark' />
      <div>{T.translate(`${PREFIX}.sparkUI`)}</div>
    </div>
  );

  if (url === '') {
    return (
      <Popover
        target={SparkUIBtnComp}
        showOn='Hover'
        placement='bottom-end'
        className='run-info-container run-sparkui-container disabled'
      >
        {T.translate(`${PREFIX}.noSparkUI`)}
      </Popover>
    );
  }

  return (
    <a href={url} target="_blank">
      <div className="run-info-container run-sparkui-container">
        <SparkUIBtnComp />
      </div>
    </a>
  );
};

RunSparkJobInfo.propTypes = {
  currentRun: PropTypes.object
};

const ConnectedRunSparkJobInfo = connect(mapStateToProps)(RunSparkJobInfo);
export default ConnectedRunSparkJobInfo;
