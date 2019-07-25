/*
 * Copyright © 2016-2018 Cask Data, Inc.
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
import SinkSelector from 'components/ExploreDataset/Common/SinkSelector';
import ExploreDatasetStore from 'components/ExploreDataset/store/ExploreDatasetStore';

const mapStateToSelectSinkProps = (state) => {
  return {
    availableSinks: state.exploreDatasetState.availableSinks,
    sinkConfigurations: state.exploreDatasetState.sinkConfigurations,
  };
};

const mapDispatchToSelectSinkProps = (dispatch) => {
  return {
    setSinkConfigurations: (configurations) => {
      dispatch({
        type: ExploreDatasetActions.setSinkConfigurations,
        payload: configurations
      });
    }
  };
};

const DatasetSinkSelector = connect(
  mapStateToSelectSinkProps,
  mapDispatchToSelectSinkProps
)(SinkSelector);


export default function DatasetSinkStep() {
  return (
    <Provider store={ExploreDatasetStore}>
      <DatasetSinkSelector/>
    </Provider>
  );
}