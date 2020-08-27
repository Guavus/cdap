/*
 * Copyright © 2015-2017 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

angular.module(PKG.name + '.commons')
  .directive('myDatasetSelector', function () {
    return {
      restrict: 'E',
      scope: {
        model: '=ngModel',
        config: '=',
        datasetType: '@',
        stageName: '='
      },
      templateUrl: 'widget-container/widget-dataset-selector/widget-dataset-selector.html',
      controller: function ($scope, myDatasetApi, myStreamApi, $state, EventPipe, $uibModal) {

        $scope.textPlaceholder = '';
        if ($scope.config['widget-attributes'] && $scope.config['widget-attributes']['placeholder']) {
          $scope.textPlaceholder = $scope.config['widget-attributes']['placeholder'];
        }

        var resource;
        $scope.list = [];

        if ($scope.datasetType === 'stream') {
          resource = myStreamApi;
        } else if ($scope.datasetType === 'dataset') {
          resource = myDatasetApi;
        }

        var params = {
          namespace: $state.params.namespace || $state.params.nsadmin
        };

        var dataMap = [];
        // This variable is to make sure that when the name of the dataset is changed
        // from a non-existing dataset to another non-existing one, then the schema is
        // not updated. However, the schema will be updated when changing from a non-existing
        // schema to an existing one, or vice versa
        var isCurrentlyExistingDataset;
        var initialized = false;
        var schema;
        var oldDataset;
        var newDataset;
        var modalOpen = false;
        // Dataset name encryption function
        var encryptValue = function (referenceId) {
          if (referenceId.startsWith('/')) {
            referenceId = referenceId.replace('/', 'file_');
          }
          return referenceId.replace(/[/]/g, '_--_').replace(/[:]/g, '-__-').replace(/[.]/g, '-___-')
            .replace(/[*]/g, '_---_');
        };
        // Dataset name decrypt function
        var decryptValue = function (referenceId) {
          if (referenceId.startsWith('file_')) {
            referenceId = referenceId.replace('file_', '/');
          }
          return referenceId.replace(/_--_/g, '/').replace(/-__-/g, ':').replace(/-___-/g, '.')
            .replace(/_---_/g, '*');
        };
        var showPopupFunc = function(schema, properties, oldDatasetName) {
          let sinkName = $scope.stageName;
          let confirmModal = $uibModal.open({
              templateUrl: '/assets/features/hydrator/templates/create/popovers/change-dataset-confirmation.html',
              size: 'lg',
              backdrop: 'static',
              keyboard: false,
              windowTopClass: 'confirm-modal hydrator-modal center change-dataset-confirmation-modal',
              controller: ['$scope', function($scope) {
                $scope.datasetName = decryptValue(params.datasetId);
                $scope.sinkName = sinkName;
                $scope.inputProperties = properties;
                $scope.schema = schema;

                // To track whether to apply schema, property or both.
                // Setting it to 'apply-schema' by default to retain older behaviour.
                $scope.applyType = 'apply-schema';

                $scope.getStatus = (confirm) => {
                  if(confirm) {
                    return {
                      applySchema: ($scope.applyType === 'apply-schema' || $scope.applyType === 'apply-both'),
                      applyProps: ($scope.applyType === 'apply-props' || $scope.applyType === 'apply-both')
                    };
                  } else {
                    return { applySchema: false, applyProps: false };
                  }
                };
              }]
            });
          modalOpen = true;

          /*
          `confirmObj` structure:
            {
              applySchema: true|false,
              applyPorps: true|false
            }
           */
          confirmModal.result.then((confirmObj) => {

            if(confirmObj.applyProps) {
              EventPipe.emit('plugin.apply.inputProperties', properties);
            }

            if (confirmObj.applySchema) {
              $scope.$parent.node['isSchemaApplied'] = true;
              isCurrentlyExistingDataset = true;

              if (!schema) {
                $scope.schemaError = true;
                EventPipe.emit('schema.clear');
              } else {
                $scope.schemaError = false;
                EventPipe.emit('dataset.selected', schema, null, true, $scope.model);
              }
            } else {
              $scope.$parent.node['isSchemaApplied'] = false;
            }

            // If nothing is selected(neither applySchema nor applyProperties) then in that case set the dataset name to whatever user has selected
            if(!confirmObj.applySchema && !confirmObj.applyProps) {
              $scope.model = oldDatasetName;
            }
            modalOpen = false;
          });
        };

        var debouncedPopup = _.debounce(showPopupFunc, 1500);

        resource.list(params)
          .$promise
          .then(function (res) {
            dataMap = [];
            $scope.list = res.map(function(item) {
                var decryptedName = decryptValue(item.name);
                item.name = decryptedName;
                dataMap.push(decryptedName);
                return item;
            });
            if (dataMap.indexOf($scope.model) === -1 ) {
              isCurrentlyExistingDataset = false;
            } else {
              isCurrentlyExistingDataset = true;
            }
          });

        $scope.showConfirmationModal = function() {
          if (oldDataset !== newDataset) {
            params.datasetId = encryptValue(newDataset);
            resource.get(params)
              .$promise
              .then(function (res) {
                schema = res.spec.properties.schema;

                if (!isCurrentlyExistingDataset && dataMap.indexOf(decryptValue(newDataset)) !== -1) {
                  if (debouncedPopup) {
                    debouncedPopup.cancel();
                  }

                  // Since we are showing schema seprately, we need to remove the schema proeprty
                  // otherwise it will show up in properties table also
                  let propsWithNoSchema = Object.assign({}, res.spec.properties);
                  delete propsWithNoSchema.schema;
                  showPopupFunc(schema, propsWithNoSchema, oldDataset);
                }
              });
          }
        };

        $scope.$watch('model', function (newDatasetName, oldDatasetName) {
          oldDataset = oldDatasetName;
          newDataset = newDatasetName;
          $scope.schemaError = false;

          if (debouncedPopup) {
            debouncedPopup.cancel();
          }
          if (dataMap.length === 0) {
            initialized = true;
          }
          if (isCurrentlyExistingDataset && dataMap.length > 0 && dataMap.indexOf($scope.model) === -1) {
            EventPipe.emit('dataset.selected', '', null, false);
            isCurrentlyExistingDataset = false;
            return;
          }

          if ($scope.datasetType === 'stream') {
            params.streamId = $scope.model;
          } else if ($scope.datasetType === 'dataset') {
            params.datasetId = $scope.model;
          }

          resource.get(params)
            .$promise
            .then(function (res) {
              if ($scope.datasetType === 'stream') {
                schema = JSON.stringify(res.format.schema);
                var format = res.format.name;
                EventPipe.emit('dataset.selected', schema, format);

              } else if ($scope.datasetType === 'dataset') {
                  schema = res.spec.properties.schema;

                  if (initialized && !isCurrentlyExistingDataset && newDataset !== oldDataset) {
                    if (!modalOpen) {
                      // Since we are showing schema seprately, we need to remove the schema proeprty
                      // otherwise it will show up in properties table also
                      let propsWithNoSchema = Object.assign({}, res.spec.properties);
                      delete propsWithNoSchema.schema;
                      debouncedPopup(schema, propsWithNoSchema, oldDataset);
                    }
                  } else {
                    initialized = true;

                    if ($scope.$parent.node['isSchemaApplied'] && schema) {
                      EventPipe.emit('dataset.selected', schema, null, true, $scope.model);
                    }
                  }
                }
            });
        });


        $scope.$on('$destroy', function () {
          EventPipe.cancelEvent('dataset.selected');
          if (debouncedPopup) {
            debouncedPopup.cancel();
          }
        });

      }
    };
  });
