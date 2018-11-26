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

        const INPUT_SCHEMA_KEYVALUE_INPUT_TYPE = 'input-schema';
        const PREDEFINED_KEYVALUE_INPUT_TYPE = 'predefined';
        const CUSTOM_KEYVALUE_INPUT_TYPE = 'custom';

        const DEFAULT_VALUE_SEPARATOR = ',';
        const DEFAULT_KEY_VALUE_SEPARTOR = ':';
        const DEFAULT_KEY_VALUE_PAIR_SEPARTOR = ';';

        function init() {
          try {
            $scope.properties = [];

            $scope.keyPlaceholder = myHelpers.objectQuery($scope.config, 'widget-attributes', 'key-placeholder') || 'key';
            $scope.valuePlaceholder = myHelpers.objectQuery($scope.config, 'widget-attributes', 'value-placeholder') || 'value';

            // $scope.keyInputType = myHelpers.objectQuery($scope.config, 'widget-attributes', 'key-input-type') || INPUT_SCHEMA_KEYVALUE_INPUT_TYPE;
            $scope.keyInputType = PREDEFINED_KEYVALUE_INPUT_TYPE;
            // $scope.valueInputType = myHelpers.objectQuery($scope.config, 'widget-attributes', 'value-input-type') || INPUT_SCHEMA_KEYVALUE_INPUT_TYPE;
            $scope.valueInputType = PREDEFINED_KEYVALUE_INPUT_TYPE;

            $scope.valueSeparator = myHelpers.objectQuery($scope.config, 'widget-attributes', 'value-separator') || DEFAULT_VALUE_SEPARATOR;
            $scope.keyValueSeparator = myHelpers.objectQuery($scope.config, 'widget-attributes', 'key-value-separator') || DEFAULT_KEY_VALUE_SEPARTOR;
            $scope.keyValuePairSeparator = myHelpers.objectQuery($scope.config, 'widget-attributes', 'key-value-pair-separator') || DEFAULT_KEY_VALUE_PAIR_SEPARTOR;

            $scope.keyOptions = getKeyOptions();
            $scope.valueOptions = getValueOptions();

            console.log($scope.keyOptions, $scope.valueOptions);

            $scope.keyOptions = $scope.keyOptions.map((option) => {
              return {
                id: option,
                label: option
              };
            });

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
            $scope.selectedOptions = [];

            $scope.value = $scope.model || '';

          } catch (e) {
            console.log('Error', e);
          }
        }

        $scope.$watch('properties', function() {
          $scope.model = $scope.selectedOptions.map(o => o.id). join($scope.delimiter);
          console.log($scope.properties);
        }, true);

        init();

        $scope.addProperty = function() {
          let prop = {
            key: '',
            value: '',
            selectedValue: [],
            enableCustomKeyInput: ($scope.keyInputType === CUSTOM_KEYVALUE_INPUT_TYPE) ? true : false,
            enableCustomValueInput: ($scope.valueInputType === CUSTOM_KEYVALUE_INPUT_TYPE) ? true : false
          };
          console.log(prop);
          $scope.properties.push(prop);
        };

        $scope.removeProperty = function(property) {
          var index = $scope.properties.indexOf(property);
          $scope.properties.splice(index, 1);
        };

        $scope.enter = function (event, last) {
          if (last && event.keyCode === 13) {
            $scope.addProperty();
          }
        };

        $scope.isCustomInputType = function(inputType) {
          return (inputType === CUSTOM_KEYVALUE_INPUT_TYPE);
        };

        $scope.onKeyChange = function(property) {
          console.log(property.value);
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

        function getValueOptions() {
          switch($scope.valueInputType) {
            case CUSTOM_KEYVALUE_INPUT_TYPE: {
              return [];
            }

            case PREDEFINED_KEYVALUE_INPUT_TYPE: {
              console.log('returning from here', $scope.config);
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
          // provide implementation
          return [];
        }

        function getValueOptionsFromInputSchema() {
          // provide implementation.
          return [];
        }
      }
    };
  });