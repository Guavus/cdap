import React, { Component } from 'react';
import { AgGridReact } from 'ag-grid-react';
import PropTypes from 'prop-types';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { Redirect } from 'react-router-dom';
import { EXP_COLUMN_DEF } from './config';

import { isNil } from 'lodash';
import { HEADER_HEIGHT, ROW_HEIGHT } from 'components/MRDS/ModelManagementStore/constants';

require('./Landing.scss');

class LandingPage extends Component {
  gridApi;
  gridColumnApi;
  experimentDetail;
  baseUrl = "";

  constructor(props) {
    super(props);
    this.state = {
      columnDefs: EXP_COLUMN_DEF,
      experiments: [],
      numberOfExperiment: 0,
      context: { componentParent: this },
      isRouteToExperimentDetail: false,
      isFeatureColumnModal: false,
      featuredColumns: '',
      rowHeight: ROW_HEIGHT,
      headerHeight: HEADER_HEIGHT
    };
  }


  componentWillMount() {
    let isProduction = true;
    let configpath = isProduction ? './config/config.json' : '../../../../config/config.json';
    fetch(configpath)
      .then((res) => res.json())
      .then((data) => {
        this.intiateAPICall(data);
        console.log('data:', data);
      })
      .catch(error => console.error('Error:', error));
  }

  intiateAPICall(config) {
    let isSecure = true;

    if (!isNil(config) && !isNil(config.urls) && !isNil(config.urls.base)) {
      this.baseURL = config.urls.base;
    }

    if (this.baseURL === "") {
      alert("invalid URL");
    } else {
      // check it is secure or not
      isSecure = this.isURLSecure(this.baseURL);
      if (isSecure) {
        this.doAuthenticate(config);
      } else {
        this.getExperimentDetails(false, config);
      }
    }
  }


  isURLSecure(url) {
    // check it is secure or not
    if (url.substr(0, 5) === 'https') {
      return true;
    } else {
      return false;
    }
  }

  doAuthenticate(config) {
    if (!isNil(config) && !isNil(config.urls) && !isNil(config.urls.auth)) {
      let authUrl = config.urls.auth + '/token';
      fetch(authUrl)
        .then(response => response.json())
        .then(data => {
          if (!isNil(data) && !isNil(data.access_token) && !isNil(data.token_type)) {
            this.getExperimentDetails(true, config, data.access_token, data.token_type);
          }
        });
    } else {
      alert("invalid Auth URL");
    }
  }


  getExperimentDetails(isSecure, config, token, tokenType) {
    // let baseURL = "";
    let experimentList = [];
    this.baseURL = this.baseURL + config.contextRoot;
    let url = this.baseURL + 'experimentsDetails';

    if (isSecure) {
      fetch(url, {
        headers: new Headers({
          method: 'GET',
          Authorization: `${tokenType} ${token}`,
          "Content-Type": "application/json",
          'Accept': 'application/json'
        })
      }).then(response => response.json())
        .then(data => {
          if (!isNil(data) && data.length > 0) {
            experimentList = data;
            this.setState({
              experiments: experimentList
            });
          }
        });
    } else {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (!isNil(data) && data.length > 0) {
            experimentList = data;
            this.setState({
              experiments: experimentList
            });
          }
        });
    }
  }

  onGridReady = params => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  gridCellClick(event) {
    if (event.colDef.field === 'experimentName') {
      this.setState({
        isRouteToExperimentDetail: true,
        experimentDetail: event.data
      });
    }
  }

  render() {
    setTimeout(() => {
      if (this.gridApi) {
        this.gridApi.sizeColumnsToFit();
      }
    }, 500);

    if (this.state.isRouteToExperimentDetail) {
      return <Redirect to={{
        pathname: '/experimentDetail/' + this.state.experimentDetail.experimentName,
        state: { detail: this.state.experimentDetail }
      }} />;
    } else {
      return (
        <div className='landing-page'>
          <div className="ag-theme-material landing-page-grid">
            <AgGridReact
              columnDefs={this.state.columnDefs}
              rowData={this.state.experiments}
              context={this.state.context}
              frameworkComponents={this.state.frameworkComponents}
              onGridReady={this.onGridReady}
              rowHeight={this.state.rowHeight}
              headerHeight={this.state.headerHeight}
              onCellClicked={this.gridCellClick.bind(this)}
            >
            </AgGridReact>
          </div>
        </div>
      );
    }
  }
}
export default LandingPage;
LandingPage.propTypes = {
  open: PropTypes.boolean,
  data: PropTypes.any,
};
