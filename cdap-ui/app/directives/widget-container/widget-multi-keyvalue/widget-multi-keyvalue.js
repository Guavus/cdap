/*
 * Copyright © 2015 Cask Data, Inc.
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

angular.module(PKG.name + '.commons')
  .directive('myMultiKeyValue', function () {
    return {
      restrict: 'E',
      templateUrl: 'widget-container/widget-multi-keyvalue/widget-multi-keyvalue.html',
      scope: {
        disabled: '=',
        model: '=ngModel',
        config: '='
      },
      controller: function MultiKeyValueController($scope, myHelpers) {
        'ngInject';

        // Types of input for a key or value.
        const INPUT_SCHEMA_KEYVALUE_INPUT_TYPE = 'input-schema';
        const PREDEFINED_KEYVALUE_INPUT_TYPE = 'predefined';
        const CUSTOM_KEYVALUE_INPUT_TYPE = 'custom';

        // Delimeters used to serialize the value.
        const DEFAULT_VALUE_SEPARATOR = ',';
        const DEFAULT_KEY_VALUE_SEPARTOR = ':';
        const DEFAULT_KEY_VALUE_PAIR_SEPARTOR = ';';

        function init() {
          try {
            $scope.properties = [];

            $scope.keyPlaceholder = myHelpers.objectQuery($scope.config, 'widget-attributes', 'key-placeholder') || 'key';
            $scope.valuePlaceholder = myHelpers.objectQuery($scope.config, 'widget-attributes', 'value-placeholder') || 'value';

            $scope.keyInputType = myHelpers.objectQuery($scope.config, 'widget-attributes', 'key-input-type') || INPUT_SCHEMA_KEYVALUE_INPUT_TYPE;
            $scope.valueInputType = myHelpers.objectQuery($scope.config, 'widget-attributes', 'value-input-type') || INPUT_SCHEMA_KEYVALUE_INPUT_TYPE;

            $scope.valueSeparator = myHelpers.objectQuery($scope.config, 'widget-attributes', 'value-separator') || DEFAULT_VALUE_SEPARATOR;
            $scope.keyValueSeparator = myHelpers.objectQuery($scope.config, 'widget-attributes', 'key-value-separator') || DEFAULT_KEY_VALUE_SEPARTOR;
            $scope.keyValuePairSeparator = myHelpers.objectQuery($scope.config, 'widget-attributes', 'key-value-pair-separator') || DEFAULT_KEY_VALUE_PAIR_SEPARTOR;

            // Get the dropdown options for key and value pairs.
            $scope.keyOptions = getKeyOptions();
            $scope.valueOptions = getValueOptions();

            // TODO: Change the definition to accept whole object as dropdown option instead of flat array of options.
            $scope.keyOptions = $scope.keyOptions.map((option) => {
              return {
                id: option,
                label: option
              };
            });

            // TODO: Change the definition to accept whole object as dropdown option instead of flat array of options.
            $scope.valueOptions = $scope.valueOptions.map((option) => {
              return {
                id: option,
                label: option
              };
            });

            $scope.extraSettings = {
              externalProp: '',
              checkBoxes: true,
            };

          } catch (e) {
            console.log('Error', e);
          }
        }

        // Watch the changes in properties and serialize so that we can refill the values
        // whenever popup reopens.
        $scope.$watch('properties', function() {
          let str = '';
          for(let i=0; i<$scope.properties.length; i++) {
            let property = $scope.properties[i];
            let key = (property.enableCustomKeyInput) ? property.keyInputValue : property.keySelectValue.id;
            str = str + key + $scope.keyValueSeparator;
            let v;
            if(property.enableCustomValueInput) {
              v = property.inputValue;
            } else {
              v = property.selectedValues.map(value => value.id).join($scope.valueSeparator);
            }
            str = str + v;
            if(i !== $scope.properties.length-1) {
              str += $scope.keyValuePairSeparator;
            }
          }

          $scope.model = str;
          console.log(str);
        }, true);

        init();
        addPropertiesFromModel();

        // Add a new key value pair.
        $scope.addProperty = function() {
          let prop = {
            keyInputValue: '',
            keySelectValue: '',

            inputValue: '',
            selectedValues: [],

            enableCustomKeyInput: ($scope.keyInputType === CUSTOM_KEYVALUE_INPUT_TYPE) ? true : false,
            enableCustomValueInput: ($scope.valueInputType === CUSTOM_KEYVALUE_INPUT_TYPE) ? true : false
          };
          $scope.properties.push(prop);
        };

        // Removes a key value pair from the user interface.
        $scope.removeProperty = function(property) {
          var index = $scope.properties.indexOf(property);
          $scope.properties.splice(index, 1);
        };

        $scope.enter = function (event, last) {
          if (last && event.keyCode === 13) {
            $scope.addProperty();
          }
        };

        // Check if custom input type in enabled for a key or value.
        $scope.isCustomInputType = function(inputType) {
          return (inputType === CUSTOM_KEYVALUE_INPUT_TYPE);
        };

        $scope.onKeyChange = function() {
        };

        $scope.onCustomKey = function(property) {
          property.enableCustomKeyInput = true;
        };

        $scope.onKeyInputClose = function(property) {
          property.enableCustomKeyInput = false;
        };

        $scope.onCustomValue = function(property) {
          property.enableCustomValueInput = true;
        };

        $scope.onValueInputClose = function(property) {
          property.enableCustomValueInput = false;
        };

        // Refill the values by desearilizing the model when popup opens.
        function addPropertiesFromModel() {
          try {
            if($scope.model === undefined || $scope.model === '') {
              return;
            }
            let keyValuePairs = $scope.model.split($scope.keyValuePairSeparator);
            keyValuePairs.map(pair => {
              let keyValue = pair.split($scope.keyValueSeparator);
              let key = keyValue[0];
              let values = keyValue[1].split($scope.valueSeparator);

              let isKeyExistInKeyOptions = false;
              $scope.keyOptions.map(keyObj => {
                if(keyObj.id === key) {
                  isKeyExistInKeyOptions = true;
                  key = keyObj;
                }
              });

              let areCustomValues = true;
              $scope.valueOptions.map(valueObj => {
                if(valueObj.id === values[0]) {
                  areCustomValues = false;
                }
              });

              let prop = {
                keyInputValue: (isKeyExistInKeyOptions) ? '' : key,
                keySelectValue: (isKeyExistInKeyOptions) ? key : '',

                inputValue: (areCustomValues) ? values : '',
                selectedValues: (areCustomValues) ? '' : deserializeMultiSelectValues(values) ,

                enableCustomKeyInput: (isKeyExistInKeyOptions) ? false : true,
                enableCustomValueInput: (areCustomValues) ? true: false
              };

              $scope.properties.push(prop);

            });
          } catch(error) {
            console.error('Unable to deserialize CSV widget values from model', error);
          }
        }

        // Returns dropdown options for key
        function getKeyOptions() {
          switch($scope.keyInputType) {
            case CUSTOM_KEYVALUE_INPUT_TYPE: {
              return [];
            }

            case PREDEFINED_KEYVALUE_INPUT_TYPE: {
              return myHelpers.objectQuery($scope.config, 'widget-attributes', 'key-options') || [];
            }

            case INPUT_SCHEMA_KEYVALUE_INPUT_TYPE: {
              return getKeyOptionsFromInputSchema();
            }

            default: {
              return [];
            }
          }
        }

        function deserializeMultiSelectValues(values) {
          let selectedValuesObj = [];
          values.forEach(value => {
            $scope.valueOptions.forEach(valueOption => {
              if(valueOption.id === value) {
                selectedValuesObj.push(valueOption);
              }
            });
          });

          return selectedValuesObj;
        }

        // Returns dropdown options for value
        // TODO: See if this function can be combined with 'getKeyOptions'
        function getValueOptions() {
          switch($scope.valueInputType) {
            case CUSTOM_KEYVALUE_INPUT_TYPE: {
              return [];
            }

            case PREDEFINED_KEYVALUE_INPUT_TYPE: {
              return myHelpers.objectQuery($scope.config, 'widget-attributes', 'value-options') || [];
            }

            case INPUT_SCHEMA_KEYVALUE_INPUT_TYPE: {
              return getValueOptionsFromInputSchema();
            }

            default: {
              return [];
            }
          }
        }

        function getKeyOptionsFromInputSchema() {
          // TODO: provide implementation
          return [];
        }

        function getValueOptionsFromInputSchema() {
          // TODO: provide implementation.
          return [];
        }
      }
    };
  });