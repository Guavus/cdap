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

function ContentSwitcherController(myHelpers) {
  'ngInject';

  let vm = this;

  vm.fieldOptions = [];

  function init() {
    try {
      console.log(myHelpers, vm);
      vm.fieldOptions = vm.config['widget-attributes'].options;
      vm.model = '*';

    } catch(e) {
      console.log('Error', e);
    }
  }

  init();
}

angular.module(PKG.name + '.commons')
  .directive('myContentSwitcherWidget', function() {
    return {
      restrict: 'E',
      templateUrl: 'widget-container/widget-content-switcher/widget-content-switcher.html',
      bindToController: true,
      scope: {
        disabled: '=',
        model: '=ngModel',
        config: '='
      },
      controller: ContentSwitcherController,
      controllerAs: 'ContentSwitcher'
    };
  });
