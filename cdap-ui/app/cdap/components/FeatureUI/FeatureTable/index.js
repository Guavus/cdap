/*
 * Copyright © 2017 Cask Data, Inc.
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

/* eslint react/prop-types: 0 */
import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import { FAILED, DEPLOYED, SUCCEEDED, RUNNING, FEATURE_GENERATED_PIPELINE, AFEGridColumns } from '../config';
import StatusRenderer from '../GridRenderers/StatusRenderer';
import DeleteRenderer from '../GridRenderers/DeleteRenderer';
import EditRenderer from '../GridRenderers/EditRenderer';
import CloneRenderer from '../GridRenderers/CloneRenderer';
import FELinkRenderer from '../GridRenderers/FELinkRenderer';
import FSLinkRenderer from '../GridRenderers/FSLinkRenderer';

require('./FeatureTable.scss');

class FeatureTable extends React.Component {
  gridColums;
  constructor(props) {
    super(props);
    this.gridColums = AFEGridColumns;
    this.state = {
      columnDefs: AFEGridColumns,
      frameworkComponents:  {
        'statusRenderer': StatusRenderer,
        'deleteRenderer': DeleteRenderer,
        'editRenderer': EditRenderer,
        'cloneRenderer': CloneRenderer,
        'fsLinkRenderer': FSLinkRenderer,
        'feLinkRenderer': FELinkRenderer
      },
      context: {componentParent: this}
    }
  }


  render() {
    return (
      <div
        className="ag-theme-balham grid-container">
        <AgGridReact
          columnDefs = {this.state.columnDefs}
          context={this.state.context}
          frameworkComponents = {this.state.frameworkComponents}
          rowSelection="single"
          rowData={this.props.data}
          >
        </AgGridReact>
      </div>

      // <table className='feature-table'>
      //   <thead>
      //     <tr>
      //       <th>Pipeline Name</th>
      //       <th>Status</th>
      //       <th>Last Run Time</th>
      //       <th>Type</th>
      //       <th></th>
      //       <th></th>
      //     </tr>
      //   </thead>
      //   <tbody>
      //     {data.map(item => {
      //       return <tr key={item.pipelineName}>
      //         <td>
      //           <div className="view-link" onClick={this.onView.bind(this, item)}>
      //             {item.pipelineName}</div>
      //         </td>
      //         <td>
      //           <div>
      //             <span className={this.getStatusClass(item)}></span>
      //             {item.status}
      //           </div>
      //         </td>
      //         <td>{this.getEpochDateString(item.lastStartEpochTime)}</td>
      //         <td >
      //           {item.pipelineType}
      //         </td>
      //         <td className="center-align">
      //           {
      //             this.isFeatureAvailable(item) &&
      //             <button className="feature-button-invert" onClick={this.onFeatureSelection.bind(this, item)}>Feature Selection</button>
      //           }

      //         </td>
      //         <td className="center-align">
      //           <span className="fa fa-edit right-padding clickable"
      //             onClick={this.onEdit.bind(this, item)}></span>
      //           <span className="fa fa-clone right-padding clickable"
      //             onClick={this.onClone.bind(this, item)}></span>
      //           <span className="fa fa-trash text-danger"
      //             onClick={this.onDelete.bind(this, item)}></span>
      //         </td>
      //       </tr>;
      //     })}
      //   </tbody>
      // </table>
    );
  }
  getEpochDateString(epoch) {
    if (isNaN(epoch)) {
      return "—";
    } else {
      let date = new Date(epoch * 1000);
      return date.toDateString();
    }
  }

  onView(item) {
    if (this.props.onView) {
      this.props.onView(item);
    }
  }

  onFeatureSelection(item) {
    if (this.props.onFeatureSelection) {
      this.props.onFeatureSelection(item);
    }
  }

  onEdit(item) {
    if (this.props.onEdit) {
      this.props.onEdit(item);
    }
  }

  onDelete(item) {
    if (this.props.onDelete) {
      this.props.onDelete(item);
    }
  }

  onClone(item) {
    if (this.props.onClone) {
      this.props.onClone(item);
    }
  }

  isFeatureAvailable(item) {
    return item && item.status == SUCCEEDED && item.pipelineType == FEATURE_GENERATED_PIPELINE;
  }

  getStatusClass(item) {
    let className = "fa fa-circle right-padding";
    switch (item.status) {
      case SUCCEEDED:
        className += " status-success";
        break;
      case FAILED:
        className += " status-failed";
        break;
      case DEPLOYED:
        className += " status-deployed";
        break;
      case RUNNING:
        className += " status-running";
        break;
    }
    return className;
  }

}
export default FeatureTable;
