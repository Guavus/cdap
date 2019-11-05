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

import React from 'react';
import isNil from 'lodash/isNil';
require('./ExperimentalBanner.scss');

export default function ExperimentalBanner({...props}) {
  let { entity } = props;
  if (isNil(entity)) {
    return <div className="experimental-banner">BETA</div>;
  } else {
    if (entity.beta) {
      return <div className="experimental-banner">BETA</div>;
    } else if (entity.alpha) {
      return <div className=" experimental-banner alpha-background">ALPHA</div>;
    } else {
      return null;
    }
  }
}
