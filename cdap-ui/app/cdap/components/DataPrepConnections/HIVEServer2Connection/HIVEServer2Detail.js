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

import PropTypes from 'prop-types';

import React, { Component } from 'react';
import MyDataPrepApi from 'api/dataprep';
import NamespaceStore from 'services/NamespaceStore';
import T from 'i18n-react';
import ee from 'event-emitter';
import CardActionFeedback from 'components/CardActionFeedback';
import uuidV4 from 'uuid/v4';
import LoadingSVG from 'components/LoadingSVG';
import { objectQuery } from 'services/helpers';
import { ConnectionType } from 'components/DataPrepConnections/ConnectionType';

const LABEL_COL_CLASS = 'col-xs-4 col-form-label text-xs-right';
const INPUT_COL_CLASS = 'col-xs-8';

const PREFIX = 'features.DataPrepConnections.AddConnections.HIVEServer2';

export default class HIVEServer2Detail extends Component {
  constructor(props) {
    super(props);

    let customId = uuidV4();

    this.state = {
      name: '',
      database: '',
      url: '',
      connectionResult: null,
      error: null,
      databaseList: ['', customId],
      customId: customId,
      selectedDatabase: '',
      testConnectionLoading: false
    };

    this.eventEmitter = ee(ee);
    this.addConnection = this.addConnection.bind(this);
    this.editConnection = this.editConnection.bind(this);
    this.testConnection = this.testConnection.bind(this);
    this.preventDefault = this.preventDefault.bind(this);
    this.handleDatabaseChange = this.handleDatabaseChange.bind(this);
    this.handleDatabaseSelect = this.handleDatabaseSelect.bind(this);
  }

  fetchDatabases() {
    let namespace = NamespaceStore.getState().selectedNamespace;
    let requestBody = {
      name: this.state.name,
      type: ConnectionType.HIVESERVER2,
      properties: this.constructProperties()
    };

    MyDataPrepApi.getDatabaseList({ namespace }, requestBody)
      .subscribe((databaseList) => {
        let list = databaseList.values.sort();
        let customId = this.state.customId;

        if (list.indexOf(customId) !== -1) {
          customId = uuidV4();
        }

        list.push(customId);
        list.unshift('');

        this.setState({
          databaseList: list,
          selectedDatabase: this.props.mode === 'EDIT' ? this.state.database : '',
          customId
        });
      }, (err) => {
        console.log('err fetching database list', err);
      });
  }

  componentWillMount() {
    if (this.props.mode === 'ADD') {
      return;
    }
    let name = this.props.mode === 'EDIT' ? this.props.db.name : '';
    let url = this.props.db ? this.props.db.url : '';
    this.setState({
      name,
      url,
      selectedDatabase: this.state.customId,
    });
    if (this.props.mode === 'EDIT') {
      this.fetchDatabases();
    }
  }

  preventDefault(e) {
    e.preventDefault();
  }

  handleChange(key, e) {
    this.setState({
      [key]: e.target.value,
      connectionResult: null
    });
  }

  handleDatabaseChange(e) {
    this.setState({
      database: e.target.value
    });
  }

  handleDatabaseSelect(e) {
    this.setState({
      selectedDatabase: e.target.value
    });
  }

  constructProperties() {
    let properties = {};
    if (this.state.name) {
      properties.name = this.state.name;
    }
    if (this.state.url) {
      properties.url = this.state.url;
    }
    return properties;
  }

  addConnection() {
    let namespace = NamespaceStore.getState().selectedNamespace;

    let requestBody = {
      name: this.state.name,
      type: ConnectionType.HIVESERVER2,
      properties: this.constructProperties()
    };

    MyDataPrepApi.createConnection({ namespace }, requestBody)
      .subscribe(() => {
        this.setState({ error: null });
        this.props.onAdd();
      }, (err) => {
        console.log('err', err);

        let error = objectQuery(err, 'response', 'message') || objectQuery(err, 'response');
        this.setState({ error });
      });
  }

  editConnection() {
    let namespace = NamespaceStore.getState().selectedNamespace;

    let params = {
      namespace,
      connectionId: this.props.connectionId
    };

    let requestBody = {
      name: this.state.name,
      id: this.props.connectionId,
      type: ConnectionType.HIVESERVER2,
      properties: this.constructProperties()
    };

    MyDataPrepApi.updateConnection(params, requestBody)
      .subscribe(() => {
        this.setState({ error: null });
        this.eventEmitter.emit('DATAPREP_CONNECTION_EDIT_DATABASE', this.props.connectionId);
        this.props.onAdd();
      }, (err) => {
        console.log('err', err);

        let error = objectQuery(err, 'response', 'message') || objectQuery(err, 'response');
        this.setState({ error });
      });
  }

  testConnection() {
    this.setState({ testConnectionLoading: true });

    let namespace = NamespaceStore.getState().selectedNamespace;

    let requestBody = {
      name: this.state.name,
      type: ConnectionType.HIVESERVER2,
      properties: this.constructProperties()
    };

    MyDataPrepApi.hiveServer2TestConnection({ namespace }, requestBody)
      .subscribe((res) => {
        this.setState({
          connectionResult: {
            type: 'success',
            message: res.message
          },
          testConnectionLoading: false
        });
      }, (err) => {
        console.log('Error testing database connection', err);

        let errorMessage = objectQuery(err, 'response', 'message') || objectQuery(err, 'response') || T.translate(`${PREFIX}.defaultTestErrorMessage`);

        this.setState({
          connectionResult: {
            type: 'danger',
            message: errorMessage
          },
          testConnectionLoading: false
        });
      });
  }

  renderTestButton() {
    let disabled  = !this.state.name || !this.state.url;

    return (
      <div>
        <button
          className="btn btn-secondary"
          onClick={this.testConnection}
          disabled={disabled}
        >
          {T.translate(`${PREFIX}.testConnection`)}
        </button>

        {
          this.state.testConnectionLoading ?
            (
              <span className="fa loading-indicator">
                <LoadingSVG />
              </span>
            )
            :
            null
        }

        {
          this.state.connectionResult ?
            (
              <span
                className={`connection-check text-${this.state.connectionResult.type}`}
              >
                {this.state.connectionResult.message}
              </span>
            )
            :
            null
        }
      </div>
    );
  }

  renderConnectionInfo() {
    return (
      <div>
        <div className="form-group row">
          <label className={LABEL_COL_CLASS}>
            {T.translate(`${PREFIX}.url`)}
            <span className="asterisk">*</span>
          </label>
          <div className={INPUT_COL_CLASS}>
            <input
              type="text"
              className="form-control"
              value={this.state.url}
              onChange={this.handleChange.bind(this, 'url')}
              placeholder={T.translate(`${PREFIX}.Placeholders.urlDefault`)}
            />
          </div>
        </div>
      </div>
    );
  }

  renderAddConnectionButton() {
    let disabled  = !this.state.name || !this.state.url;
    let onClickFn = this.addConnection;

    if (this.props.mode === 'EDIT') {
      onClickFn = this.editConnection;
    }

    return (
      <div className="col-xs-2 offset-xs-4 col-xs-offset-4">
        <button
          className="btn btn-primary"
          onClick={onClickFn}
          disabled={disabled}
        >
          {T.translate(`${PREFIX}.Buttons.${this.props.mode}`)}
        </button>
      </div>
    );
  }

  renderError() {
    if (!this.state.error) { return null; }

    return (
      <div className="error-container">
        <CardActionFeedback
          type="DANGER"
          message={T.translate(`${PREFIX}.ErrorMessages.${this.props.mode}`)}
          extendedMessage={this.state.error}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="database-detail">
        <div className="database-detail-content">

          <form onSubmit={this.preventDefault}>
            <div className="form-group row">
              <label className={LABEL_COL_CLASS}>
                {T.translate(`${PREFIX}.name`)}
                <span className="asterisk">*</span>
              </label>
              <div className={INPUT_COL_CLASS}>
                <input
                  type="text"
                  className="form-control"
                  value={this.state.name}
                  onChange={this.handleChange.bind(this, 'name')}
                  disabled={this.props.mode === 'EDIT'}
                  placeholder={T.translate(`${PREFIX}.Placeholders.name`)}
                />
              </div>
            </div>

            {this.renderConnectionInfo()}

          </form>
          <div className="row">
            {this.renderAddConnectionButton()}
            {this.renderTestButton()}
          </div>


        </div>

        {this.renderError()}
      </div>
    );
  }
}

HIVEServer2Detail.propTypes = {
  db: PropTypes.object,
  onAdd: PropTypes.func,
  mode: PropTypes.oneOf(['ADD', 'EDIT', 'DUPLICATE']).isRequired,
  connectionId: PropTypes.string
};

