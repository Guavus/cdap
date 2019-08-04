const appPath = 'http://192.168.133.92:11015/v3/namespaces/default/apps/ModelRepoMgmtApp/spark/ModelRepoMgmtService/methods/';
const experimentPath =  `${appPath}/experiments/`

const MRDSServiceApi = {
  fetchExperiments: serviceCreator(`${experimentPath}`),
  fetchDataset: serviceCreator(`${experimentPath}/:experimentName`),
  fetchModels: serviceCreator(`${experimentPath}/:experimentName/models`),
  fetchLatestModel: serviceCreator(`${experimentPath}/:experimentName/models/latest`),
};

function serviceCreator (url) {
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      return data;
    });
}

export default MRDSServiceApi;
