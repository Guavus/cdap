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
const REMOTE_IP = "http://192.168.156.36:11015";
const SERVICE_PORT = "11015";
export const SERVER_IP = (window.location.hostname == "localhost") ? REMOTE_IP : (window.location.protocol + "//" + window.location.hostname + ":" + SERVICE_PORT);

export const PIPELINES_REQUEST = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/FeatureEngineeringPipelineService/methods/featureengineering/pipeline/getall";
export const PIPELINES_REQUEST_PARAMS = "?pipelineType=";

export const SCHEMA_REQUEST = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/DataPrepSchemaService/methods/featureengineering/dataschema/getall";
export const PROPERTY_REQUEST = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/AutoFeatureGenerationService/methods/featureengineering/feature/generation/configparams/get?getSchemaParams=true";
export const CONFIGURATION_REQUEST = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/AutoFeatureGenerationService/methods/featureengineering/feature/generation/configparams/get?getSchemaParams=false";
export const SAVE_REQUEST = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/AutoFeatureGenerationService/methods/featureengineering/$NAME/features/create";
export const EDIT_REQUEST = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/AutoFeatureGenerationService/methods/featureengineering/$NAME/features/edit";
export const READ_REQUEST = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/AutoFeatureGenerationService/methods/featureengineering/$NAME/features/read";
export const DELETE_REQUEST = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/AutoFeatureGenerationService/methods/featureengineering/$NAME/features/delete";
export const GET_PIPE_LINE_DATA = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/ManualFeatureSelectionService/methods/featureengineering/features/stats/get?pipelineName=";
export const GET_PIPE_LINE_FILTERED_DATA = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/ManualFeatureSelectionService/methods/featureengineering/";

export const PIPELINE_TYPES = ["All", "featureGeneration", "featureSelection"];

export const GET_PIPELINE = "GET_PIPELINE";
export const GET_SCHEMA = "GET_SCHEMA";
export const GET_PROPERTY = "GET_PROPERTY";
export const GET_CONFIGURATION = "GET_CONFIGURATION";
export const SAVE_PIPELINE = "SAVE_PIPELINE";
export const CREATE_PIPELINE = "CREATE_PIPELINE";
export const CLONE_PIPELINE = "CLONE_PIPELINE";
export const READ_PIPELINE = "READ_PIPELINE";
export const EDIT_PIPELINE = "EDIT_PIPELINE";
export const DELETE_PIPELINE = "DELETE_PIPELINE";
export const GET_PIPE_LINE_FILTERED = "GET_PIPE_LINE_FILTERED";


export const IS_OFFLINE = false;

export const PIPELINE_RUN_NAME = "pipelineRunName";
export const PIPELINE_SCHEMAS = "dataSchemaNames";

export const SUCCEEDED = "Succeeded";
export const DEPLOYED = "Deployed";
export const FAILED = "Failed";
export const RUNNING = "Running";