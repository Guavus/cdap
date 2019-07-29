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

import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import './CorrelationContainer.scss';
import { isNil } from 'lodash';
import PropTypes from 'prop-types';

class CorrelationContainer extends Component {
  algolist = [{ id: 1, name: "pearson" }, { id: 2, name: "spearman" }, { id: 3, name: "ChiSqTest" }, { id: 4, name: "mic" }, { id: 5, name: "anova" }, { id: 6, name: "kendallTau" }];
  correlationItems = [{ id: 1, enable: false, name: "TopN", minValue: "", maxValue: "", doubleView: false, hasRangeError: false },
  { id: 2, enable: false, name: "LowN", minValue: "", maxValue: "", doubleView: false, hasRangeError: false },
  { id: 3, enable: false, name: "Range", minValue: "", maxValue: "", doubleView: true, hasRangeError: false }
  ]

  constructor(props) {
    super(props);
    this.state = {
      algolist: this.algolist,
      openAlgoDropdown: false,
      selectedAlgo: { id: -1, name: 'Select' },
      selectedFeature: props.targetVariable,
      activeApplyBtn: false
    };

  }

  toggleAlgoDropDown = () => {
    this.setState(prevState => ({
      openAlgoDropdown: !prevState.openAlgoDropdown
    }));
  }

  algoTypeChange = (item) => {
    this.setState({ selectedAlgo: item });
    setTimeout(() => {
      this.updateApplyBtnStatus();
    });
  }

  updateApplyBtnStatus = () => {
    let isValidFilterItems = true;

    if (this.state.selectedAlgo.id == -1) {
      isValidFilterItems = false;
    }

    if (isNil(this.state.selectedFeature)) {
      isValidFilterItems = false;
    }

    this.setState({ activeApplyBtn: isValidFilterItems });
  }


  applyCorrelation = () => {
    if (!isNil(this.props.applyCorrelation)) {
      const result = {
        coefficientType: this.state.selectedAlgo,
        selectedfeatures: this.state.selectedFeature
      };
      this.props.applyCorrelation(result);
    }
  }

  render() {

    return (
      <div className="correlation-container">
        <div className="correlation-box">
          <div className="algo-box">
            <label className="algo-label">Algorithm: </label>
            <Dropdown isOpen={this.state.openAlgoDropdown} toggle={this.toggleAlgoDropDown}>
              <DropdownToggle caret>
                {this.state.selectedAlgo.name}
              </DropdownToggle>
              <DropdownMenu>
                {
                  this.state.algolist.map((column) => {
                    return (
                      <DropdownItem onClick={this.algoTypeChange.bind(this, column)}
                        key={'algo_' + column.id.toString()}
                      >{column.name}</DropdownItem>
                    );
                  })
                }
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className="feature-box">
            <div>
              <label className="feature-label">Target Variable:</label>
              <label className="feature-variable">{this.props.targetVariable}</label>
            </div>

          </div>
        </div>
        <div className="control-box">
          <button className="feature-button" onClick={this.applyCorrelation} disabled={!this.state.activeApplyBtn}>Apply</button>
        </div>
      </div>
    );
  }
}

export default CorrelationContainer;

CorrelationContainer.propTypes = {
  applyCorrelation: PropTypes.func,
  targetVariable: PropTypes.string
};

