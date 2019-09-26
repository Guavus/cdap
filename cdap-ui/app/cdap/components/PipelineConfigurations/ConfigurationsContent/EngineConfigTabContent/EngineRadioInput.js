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

import {connect} from 'react-redux';
import {Input} from 'reactstrap';
import {ACTIONS as PipelineConfigurationsActions} from 'components/PipelineConfigurations/Store';

const mapStateToProps = (state, ownProps) => {
  return {
    type: 'radio',
    checked: state.engine.toLowerCase() === ownProps.value.toLowerCase(),
    value: ownProps.value
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onChange: (e) => {
      dispatch({
        type: PipelineConfigurationsActions.SET_ENGINE,
        payload: { engine: e.target.value }
      });
    }
  };
};

const EngineRadioInput = connect(mapStateToProps, mapDispatchToProps)(Input);

export default EngineRadioInput;
