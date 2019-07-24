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
import ExploreDatasetPage from './ExploreDatasetPage';
import ExploreDatasetActions from './store/ExploreDatasetActions';
import ExploreDatasetStore from './store/ExploreDatasetStore';

const mapStateToExploreDatasetProps = (state) => {
  return {
  };
};

const mapDispatchToExploreDatasetProps = (dispatch) => {
  return {
    resetStore: () => {
      dispatch({
        type: ExploreDatasetActions.onReset,
        payload: undefined
      });
    },
    setAvailableSinks: (configurations) => {
      dispatch({
        type: ExploreDatasetActions.setAvailableSinks,
        payload: configurations
      });
    },
    setAvailableOperations: (configurations) => {
      dispatch({
        type: ExploreDatasetActions.setAvailableOperations,
        payload: configurations
      });
    },
    setAvailableEngineConfigurations: (configurations) => {
      dispatch({
        type: ExploreDatasetActions.setAvailableEngineConfigurations,
        payload: configurations
      });
    },
    updateEngineConfigurations: (configurations) => {
      dispatch({
        type: ExploreDatasetActions.updateEngineConfigurations,
        payload: configurations
      });
    }
  };
};

const ExploreDatsetUIPage = connect(
    mapStateToExploreDatasetProps,
    mapDispatchToExploreDatasetProps
)(ExploreDatasetPage);


export default function ExploreDatsetUI() {
  return (
    <Provider store={ExploreDatasetStore}>
      <ExploreDatsetUIPage/>
    </Provider>
  );
}
