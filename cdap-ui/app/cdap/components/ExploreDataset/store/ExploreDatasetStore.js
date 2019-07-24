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

import { combineReducers, createStore } from 'redux';
import ExploreDatasetActions from './ExploreDatasetActions';
import isEmpty from 'lodash/isEmpty';
import remove from 'lodash/remove';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';


const defaultAction = {
  type: '',
  payload: {}
};
const defaultState = {
  steps: [],
  actionType: 'CREATE_PIPELINE',
  pipelineName: '',
  availableOperations: [],
  availableSinks: [],
  availableEngineConfigurations: [],
  schema: [],
  operationConfigurations: {},
  engineConfigurations: [],
  sinkConfigurations: {},
  __complete: false,
  __skipped: false,
  __error: false
};
const defaultInitialState = {
  exploreDatasetState: defaultState,
};

const isOperationComplete = (state) => {
  if (isEmpty(state.featureName)) {
    return false;
  }
  if (isEmpty(state.selectedSchemas)) {
    return false;
  }

  let mandatoryProperties = state.availableProperties.filter(item => item.isMandatory == true).map(item => item.paramName);

  let mandatoryPropsSet = 0;
  state.propertyMap.forEach((value, key) => {
    if (mandatoryProperties.indexOf(key) >= 0) {
      for (let i = 0; i < value.length; i++) {
        let size = state.propertyMap.get(key).size;
        if (size == 0) {
          return false;
        } else {
          mandatoryPropsSet++;
        }
      }
    } else {
      let property = find(state.availableProperties, { paramName: key });
      if (property && !isEmpty(property.subParams)) {
        if (property.subParams.length != value.length) {
          return false;
        }
      }
    }
  });

  if (mandatoryPropsSet < mandatoryProperties.length) {
    return false;
  }

  if (isEmpty(state.engineConfigurations)) {
    return false;
  } else {
    for (let i = 0; i < state.availableEngineConfigurations.length; i++) {
      if (state.availableEngineConfigurations[i].isMandatory) {
        let configuredProperty = find(state.engineConfigurations, { name: state.availableEngineConfigurations[i].paramName });
        if (configuredProperty) {
          if (isEmpty(configuredProperty.value)) {
            return false;
          }
        } else {
          return false;
        }
      }
    }
  }
  if (isEmpty(state.sinkConfigurations)) {
    return false;
  } else {
    for (let property in state.sinkConfigurations) {
      if (property) {
        const initialSinkConfig = state.sinkConfigurations[property];
        if (!isEmpty(initialSinkConfig)) {
          for (let subParams in initialSinkConfig) {
            if (subParams.isMandatory && isEmpty(state.sinkConfigurations[property][subParams.paramName])) {
              return false;
            }
          }
        }
      }
    }
  }
  return true;
};


const exploreDatasetState = (state = defaultState, action = defaultAction) => {
  switch (action.type) {
    case ExploreDatasetActions.onReset:
      state = {
        ...defaultState,
        operationConfigurations: {},
        sinkConfigurations: {}
      };
      break;
    case ExploreDatasetActions.updateActionType:
      state = {
        ...state,
        actionType: action.payload
      };
      break;
    case ExploreDatasetActions.setAvailableOperations:
      state = {
        ...state,
        availableOperations: action.payload
      };
      break;
    case ExploreDatasetActions.setAvailableSinks:
      state = {
        ...state,
        availableSinks: action.payload
      };
      break;
    case ExploreDatasetActions.setAvailableConfigurations:
      state = {
        ...state,
        availableEngineConfigurations: action.payload
      };
      break;
    case ExploreDatasetActions.setSchema:
        state = {
          ...state,
          schema: action.payload
        };
        break;
    case ExploreDatasetActions.updatePipelineName:
        state = {
          ...state,
          pipelineName: action.payload
        };
        break;
    case ExploreDatasetActions.updateOperationConfigurations: {
      state = {
        ...state,
        operationConfigurations: action.payload
      };
    }
      break;
    case ExploreDatasetActions.updateEngineConfigurations: {
      state = {
        ...state,
        engineConfigurations: action.payload
      };
    }
      break;
    case ExploreDatasetActions.setSinkConfigurations:
      state = {
        ...state,
        sinkConfigurations: action.payload
      };
      break;
  }
  // Check if all mandatory conditions required to save feature pipeline
  state["__complete"] = isOperationComplete(state);

  console.log("Explore Dataset state =>", state);
  return state;
};


const ExploreDatasetStore = createStore(
  combineReducers({
    exploreDatasetState,
  }),
  defaultInitialState
);

export default ExploreDatasetStore;
