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
import isNil from 'lodash/isNil';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import AddFeatureWizard from '../AddFeatureWizard';
import FeatureTable from '../FeatureTable';
import {
  PIPELINE_TYPES,
  GET_PIPELINE,
  GET_SCHEMA,
  GET_PROPERTY,
  GET_CONFIGURATION,
  GET_SINKS,
  IS_OFFLINE,
  DELETE_PIPELINE,
  READ_PIPELINE,
  EDIT_PIPELINE,
  PIPELINE_RUN_NAME,
  PIPELINE_SCHEMAS,
  CLONE_PIPELINE,
  GET_PIPE_LINE_DATA,
  TOTAL,
  ERROR_MESSAGES,
  DELETE,
  SAVE,
  PIPELINE_SAVED_MSG,
  CLOSE,
  OK,
  CANCEL,
  SHOW_PIPELINE,
  GET_APP_DETAILS,
  GET_STATUS,
  CHECK_AFE_PROGRAM_INTERVAL,
  CHECK_AFE_PIPELINES_INTERVAL
} from '../config';
import { Observable } from 'rxjs/Observable';
import AlertModal from '../AlertModal';
import FeatureSelection from '../FeatureSelection';
import { getPropertyUpdateObj, updatePropertyMapWithObj, getFeatureObject, checkResponseError, getDefaultRequestHeader } from '../util';
import NamespaceStore from 'services/NamespaceStore';
import FEDataServiceApi from '../feDataService';
import { Theme } from 'services/ThemeHelper';
import StatusBar from "./StatusBar";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { SUCCEEDED, DEPLOYED, FAILED, RUNNING, FEATURE_GENERATED, FEATURE_SELECTED, NEW_FEATURE_EVENT } from '../config';
import { isNilOrEmpty } from 'services/helpers';


require('./LandingPage.scss');

const SchemaData = [{ "schemaName": "accounts", "schemaColumns": [{ "columnName": "account_id", "columnType": "long" }] }, { "schemaName": "errors", "schemaColumns": [{ "columnName": "error_id", "columnType": "long" }, { "columnName": "account_id", "columnType": "long" }, { "columnName": "device_mac_address", "columnType": "string" }, { "columnName": "event_is_startup", "columnType": "boolean" }, { "columnName": "event_is_visible", "columnType": "boolean" }, { "columnName": "device_video_firmware", "columnType": "string" }, { "columnName": "event_cause_category", "columnType": "string" }, { "columnName": "event_cause_id", "columnType": "string" }, { "columnName": "hour", "columnType": "int" }, { "columnName": "device_video_model", "columnType": "string" }, { "columnName": "event_hostname", "columnType": "string" }, { "columnName": "event_date_time", "columnType": "string" }, { "columnName": "ets_timestamp", "columnType": "string" }, { "columnName": "date_hour", "columnType": "string" }, { "columnName": "count", "columnType": "int" }] }];
const PropertyData = [{ "paramName": "Indexes", "description": "" }, { "paramName": "Relationships", "description": "" }, { "paramName": "TimestampColumns", "description": "" }, { "paramName": "TimeIndexColumns", "description": "" }, { "paramName": "CategoricalColumns", "description": "" }, { "paramName": "IgnoreColumns", "description": "" }, { "paramName": "multiFieldTransFunctionInputColumns", "description": "" }, { "paramName": "multiFieldAggFunctionInputColumns", "description": "" }, { "paramName": "TargetEntity", "description": "" }, { "paramName": "TargetEntityPrimaryField", "description": "" }];
const ConfigurationData = [{ "paramName": "DFSDepth", "description": "", "isCollection": false, "dataType": "int" }, { "paramName": "TrainingWindows", "description": "", "isCollection": true, "dataType": "int" }, { "paramName": "WindowEndTime", "description": "", "isCollection": false, "dataType": "string" }];

class LandingPage extends React.Component {

  featureTypes = [{ id: 1, name: FEATURE_GENERATED, selected: false }, { id: 2, name: FEATURE_SELECTED, selected: false }]
  currentPipeline;
  savedFEPipeline;
  sampleData = [
    { "featureName": "plusonelog_first_errors_numwords_event_hostname____24", "featureStatistics": { "Mean": 0.04316484976694808, "Norm L1": 59.61065752815533, "Norm L2": 6.427982513741404, "Max": 0.6931471805599453, "50 Percentile": 0.6931471805599453, "Variance": 0.02807672037699529, "No. of Non Zeros": 86.0, "25 Percentile": 0.6931471805599453, "Min": 0.0, "No. of Nulls": 1295, "Inter Quartile Percentile": 0.0, "75 Percentile": 0.6931471805599453 } }
  ]
  data_original = [];
  currentOperation = "";
  programs;
  runningProgramsId;
  checkStatusInterval;
  checkPipelineInterval;

  constructor(props) {
    super(props);
    this.toggleFeatureWizard = this.toggleFeatureWizard.bind(this);
    this.onWizardClose = this.onWizardClose.bind(this);
    this.state = {
      data: [],
      dropdownOpen: false,
      showFeatureWizard: false,
      openAlertModal: false,
      alertMessage: "",
      isAnyAFEServiceRunning: false,
      primaryAlertBtnText: "OK",
      secondaryAlertBtnText: "CANCEL",
      pipelineTypes: PIPELINE_TYPES,
      selectedPipelineType: 'All',
      displayFeatureSelection: false,
      pipeLineData: this.sampleData,
      selectedPipeline: {},
      selectedPipelineRequestConfig: {},
      isDataLoading: false,
      enablingInProgress: false,
      currentNamespace: NamespaceStore.getState().selectedNamespace,
      statusList: this.generateStatusList([])

    };
  }

  componentWillMount() {
    this.fetchAppDetails();
    if (IS_OFFLINE) {
      this.props.setAvailableProperties(PropertyData);
      this.props.setAvailableConfigurations(ConfigurationData);
      this.props.setAvailableSchemas(SchemaData);
    } else {
      this.fetchWizardData();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.showFeatureWizard !== prevState.showFeatureWizard) {
      var wizard = new CustomEvent(NEW_FEATURE_EVENT, {detail: {'isOpen': this.state.showFeatureWizard}});
      window.top.dispatchEvent(wizard);
    }
  }


  fetchWizardData() {
    this.fetchProperties();
    this.fetchConfiguration();
    this.fetchSchemas();
    this.fetchSinks();
  }

  toggleFeatureWizard() {
    let open = !this.state.showFeatureWizard;
    if (open) {
      this.props.resetStore();
      this.fetchWizardData();
    }
    this.setState({
      showFeatureWizard: open
    });

  }

  toggleDropDown() {
    this.setState(prevState => ({ dropdownOpen: !prevState.dropdownOpen }));
  }

  onPipeLineTypeChange = (type) => {
    this.setState({
      selectedPipelineType: type
    });
    this.getPipelines(type);
  }

  onStatusSelectionChange = (status) => {
    if (status == 'All') {
      this.setState({
        data: [...this.data_original]
      });
    } else {
      this.setState({
        data: this.data_original.filter((item) => item.status === status)
      });
    }
  }

  generateStatusList(list) {

    let runningCount = 0;
    let sucessCount = 0;
    let deployedCount = 0;
    let failCount = 0;
    let totalCount = 0;
    list.forEach(element => {
      totalCount++;
      if (element.status === RUNNING) {
        runningCount++;
      } else if (element.status === SUCCEEDED) {
        sucessCount++;
      } else if (element.status === DEPLOYED) {
        deployedCount++;
      } else if (element.status === FAILED) {
        failCount++;
      }
    });
    return [
      { id: 0, name: TOTAL, count: totalCount, selected: false },
      { id: 1, name: RUNNING, count: runningCount, selected: false },
      { id: 2, name: SUCCEEDED, count: sucessCount, selected: false },
      { id: 3, name: DEPLOYED, count: deployedCount, selected: false },
      { id: 4, name: FAILED, count: failCount, selected: false }];
  }

  fetchAppDetails() {
    FEDataServiceApi.appDetails(
      {
        namespace: NamespaceStore.getState().selectedNamespace
      }, {}, getDefaultRequestHeader()).subscribe(
        result => {
          if (isNil(result) || isNil(result.programs)) {
            this.handleError(result, GET_APP_DETAILS);
          } else {
            this.programs = result.programs.map((program) => {
              return {"appId": program.app,"programType":program.type,"programId":program.name};
            });
            console.log(this.programs);
            this.checkStatusCounter = 0;
            this.fetchProgramStatus();
          }
        },
        error => {
          this.handleError(error, GET_APP_DETAILS);
        }
      );
  }

  fetchProgramStatus() {
    this.runningProgramsId = new Set();
    FEDataServiceApi.status(
      {
        namespace: NamespaceStore.getState().selectedNamespace
      }, this.programs, getDefaultRequestHeader()).subscribe(
        result => {
          if (isNilOrEmpty(result)) {
            this.handleError(result, GET_STATUS);
          } else {
            result.forEach((program) => {
              if (program.status == "RUNNING") {
                this.runningProgramsId.add(program.programId);
              }
            });
            const isAnyAFEServiceRunning = this.runningProgramsId.size > 0;
            this.setState({
              isAnyAFEServiceRunning: isAnyAFEServiceRunning,
            });
            if (isAnyAFEServiceRunning) {
              clearInterval(this.checkStatusInterval);
              this.getPipelines(this.state.selectedPipelineType);
              this.startPipeLineInterval();
            }
             console.log(this.runningProgramsId);
            }
        },
        error => {
          this.handleError(error, GET_STATUS);
        }
      );
  }

  startPrograms() {
    clearInterval(this.checkStatusInterval);
    this.setState({
      enablingInProgress: true
    });
    this.checkStatusCounter = 0;
    FEDataServiceApi.start(
      {
        namespace: NamespaceStore.getState().selectedNamespace
      }, this.programs.filter((program) => {
        return !this.runningProgramsId.has(program.programId);
      }), getDefaultRequestHeader()).subscribe(
        result => {
          if (isNilOrEmpty(result)) {
            this.handleError(result, GET_STATUS);
          } else {
            this.checkStatusInterval = setInterval(() => {
              this.fetchProgramStatus();
            }, CHECK_AFE_PROGRAM_INTERVAL);
          }
        },
        error => {
          this.handleError(error, GET_STATUS);
        }
      );
  }

  startPipeLineInterval() {
    clearInterval(this.checkPipelineInterval);
    this.checkPipelineInterval = setInterval(() => {
       this.getPipelines(this.state.selectedPipelineType);
    }, CHECK_AFE_PIPELINES_INTERVAL);
  }

  getPipelines(type) {
    this.setState({
      isDataLoading: true
    });
    FEDataServiceApi.pipelines(
      {
        namespace: NamespaceStore.getState().selectedNamespace,
        type: type == "All" ? '' : type
      }, {}, getDefaultRequestHeader()).subscribe(
        result => {
          if (checkResponseError(result) || isNil(result["pipelineInfoList"])) {
            this.handleError(result, GET_PIPELINE);
            this.setState({
              data: [],
              isDataLoading: false
            });
          } else {
            this.data_original = result["pipelineInfoList"];
            this.setState({
              data: result["pipelineInfoList"],
              statusList: this.generateStatusList(this.data_original),
              isDataLoading: false
            });
          }
        },
        error => {
          this.setState({
            data: [],
            isDataLoading: false
          });
          this.handleError(error, GET_PIPELINE);
        }
      );
  }


  onFeatureSelection(pipeline) {
    this.currentPipeline = pipeline;
    FEDataServiceApi.readPipeline({
      namespace: NamespaceStore.getState().selectedNamespace,
      pipeline: pipeline.pipelineName
    }, {}, getDefaultRequestHeader()).subscribe(
      result => {
        if (checkResponseError(result) || isNil(result["featureGenerationRequest"])) {
          this.handleError(result, READ_PIPELINE);
        } else {
          this.fetchPipelineData(pipeline,result["featureGenerationRequest"]);
        }
      },
      error => {
        this.handleError(error, READ_PIPELINE);
      }
    );
  }

  fetchPipelineData(pipeline, selectedPipelineRequestConfig) {
    FEDataServiceApi.pipelineData({
      namespace: NamespaceStore.getState().selectedNamespace,
      pipeline: pipeline.pipelineName
    }, {}, getDefaultRequestHeader()).subscribe(
      result => {
        if (checkResponseError(result) || isNil(result["featureStatsList"])) {
          this.handleError(result, GET_PIPE_LINE_DATA);
        } else {
          this.setState({
            pipeLineData: result["featureStatsList"],
            data: result["featureStatsList"],
            selectedPipeline: this.currentPipeline,
            selectedPipelineRequestConfig: selectedPipelineRequestConfig,
            displayFeatureSelection: true
          });
        }
      },
      error => {
        this.handleError(error, GET_PIPE_LINE_DATA);
      }
    );
  }



  viewPipeline(pipeline) {
    if (pipeline && pipeline.pipelineName) {
      this.nagivateToPipeline(pipeline.pipelineName);
    }
  }

  nagivateToPipeline(pipelineName) {
    let navigatePath = `${window.location.origin}/pipelines/ns/${NamespaceStore.getState().selectedNamespace}/view/${pipelineName}`;
    window.location.href = navigatePath;
   }

  editPipeline(type, pipeline) {
    this.currentPipeline = pipeline;
    FEDataServiceApi.readPipeline({
      namespace: NamespaceStore.getState().selectedNamespace,
      pipeline: pipeline.pipelineName
    }, {}, getDefaultRequestHeader()).subscribe(
      result => {
        if (checkResponseError(result) || isNil(result["featureGenerationRequest"])) {
          this.handleError(result, READ_PIPELINE);
        } else {
          this.updateStoreForEdit(type, result["featureGenerationRequest"]);
        }
      },
      error => {
        this.handleError(error, READ_PIPELINE);
      }
    );
  }

  updateStoreForEdit(type, pipelineData) {
    if (!isEmpty(pipelineData)) {
      let propertyMap = new Map();
      let configurationList = [];
      this.props.updateOperationType(type);
      const sinkConfiguration = {};
      for (let property in pipelineData) {
        switch (property) {
          case PIPELINE_RUN_NAME: {
            if (type == CLONE_PIPELINE) {
              this.props.updateFeatureName("Copy_of_" + pipelineData.pipelineRunName);
            } else {
              this.props.updateFeatureName(pipelineData.pipelineRunName);
            }
          }
            break;
          case PIPELINE_SCHEMAS: {
            let selectedSchemas = [];
            pipelineData.dataSchemaNames.forEach((schema) => {
              let schemaData = find(this.props.availableSchemas, { schemaName: schema });
              if (!isNil(schemaData)) {
                selectedSchemas.push({
                  schemaName: schema,
                  selected: true,
                  schemaColumns: schemaData.schemaColumns
                });
              }
            });
            if (!isEmpty(selectedSchemas)) {
              this.props.setSelectedSchemas(selectedSchemas);
            }
          }
            break;
          default:
            if (!isNil(pipelineData[property])) {
              let propertyData = find(this.props.availableProperties, { paramName: property });
              if (!isNil(propertyData)) {
                if (isEmpty(propertyData.subParams)) {
                  if (propertyData.isCollection) {
                    let schemaMap = new Map();
                    pipelineData[property].forEach(propData => {
                      if (schemaMap.has(propData.table)) {
                        let columns = schemaMap.get(propData.table);
                        columns.push({ columnName: propData.column });
                        schemaMap.set(propData.table, columns);
                      } else {
                        schemaMap.set(propData.table, [{ columnName: propData.column }]);
                      }
                    });
                    schemaMap.forEach((value, key) => {
                      let updatedObj = getPropertyUpdateObj(propertyData, "none", key, value);
                      updatePropertyMapWithObj(propertyMap, updatedObj);
                    });
                  } else {
                    let updatedObj = getPropertyUpdateObj(propertyData, "none", pipelineData[property].table,
                      [{ columnName: pipelineData[property].column }]);
                    updatePropertyMapWithObj(propertyMap, updatedObj);
                  }
                } else {
                  let dataObj = pipelineData[property][0];
                  for (let subPropertyName in dataObj) {
                    let subProperty = find(propertyData.subParams, { paramName: subPropertyName });
                    if (!isNil(subProperty)) {
                      if (subProperty.isCollection) {
                        let schemaMap = new Map();
                        if (dataObj[subPropertyName]) {
                          dataObj[subPropertyName].forEach(propData => {
                            if (schemaMap.has(propData.table)) {
                              let columns = schemaMap.get(propData.table);
                              columns.push({ columnName: propData.column });
                              schemaMap.set(propData.table, columns);
                            } else {
                              schemaMap.set(propData.table, [{ columnName: propData.column }]);
                            }
                          });
                        }

                        schemaMap.forEach((value, key) => {
                          let updatedObj = getPropertyUpdateObj(propertyData, subPropertyName, key, value);
                          updatePropertyMapWithObj(propertyMap, updatedObj);
                        });
                      } else {
                        let updatedObj = getPropertyUpdateObj(propertyData, subPropertyName, dataObj[subPropertyName].table,
                          [{ columnName: dataObj[subPropertyName].column }]);
                        updatePropertyMapWithObj(propertyMap, updatedObj);
                      }
                    }
                  }
                }
              } else {
                const sinkConfig = find(this.props.availableSinks, { paramName: property });
                if (sinkConfig) {
                  sinkConfiguration[property] = pipelineData[property];
                } else {
                  configurationList.push({
                    name: property,
                    value: pipelineData[property].toString(),
                  });
                }
              }
            }
            break;
        }
      }
      if (propertyMap.size > 0) {
        this.props.updatePropertyMap(propertyMap);
      }
      this.props.setSinkConfigurations(sinkConfiguration);
      if (!isEmpty(configurationList)) {
        this.updateConfigurationList(this.props.availableConfigurations, configurationList);
      }
      this.setState(prevState => ({ showFeatureWizard: !prevState.showFeatureWizard }));
    }
  }

  updateConfigurationList(availableConfigurations, configList) {
    let configurationList = availableConfigurations.map((config) => {
      let configObj = find(configList, { name: config.paramName });
      return {
        name: config.paramName,
        displayName: isEmpty(config.displayName) ? config.paramName : config.displayName,
        value: isEmpty(configObj) ? (isEmpty(config.defaultValue) ? "" : config.defaultValue) : configObj.value,
        dataType: config.dataType,
        isCollection: config.isCollection,
        isMandatory: config.isMandatory,
        description: config.description,
      };
    });
    this.props.updateConfigurationList(configurationList);
  }

  onDeletePipeline(pipeline) {
    this.currentPipeline = pipeline;
    this.currentOperation = DELETE;
    this.setState({
      openAlertModal: true,
      alertMessage: 'Are you sure you want to delete: ' + pipeline.pipelineName,
      primaryAlertBtnText: OK,
      secondaryAlertBtnText: CANCEL,
    });
  }

  onPipelineSaved(savedFEPipeline) {
    this.savedFEPipeline = savedFEPipeline;
    this.currentOperation = SAVE;
    this.setState({
      openAlertModal: true,
      alertMessage: PIPELINE_SAVED_MSG,
      primaryAlertBtnText: SHOW_PIPELINE,
      secondaryAlertBtnText: CLOSE,
    });
  }

  onAlertClose(action) {
     if (this.currentPipeline && this.currentOperation == DELETE) {
      if (action === this.state.primaryAlertBtnText) {
        this.deletePipeline(this.currentPipeline);
      }
    } else if (this.savedFEPipeline && this.currentOperation == SAVE) {
      if (action === this.state.primaryAlertBtnText) {
        this.nagivateToPipeline(this.savedFEPipeline);
      } else {
        this.getPipelines(this.state.selectedPipelineType);
      }
    }
    this.setState({
      openAlertModal: false
    });
  }

  deletePipeline(pipeline) {
    FEDataServiceApi.deletePipeline({
      namespace: NamespaceStore.getState().selectedNamespace,
      pipeline: pipeline.pipelineName
    },{} , getDefaultRequestHeader()).subscribe(
      result => {
        if (checkResponseError(result)) {
          this.handleError(result, DELETE_PIPELINE);
        } else {
          this.getPipelines(this.state.selectedPipelineType);
        }
      },
      error => {
        this.handleError(error, DELETE_PIPELINE);
      }
    );
  }

  handleError(error, type) {
    console.log('error ==> ' + error + "| type => " + type);
  }

  onWizardClose() {
    this.setState({
      showFeatureWizard: !this.state.showFeatureWizard
    });
  }

  openConfirmationModal() {
    this.setState({
      openConfirmation: true
    });
  }

  closeConfirmationModal() {
    this.setState({
      openConfirmation: false
    });
  }

  saveFeature() {
    let featureObject = getFeatureObject(this.props);
    let fetchObserver;
    let type = this.props.operationType;
    if (type == EDIT_PIPELINE) {
      fetchObserver = FEDataServiceApi.updatePipeline({
        namespace: NamespaceStore.getState().selectedNamespace,
        pipeline: featureObject.pipelineRunName
      }, featureObject, getDefaultRequestHeader());
    } else {
      fetchObserver = FEDataServiceApi.createPipeline({
        namespace: NamespaceStore.getState().selectedNamespace,
        pipeline: featureObject.pipelineRunName
      }, featureObject, getDefaultRequestHeader());
    }

    return Observable.create((observer) => {
      fetchObserver.subscribe(
        result => {
          if (checkResponseError(result)) {
            this.handleError(result, type);
            if (result && !isNil(result.message)) {
              observer.error(result.message);
            } else {
              observer.error(ERROR_MESSAGES.SAVE_PIPELINE);
            }
          } else {
            this.onPipelineSaved(featureObject.pipelineRunName);
            observer.next(result);
            observer.complete();
          }
        },
        err => {
          this.handleError(err, type);
          if (err && !isNil(err.message)) {
            observer.error(err.message);
          } else {
            observer.error(ERROR_MESSAGES.SAVE_PIPELINE);
          }
        }
      );
    });
  }


  getFeatureObject(props) {
    let featureObject = {
      pipelineRunName: props.featureName
    };

    if (!isEmpty(props.selectedSchemas)) {
      featureObject["dataSchemaNames"] = props.selectedSchemas.map(schema => schema.schemaName);
    }
    if (!isNil(props.propertyMap)) {
      props.propertyMap.forEach((value, property) => {
        if (value) {
          featureObject[property] = [];
          let subPropObj = {};
          value.forEach(subParam => {
            if (subParam.header == "none") {
              subParam.value.forEach((columns, schema) => {
                if (!isEmpty(columns)) {
                  columns.forEach((column) => {
                    if (subParam.isCollection) {
                      featureObject[property].push({
                        table: schema,
                        column: column.columnName
                      });
                    } else {
                      featureObject[property] = {
                        table: schema,
                        column: column.columnName
                      };
                    }
                  });
                }
              });
            } else {
              subParam.value.forEach((columns, schema) => {
                if (!isEmpty(columns)) {
                  let subPropValue = subParam.isCollection ? [] : {};
                  columns.forEach((column) => {
                    if (subParam.isCollection) {
                      subPropValue.push({
                        table: schema,
                        column: column.columnName
                      });
                    } else {
                      subPropValue = {
                        table: schema,
                        column: column.columnName
                      };
                    }
                  });
                  subPropObj[subParam.header] = subPropValue;
                }
              });
            }
          });
          if (!isEmpty(subPropObj)) {
            featureObject[property].push(subPropObj);
          }
        }
      });
    }
    if (!isEmpty(props.configurationList)) {
      props.configurationList.forEach((configuration) => {
        if (!isNil(configuration.value)) {
          switch (configuration.dataType) {
            case 'int':
              if (configuration.isCollection) {
                let values = configuration.value.split(",");
                featureObject[configuration.name] = values.map(value => parseInt(value));
              } else {
                featureObject[configuration.name] = parseInt(configuration.value);
              }
              break;
            default:
              if (configuration.isCollection) {
                featureObject[configuration.name] = configuration.value.split(",");
              } else {
                featureObject[configuration.name] = configuration.value;
              }
          }
        }
      });
    }
    return featureObject;
  }



  initWizard(data) {
    this.props.setAvailableSchemas(data);
    this.setState({
      showFeatureWizard: true
    });
  }

  fetchSchemas() {
    FEDataServiceApi.schema({
      namespace: NamespaceStore.getState().selectedNamespace
    }, {}, getDefaultRequestHeader()).subscribe(
      result => {
        if (checkResponseError(result) || isNil(result["dataSchemaList"])) {
          this.handleError(result, GET_SCHEMA);
        } else {
          this.props.setAvailableSchemas(result["dataSchemaList"]);
        }
      },
      error => {
        this.handleError(error, GET_SCHEMA);
      }
    );
  }

  fetchProperties() {
    FEDataServiceApi.metadataConfig({
      namespace: NamespaceStore.getState().selectedNamespace
    }, {}, getDefaultRequestHeader()).subscribe(
      result => {
        if (checkResponseError(result)) {
          this.handleError(result, GET_PROPERTY);
        } else {
          let configParamList = result["configParamList"];
          if (!isNil(configParamList)) {
            let mandatoryParamList = configParamList.filter(item => item.isMandatory);
            let nonMandatoryParamList = configParamList.filter(item => !item.isMandatory);
            this.props.setAvailableProperties(mandatoryParamList.concat(nonMandatoryParamList));
          }
        }
      },
      error => {
        this.handleError(error, GET_PROPERTY);
      }
    );
  }

  fetchConfiguration() {
    FEDataServiceApi.engineConfig({
      namespace: NamespaceStore.getState().selectedNamespace
    }, {}, getDefaultRequestHeader()).subscribe(
      result => {
        if (checkResponseError(result) || isNil(result["configParamList"])) {
          this.handleError(result, GET_CONFIGURATION);
        } else {
          this.props.setAvailableConfigurations(result["configParamList"]);
          this.updateConfigurationList(result["configParamList"], []);
        }
      },
      error => {
        this.handleError(error, GET_CONFIGURATION);
      }
    );
  }

  fetchSinks() {
    FEDataServiceApi.availableSinks({
      namespace: NamespaceStore.getState().selectedNamespace
    }, {}, getDefaultRequestHeader()).subscribe(
      result => {
        if (checkResponseError(result) || isNil(result["configParamList"])) {
          this.handleError(result, GET_SINKS);
        } else {
          this.props.setAvailableSinks(result["configParamList"]);
        }
      },
      error => {
        this.handleError(error, GET_SINKS);
      }
    );
  }

  render() {
    return (
      <div className='landing-page-container'>
      {
        this.state.isAnyAFEServiceRunning ?
        (
        this.state.displayFeatureSelection ?
          <div className="feature-selection">
            <FeatureSelection nagivateToParent={this.viewFeatureGeneration}
              selectedPipeline={this.state.selectedPipeline}
              pipelineRequestConfig = { this.state.selectedPipelineRequestConfig }
              pipeLineData={this.state.pipeLineData}></FeatureSelection>
          </div>
          : <div className="feature-generation">
            <div className='top-control'>
              <div className='top-panel'>
                <div className='type-selector'>
                  <div className="type-label">Pipeline Type:</div>
                  <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropDown.bind(this)}>
                    <DropdownToggle caret>
                      {this.state.selectedPipelineType}
                    </DropdownToggle>
                    <DropdownMenu>
                      {
                        this.state.pipelineTypes.map((type) => {
                          return (
                            <DropdownItem key={type} onClick={this.onPipeLineTypeChange.bind(this, type)}>{type}</DropdownItem>
                          );
                        })
                      }
                    </DropdownMenu>
                  </Dropdown>
                  <i className="fa fa-refresh refresh-button" onClick={() => this.getPipelines(this.state.selectedPipelineType)}></i>
                </div>
              </div>

              <StatusBar statusList={this.state.statusList}></StatusBar>
              <button className={"feature-button " + (Theme && Theme.isCustomerMWC ? 'feature-button-mwc' : '')} onClick={this.toggleFeatureWizard}>+ Add New</button>
            </div>
            <FeatureTable data={this.state.data}
              isDataLoading={this.state.isDataLoading}
              onView={this.viewPipeline.bind(this)}
              onEdit={this.editPipeline.bind(this, EDIT_PIPELINE)}
              onClone={this.editPipeline.bind(this, CLONE_PIPELINE)}
              onFeatureSelection={this.onFeatureSelection.bind(this)}
              onDelete={this.onDeletePipeline.bind(this)} />
            <AddFeatureWizard showWizard={this.state.showFeatureWizard}
              onClose={this.onWizardClose}
              onSubmit={this.saveFeature.bind(this)} />
            <AlertModal open={this.state.openAlertModal} message={this.state.alertMessage}
              primaryBtnText = {this.state.primaryAlertBtnText} secondaryBtnText = {this.state.secondaryBtnText}
              onClose={this.onAlertClose.bind(this)} />
          </div>
        ): (<div className = "fullscreen-layout">
            <button className="feature-button" disabled = {this.state.enablingInProgress} onClick={this.startPrograms.bind(this)}>Enable Feature Engineering</button>
        </div>)
      }
      </div>
    );
  }

  viewFeatureGeneration = () => {
    this.setState({ displayFeatureSelection: false });
    this.getPipelines(this.state.selectedPipelineType);
  }
}
export default LandingPage;
LandingPage.propTypes = {
  setAvailableProperties: PropTypes.func,
  setAvailableConfigurations: PropTypes.func,
  setAvailableSchemas: PropTypes.func,
  resetStore: PropTypes.func,
  updateOperationType: PropTypes.func,
  updateFeatureName: PropTypes.func,
  availableSchemas: PropTypes.array,
  setSelectedSchemas: PropTypes.func,
  availableProperties: PropTypes.array,
  availableSinks: PropTypes.array,
  updatePropertyMap: PropTypes.func,
  availableConfigurations: PropTypes.array,
  updateConfigurationList: PropTypes.func,
  operationType: PropTypes.string,
  setAvailableSinks: PropTypes.func,
  setSinkConfigurations: PropTypes.func
};
