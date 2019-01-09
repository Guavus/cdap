export const SERVER_IP = "http://192.168.156.36:11015";

export const PIPELINES_REQUEST = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/FeatureEngineeringPipelineService/methods/featureengineering/pipeline/getall";
export const PIPELINES_REQUEST_PARAMS = "?pipelineType=";

export const SCHEMA_REQUEST = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/DataPrepSchemaService/methods/featureengineering/dataschema/getall";
export const PROPERTY_REQUEST = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/AutoFeatureGenerationService/methods/featureengineering/feature/generation/configparams/get?getSchemaParams=true";
export const CONFIGURATION_REQUEST = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/AutoFeatureGenerationService/methods/featureengineering/feature/generation/configparams/get?getSchemaParams=false";
export const SAVE_REQUEST = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/AutoFeatureGenerationService/methods/featureengineering/$NAME/features/create";
export const EDIT_REQUEST = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/AutoFeatureGenerationService/methods/featureengineering/$NAME/features/edit";
export const READ_REQUEST = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/AutoFeatureGenerationService/methods/featureengineering/$NAME/features/read";
export const DELETE_REQUEST = "/v3/namespaces/default/apps/FeatureEngineeringApp/services/AutoFeatureGenerationService/methods/featureengineering/$NAME/features/delete";

export const PIPELINE_TYPES = ["All", "featureGeneration", "featureSelection"];

export const GET_PIPELINE = "GET_PIPELINE";
export const GET_SCHEMA = "GET_SCHEMA";
export const GET_PROPERTY = "GET_PROPERTY";
export const GET_CONFIGURATION = "GET_CONFIGURATION";
export const SAVE_PIPELINE = "SAVE_PIPELINE";
export const CREATE_PIPELINE = "CREATE_PIPELINE";
export const COPY_PIPELINE = "COPY_PIPELINE";
export const READ_PIPELINE = "READ_PIPELINE";
export const EDIT_PIPELINE = "EDIT_PIPELINE";
export const DELETE_PIPELINE = "DELETE_PIPELINE";


export const IS_OFFLINE = false;
