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
import { Provider, connect } from 'react-redux';
import ExploreDatasetActions from 'components/ExploreDataset/store/ExploreDatasetActions';
import OperationSelector from 'components/ExploreDataset/Common/OperationSelector';
import ExploreDatasetStore from 'components/ExploreDataset/store/ExploreDatasetStore';


const mapStateToConfigurationProps = (state) => {
  return {
    schema: state.exploreDatasetState.schema,
    operationMap: state.exploreDatasetState.operationConfigurations,
    availableOperations: state.exploreDatasetState.availableOperations,
  };
};

const mapDispatchToConfigurationProps = (dispatch) => {
  return {
    updateOperationMap: (value) => {
      dispatch({
        type: ExploreDatasetActions.updateOperationConfigurations,
        payload: value
      });
    },
  };
};

const DatasetOperationSelector = connect(
  mapStateToConfigurationProps,
  mapDispatchToConfigurationProps
)(OperationSelector);


export default function DatasetOperationsStep() {
  return (
    <Provider store={ExploreDatasetStore}>
      <DatasetOperationSelector/>
    </Provider>
  );
}
