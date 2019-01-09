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
import NameValueList from '../NameValueList';
import cloneDeep from 'lodash/cloneDeep';

require('./Configurator.scss');

class Configurator extends React.Component {
  configPropList;
  constructor(props) {
    super(props);
    this.configPropList = [];
  }

  componentDidMount() {
    this.configPropList = cloneDeep(this.props.configurationList);
  }

  addConfiguration(nameValue) {
    this.configPropList.push(nameValue);
    this.props.updateConfigurationList(this.configPropList);
  }

  updateConfiguration(index, nameValue) {
    this.configPropList[index] = nameValue;
    this.props.updateConfigurationList(this.configPropList);
  }

  render() {
    return (
      <div className = 'configuration-step-container'>
        <NameValueList dataProvider = {this.props.configurationList}
         updateNameValue = {this.updateConfiguration.bind(this)}
         addNameValue = {this.addConfiguration.bind(this)}/>
      </div>
    );
  }
}
export default Configurator;
