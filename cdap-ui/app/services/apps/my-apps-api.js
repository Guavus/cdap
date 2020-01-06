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

angular.module(PKG.name + '.services')
  .factory('myAppsApi', function(myCdapUrl, $resource, myAuth, myHelpers) {

    var url = myCdapUrl.constructUrl,
        basePath = '/namespaces/:namespace/apps',
        listPath = basePath,
        detailPath = basePath + '/:appId',
        deleteAllPath = '/namespaces/:namespace/apps-delete';

    return $resource(
      url({ _cdapPath: basePath }),
      {
        appId: '@appId'
      },
      {
        delete: myHelpers.getConfig('DELETE', 'REQUEST', detailPath),
        deleteAll: myHelpers.getConfig('POST', 'REQUEST', deleteAllPath),
        list: myHelpers.getConfig('GET', 'REQUEST', listPath, true),
        get: myHelpers.getConfig('GET', 'REQUEST', detailPath)
    });
  });
