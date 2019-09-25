/*
 * Copyright © 2016-2018 Cask Data, Inc.
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

import * as momentTimeZone from 'moment-timezone';
import { isNil } from 'lodash';

function authorRenderer() {
  return "admin";
}

function timeFormatter(params) {
  let dateTimeFormat = 'DD-MM-YYYY HH:mm';
  let date = getMomentDateFor(params.value, 'GMT');
  return isNil(date) ? "" : date.format(dateTimeFormat);
}



function getMomentDateFor(epoch, timezone) {
  if (epoch === undefined) {
    return undefined;
  }
  return momentTimeZone.tz(epoch, timezone);
}

function expNameLinkRenderer(params) {
  var eDiv = document.createElement('div');
  eDiv.innerHTML = params.value;
  eDiv.classList.add("view-link");
  return eDiv;
}


export const EXP_COLUMN_DEF = [
  {
    headerName: "Last Updated Date",
    field: "experimentLastUpdatedTime",
    valueFormatter: timeFormatter,
    width: 100,
  },
  {
    headerName: "Experiment Name",
    field: "experimentName",
    cellRenderer: expNameLinkRenderer,
    width: 180,
    tooltipField: "experimentName",
  },
  {
    headerName: "Dataset Name",
    field: "datasetName",
    width: 150,
    tooltipField: "datasetName",
  },
  {
    headerName: "Prediction Column",
    field: "predictionField",
    width: 100,
    tooltipField: "experimentName",
  },

  {
    headerName: "Category",
    field: "category",
    width: 100,
    tooltipField: "experimentName",
  },
  {
    headerName: "Framework",
    field: "framework",
    width: 100,
    tooltipField: "experimentName",
  },
  {
    headerName: "# Models",
    field: "noOfModels",
    width: 80,
  },
  {
    headerName: "Author",
    field: "",
    cellRenderer: authorRenderer,
    width: 80,
  },
];
