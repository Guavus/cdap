/*
 * Copyright © 2016 Cask Data, Inc.
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

angular.module(PKG.name + '.feature.hydrator')
  .controller('HydratorPlusPlusListController',
  function(
    $scope, myPipelineApi, $stateParams, GLOBALS,
    mySettings, $state, $http, myHelpers,
    myAppsApi, myAlertOnValium, myLoadingService,
    $interval, moment, MyPipelineStatusMapper,
    myPipelineCommonApi, PROGRAM_STATUSES) {
    var vm = this;
    vm.filteredPipeline = [];
    vm.$interval = $interval;
    vm.moment = moment;
    vm.pipelineList = [];
    vm.filteredPipeline = [];
    vm.draftPipeLineList = [];
    vm.pipelineListLoaded = false;
    vm.MyPipelineStatusMapper = MyPipelineStatusMapper;
    var eventEmitter = window.CaskCommon.ee(window.CaskCommon.ee);

    vm.displayStatusCountMap = undefined;
    vm.displayStatus = 'All';
    vm.selectedStatusCount = 0;

    vm.pipelineTypeCountMap = undefined;
    vm.selectedPipelineType = 'All';
    vm.selectedTypePipelineCount = 0;

    vm.isPipelineActionsDisable = true;
    vm.pipelineLimit = [10, 15, 20, 25, 30, 35, 40];
    vm.PAGE_SIZE = vm.pipelineLimit[0];
    vm.GLOBALS = GLOBALS;
    vm.maxPageSize = 10;
    vm.searchText = '';
    vm.featureName = window.CaskCommon.ThemeHelper.Theme.featureNames.pipelines;
    vm.headerClass = !window.CaskCommon.ThemeHelper.Theme.showHeader ? 'no-header' : '';
    vm.isSelectAll = false;
    vm.isPipelineDownloadProgress = false;
    vm.checkForValidPage = (pageNumber) => {
      return (
        !Number.isNaN(pageNumber) &&
        Array.isArray(vm.pipelineList) &&
        Math.floor(vm.pipelineList.length) >= pageNumber
      );
    };
    vm.setCurrentPage = () => {
      let pageNumber = parseInt($stateParams.page, 10);
      if (pageNumber && vm.checkForValidPage(pageNumber)) {
        vm.currentPage = pageNumber;
      } else {
        vm.currentPage = 1;
      }
      vm.goToPage();
    };

    vm.reloadState = function() {
      $state.reload();
    };
    eventEmitter.on(window.CaskCommon.globalEvents.PUBLISHPIPELINE, vm.reloadState);

    vm.goToPage = function () {
      $stateParams.page = vm.currentPage;
      vm.pipelineListLoaded = true;
      $state.go('hydrator.list', $stateParams, {notify: false});
      vm.fetchRunsCount();
    };

    vm.pipelineDeleteStatus = (status, message) => {
      myLoadingService.hideLoadingIconImmediate();
      $state.reload()
        .then(function() {
          myAlertOnValium.show({
            type: status,
            content: message
          });
        });
    };

    vm.deleteDraft = function(draftId) {
      myLoadingService.showLoadingIcon()
      .then(function() {
        let draftName;
        mySettings.get('hydratorDrafts')
          .then(function(res) {
            let draft = myHelpers.objectQuery(res, $stateParams.namespace, draftId);
            if (draft) {
              draftName = draft.name;
              delete res[$stateParams.namespace][draftId];
            }
            return mySettings.set('hydratorDrafts', res);
          })
          .then(
            function success() {
              vm.pipelineDeleteStatus('success', `Pipeline draft ${draftName} deleted successfully`);
            },
            function error() {
              vm.pipelineDeleteStatus('danger', `Pipeline draft ${draftName} delete failed`);
            }
          );
      });
    };

    vm.deleteApp = function (appId) {
      myLoadingService.showLoadingIcon()
      .then(function() {
        var deleteParams = {
          namespace: $state.params.namespace,
          appId: appId,
          scope: $scope
        };
        return myAppsApi.delete(deleteParams)
          .$promise;
      })
      .then(
        function success() {
          vm.pipelineDeleteStatus('success', `Pipeline ${appId} deleted successfully`);
        },
        function error() {
          vm.pipelineDeleteStatus('danger', `Pipeline ${appId} delete failed`);
        }
      );
    };

    vm.deleteAll = function () {
      let pipelines = vm.selectedPipeline();
      if (pipelines.isSelectionEmpty) {
        return;
      }

      myLoadingService.showLoadingIcon()
        .then(function () {
          mySettings.get('hydratorDrafts')
            .then(function (res) {
              for (let i = 0; i < pipelines.draftList.length; i++) {
                let draft = myHelpers.objectQuery(res, $stateParams.namespace, pipelines.draftList[i].draftId);
                if (draft) {
                  delete res[$stateParams.namespace][pipelines.draftList[i].draftId];
                }
              }
              return mySettings.set('hydratorDrafts', res);
            })
            .then(function () {
              return myAppsApi.deleteAll({
                namespace: $state.params.namespace
              }, pipelines.pipelineList)
                .$promise;
            })
            .then(() => { vm.pipelineDeleteStatus('success', `Pipelines deleted successfully`); })
            .catch(err => { vm.pipelineDeleteStatus('danger', (err && err.data ? err.data : 'Pipelines deletion failed')); });
        });
    };

    $scope.$on('$destroy', function() {
      eventEmitter.off(window.CaskCommon.globalEvents.PUBLISHPIPELINE, vm.reloadState);
    });

    vm.getProgramId = (app) => {
      if (app.artifact.name === GLOBALS.etlDataPipeline) {
        return 'DataPipelineWorkflow';
      }
      if (app.artifact.name === GLOBALS.etlDataStreams) {
        return 'DataStreamsSparkStreaming';
      }
      return null;
    };
    vm.getProgramType = (artifactType) => {
      if (artifactType === GLOBALS.etlDataPipeline) {
        return 'Workflow';
      }
      if (artifactType === GLOBALS.etlDataStreams) {
        return 'Spark';
      }
      return null;
    };
    vm.fetchPipelinesRunsInfo = () => {
      let requestBody = [];
      requestBody = vm.pipelineList.map(app => {
        return {
          appId: app.name,
          programId: vm.getProgramId(app),
          programType: vm.getProgramType(app.artifact.name),
        };
      });
      myPipelineApi.getLatestRuns({
        namespace: $stateParams.namespace
      }, requestBody)
        .$promise
        .then(res => {
          res.forEach(resObj => {
            vm.pipelineList = vm.pipelineList.map(app => {
              // We need the default to be 0 for sorting
              let latestRun = resObj.runs[0] || {
                starting: 0,
                duration: 0
              };
              if (app.name === resObj.appId && !app.isDraft) {
                if (latestRun.starting !== 0) {
                  latestRun.duration = latestRun.end ?
                    latestRun.end - latestRun.starting
                  :
                    (new Date().getTime() / 1000) - latestRun.starting;
                  latestRun.duration = window.CaskCommon.CDAPHelpers.humanReadableDuration(Math.round(latestRun.duration));
                }
                app = Object.assign({}, app, {
                  latestRun: latestRun
                });
              }
              return app;
            });
          });
          // cask-sortable is used for updating the query params
          // This internal sort is done so that we could request for run counts for pipelines
          // that are currently visible.
          const sortOrder = $stateParams.reverse === 'reverse' ? 'desc' : 'asc';
          const sortByColumn = $stateParams.sortBy ? $stateParams.sortBy.split('.') : ['latestRun', 'starting'];
          vm.pipelineList = _.sortByOrder(
            vm.pipelineList,
            (pipeline) =>  myHelpers.objectQuery.apply(null, [pipeline].concat(sortByColumn)),
            [sortOrder]
          );
          vm.fetchRunsCount();
          vm.fetchWorkflowNextRunTimes();
          vm.updateStatusAppObject();
        });
    };

    vm.getPipelines = () => {
      myPipelineApi.list({
        namespace: $stateParams.namespace
      })
        .$promise
        .then(function success(res) {
          vm.pipelineList = res;
          vm.fetchDrafts()
            .then(() => {
              vm.setCurrentPage();
              vm.fetchPipelinesRunsInfo();
              // update check status
              vm.pipelineList.map((app) => app['selected'] = false);
            });
        });
    };

    vm.getCurrentVisiblePipelines = () => {
      return vm.pipelineList.slice(
        (vm.currentPage - 1) * vm.PAGE_SIZE,
        ((vm.currentPage - 1) * vm.PAGE_SIZE) + vm.PAGE_SIZE
      );
    };

    vm.fetchRunsCount = () => {
      let runsRequestBody = vm
        .getCurrentVisiblePipelines()
        .map(pipeline => {
          return {
            appId: pipeline.name,
            programType: vm.getProgramType(pipeline.artifact.name),
            programId: vm.getProgramId(pipeline)
          };
        });
      myPipelineApi.getRunsCount({
        namespace: $stateParams.namespace
      }, runsRequestBody)
        .$promise
        .then((runsCountList) => {
          vm.pipelineList = vm.pipelineList.map(pipeline => {
            if (pipeline.isDraft) {
              return pipeline;
            }
            let runsCountObj = _.find(runsCountList, { appId: pipeline.name});
            let numRuns = 0;
            if (typeof runsCountObj !== 'undefined') {
              numRuns = runsCountObj.runCount;
            }
            let newPipelineObj = pipeline;
            newPipelineObj.numRuns = numRuns;
            return newPipelineObj;
          });
        });
    };
    /**
     * Gets the next workflow run times. This must be called after batch objects have been created.
     */
    vm.fetchWorkflowNextRunTimes = () => {
      let batch = [];
      batch = vm.getCurrentVisiblePipelines()
        .filter(pipeline => pipeline.artifact.name !== GLOBALS.etlDataStreams)
        .map(pipeline => {
          var workflowId = 'DataPipelineWorkflow';
          return {
            appId: pipeline.name,
            programType: 'Workflow',
            programId: workflowId
          };
        });
      batch.forEach(function (batchParams) {
        myPipelineCommonApi.nextRunTime({
          namespace: $stateParams.namespace,
          app: batchParams.appId,
          programType: 'workflows',
          programName: batchParams.programId,
          scope: $scope
        })
          .$promise
          .then(function (res) {
          if (res && res.length) {
            vm.getCurrentVisiblePipelines()
              .forEach(function (app) {
                if (app.name === batchParams.appId) {
                  app.nextRun = res[0].time;
                }
              });
          }
        });
      });
    };

    vm.latestRunExists = (app) => app.latestRun.starting !== 0;

    vm.updateStatusAppObject =() => {
      angular.forEach(vm.pipelineList, function (app) {
        app.artifactType = app.artifact.name;
        if (app.isDraft) {
          app.displayStatus = vm.MyPipelineStatusMapper.lookupDisplayStatus(PROGRAM_STATUSES.DRAFT);
          return;
        }
        if (!vm.latestRunExists(app)) {
          app.displayStatus = vm.MyPipelineStatusMapper.lookupDisplayStatus(PROGRAM_STATUSES.DEPLOYED);
        } else {
          app.displayStatus = vm.MyPipelineStatusMapper.lookupDisplayStatus(app.latestRun.status);
        }
      });
      vm.displayStatusCountMap = _.countBy(vm.pipelineList.map(item => item.displayStatus).sort());
      vm.pipelineTypeCountMap = _.countBy(vm.pipelineList.map(item => item.artifact.name).sort());
      vm.displayStatusCountMap['All'] = vm.selectedStatusCount = vm.pipelineList.length;
      vm.pipelineTypeCountMap['All'] = vm.selectedTypePipelineCount = vm.pipelineList.length;
    };

    vm.fetchDrafts = () => {
      return mySettings.get('hydratorDrafts', true)
        .then(function(res) {
          let draftsList = myHelpers.objectQuery(res, $stateParams.namespace);
          vm.draftPipeLineList = draftsList;
          if (!angular.isObject(draftsList)) {
            return;
          }
          if (Object.keys(draftsList).length) {
            angular.forEach(res[$stateParams.namespace], function(value, key) {
              vm.pipelineList.push({
                isDraft: true,
                name: value.name,
                id: (value.__ui__  && value.__ui__.draftId) ? value.__ui__.draftId : key,
                artifact: value.artifact,
                description: myHelpers.objectQuery(value, 'description'),
                displayStatus: vm.MyPipelineStatusMapper.lookupDisplayStatus('DRAFT')
              });
            });
          }
        });
    };

    vm.updateSelectAllStatus = () => {
      //update select all check box status
      if(vm.filteredPipeline.length>0) {
        vm.isSelectAll = !vm.filteredPipeline.some((item) => !item.selected);
      } else{
        vm.isSelectAll = false;
      }
    };

    vm.pipeNameSearchChangeHandler = () => {
      setTimeout(() => vm.updateSelectAllStatus());
    };

    vm.selectDeselectAll = () => {
      vm.isSelectAll = !vm.isSelectAll;
      vm.filteredPipeline.map((app) => app['selected'] = vm.isSelectAll);

      vm.isPipelineActionsDisable = vm.selectedPipeline().isSelectionEmpty;
    };

    vm.selectDeselectPipeline = (event, pipeline) => {
      event.stopPropagation();
      pipeline.selected = event.target.checked;
      vm.updateSelectAllStatus();
      vm.isPipelineActionsDisable = vm.selectedPipeline().isSelectionEmpty;
    };


    vm.refreshScreen = () => {
      $state.reload()
      .then(function() {
        // capture the promise resolve state for feature use.
      });
    };

    vm.selectedPipeline = () => {
      let pipelines = {
        draftList: [],
        pipelineList: [],
        isSelectionEmpty: true,
      };
      angular.forEach(vm.pipelineList, function (app) {
        if (app.selected) {
          if (app.isDraft) {
            const { artifact, description, name, config } = vm.draftPipeLineList[app.id];
            pipelines.draftList.push({ artifact, description, name, config, draftId: app.id });
          } else {
            pipelines.pipelineList.push(app.name);
          }
        }
      });

      if (pipelines.draftList.length>0 || pipelines.pipelineList.length>0) {
        pipelines.isSelectionEmpty = false;
      }

      return pipelines;
    };

    vm.exportPipelines = () => {
      let reqData = vm.selectedPipeline();
      if (reqData.isSelectionEmpty) {
        return;
      }

      vm.isPipelineDownloadProgress = true;
      var exportReq = {
        method: 'POST',
        url:`/${$stateParams.namespace}/apps/export`,
        data: reqData,
        responseType: 'blob'
      };

      $http(exportReq).then((response) => {
        if(response.data) {
          const url = window.URL.createObjectURL(response.data);
          const dummyElement = document.createElement('a');
          dummyElement.style.display = 'none';
          dummyElement.href = url;
          dummyElement.download = 'pipelines.zip';
          document.body.appendChild(dummyElement);
          dummyElement.click();
          document.body.removeChild(dummyElement);
        }
        vm.isPipelineDownloadProgress = false;
        myAlertOnValium.show({
          type: 'success',
          content: 'Pipelines exported successfully'
        });
        console.log('download sucessfully', response);
      }, (err) => {
        vm.isPipelineDownloadProgress = false;
        myAlertOnValium.show({
          type: 'danger',
          content:  'Pipelines export failed'
        });
        console.log('not able to download', err);
      });

    };

    vm.goToPipelinePage = (pipeline) => {
      let url = '';
      if (pipeline.isDraft) {
        url = window.getHydratorUrl({
          stateName: 'hydrator.create',
          stateParams: {
            namespace: $stateParams.namespace,
            draftId: pipeline.id,
            artifactType: pipeline.artifact.name
          }
        });
      } else {
        url = window.getHydratorUrl({
          stateName: 'hydrator.detail',
          stateParams: {
            namespace: $stateParams.namespace,
            pipelineId: pipeline.name
          }
        });
      }

      window.location.href = url;
    };

    vm.getDisplayStatus = () => {
      vm.selectedStatusCount = vm.displayStatusCountMap !== undefined ? vm.displayStatusCountMap[vm.displayStatus] : 0;
      return vm.displayStatus === 'All' ? '' : vm.displayStatus;
    };

    vm.getPipelineType = () => {
      vm.selectedTypePipelineCount = vm.pipelineTypeCountMap !== undefined ? vm.pipelineTypeCountMap[vm.selectedPipelineType] : 0;
      return vm.selectedPipelineType === 'All' ? '' : vm.selectedPipelineType;
    };

    vm.getPipelines();

  });
