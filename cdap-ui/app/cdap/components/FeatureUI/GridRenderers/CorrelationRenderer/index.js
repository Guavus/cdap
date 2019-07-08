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
import PropTypes from 'prop-types';

require('./CorrelationRenderer.scss');

class CorrelationRenderer extends React.Component {
  constructor(props) {
    super(props);
  }
  refresh() {
    return true;
  }

  render() {
    return (
      <svg viewBox="0 0 400 100" preserveAspectRatio="none">
        <rect x="0" y="12" width = "400"
              height = "1"  class="baseBar" />
        <rect x="0" y="7" width = "2"
              height = "10" class="baseBar" />
        <rect x="200" y="5" width = "2"
              height = "15" class="baseBar" />
        <rect x="398" y="7" width = "400"
              height = "10" class="baseBar" />
        <rect x= { (this.props.value < 0)? (this.props.value) * 200 + 200: 0 } y="8" width = { (this.props.value < 0)? (this.props.value) * -200: 0 }
              height = "8" class="negativeBar" />
        <rect x="200" y="8" width = { (this.props.value > 0)? (this.props.value) * 200: 0 }
              height = "8" class="positiveBar" />
      </svg>
    );
  }
}
export default CorrelationRenderer;
CorrelationRenderer.propTypes = {
  value: PropTypes.string
};
