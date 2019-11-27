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
import { ModalFooter } from 'reactstrap';
import React, { Component } from 'react';
import NamespaceStore from 'services/NamespaceStore';
import T from 'i18n-react';
import ee from 'event-emitter';
import CardActionFeedback, {CARD_ACTION_TYPES} from 'components/CardActionFeedback';
import uuidV4 from 'uuid/v4';
import BtnWithLoading from 'components/BtnWithLoading';
import MyDataPrepApi from 'api/dataprep';
import { objectQuery } from 'services/helpers';
import { ConnectionType } from 'components/DataPrepConnections/ConnectionType';

const LABEL_COL_CLASS = 'col-xs-4 col-form-label text-xs-right';
const INPUT_COL_CLASS = 'col-xs-7';
const ConnectionMode = {
  Add: 'ADD',
  Edit: 'EDIT',
  Duplicate: 'DUPLICATE',
};
const PREFIX = 'features.DataPrepConnections.AddConnections.HIVEServer2';
const ADDCONN_PREFIX = 'features.DataPrepConnections.AddConnections';

export default class HIVEServer2Detail extends Component {
  constructor(props) {
    super(props);

    let customId = uuidV4();

    this.state = {
      name: '',
      database: '',
      url: '',
      error: null,
      databaseList: ['', customId],
      customId: customId,
      selectedDatabase: '',
      testConnectionLoading: false,
      connectionResult: {
        message: '',
        type: '',
      },
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

    MyDataPrepApi.hiveServer2getDatabaseList({ namespace }, requestBody)
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
          selectedDatabase: this.props.mode === ConnectionMode.Edit ? this.state.database : '',
          customId
        });
      }, (err) => {
        console.log('err fetching database list', err);
      });
  }

  componentWillMount() {
    if (this.props.mode === ConnectionMode.Add) {
      return;
    }
    let name = this.props.mode === ConnectionMode.Edit ? this.props.db.name : '';
    let url = this.props.db ? this.props.db.url : '';
    this.setState({
      name,
      url,
      selectedDatabase: this.state.customId,
    });
    if (this.props.mode === ConnectionMode.Edit) {
      this.fetchDatabases();
    }
  }

  preventDefault(e) {
    e.preventDefault();
  }

  handleChange(key, e) {
    this.setState({
      [key]: e.target.value,
      connectionResult: {
        message: '',
        type: '',
      }
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
            type: CARD_ACTION_TYPES.SUCCESS,
            message: res.message
          },
          testConnectionLoading: false
        });
      }, (err) => {
        console.log('Error testing database connection', err);

        let errorMessage = objectQuery(err, 'response', 'message') || objectQuery(err, 'response') || T.translate(`${PREFIX}.defaultTestErrorMessage`);

        this.setState({
          connectionResult: {
            type: CARD_ACTION_TYPES.DANGER,
            message: errorMessage
          },
          testConnectionLoading: false
        });
      });
  }

  renderTestButton() {
    let disabled  = !this.state.name || !this.state.url;
    return (
      <span className='test-connection-button'>
        <BtnWithLoading
          className="btn btn-secondary"
          onClick={this.testConnection}
          disabled={disabled}
          label={T.translate(`${PREFIX}.testConnection`)}
          loading={this.state.testConnectionLoading}
          darker={true}
        />
      </span>
    );
  }



  renderMessage() {
    const connectionResult = this.state.connectionResult;

    if (!this.state.error && !connectionResult.message) { return null; }

    if (this.state.error) {
      return (
        <CardActionFeedback
          type={connectionResult.type}
          message={T.translate(`${PREFIX}.ErrorMessages.${this.props.mode}`)}
          extendedMessage={this.state.error}
        />
      );
    }

    const connectionResultType = connectionResult.type;
    const extendedMessage = connectionResultType === CARD_ACTION_TYPES.SUCCESS ? null : connectionResult.message;

    return (
      <CardActionFeedback
        message={T.translate(`${ADDCONN_PREFIX}.TestConnectionLabels.${connectionResultType.toLowerCase()}`)}
        extendedMessage={extendedMessage}
        type={connectionResultType}
      />
    );
  }

  renderDatabase() {
    return (
      <div className="form-group row">
        <label className={LABEL_COL_CLASS}>
          {T.translate(`${PREFIX}.database`)}
        </label>
        <div className={INPUT_COL_CLASS}>
          <select
            className="form-control"
            value={this.state.selectedDatabase}
            onChange={this.handleDatabaseSelect}
          >
            {
              this.state.databaseList.map((dbOption) => {
                return (
                  <option
                    key={dbOption}
                    value={dbOption}
                  >
                    {dbOption === this.state.customId ? T.translate(`${PREFIX}.customLabel`) : dbOption}
                  </option>
                );
              })
            }
          </select>

          {
            this.state.selectedDatabase === this.state.customId ?
              (
                <div className="custom-input">
                  <input
                    type="text"
                    className="form-control"
                    value={this.state.database}
                    onChange={this.handleDatabaseChange}
                  />
                </div>
              )
            :
              null
          }
        </div>
      </div>
    );
  }

  renderAddConnectionButton = () => {
    const disabled = !this.state.name || !this.state.url;
    let onClickFn = this.addConnection;

    if (this.props.mode === ConnectionMode.Edit) {
      onClickFn = this.editConnection;
    }

    return (
      <ModalFooter>
        <button
          className="btn btn-primary"
          onClick={onClickFn}
          disabled={disabled}
        >
          {T.translate(`${PREFIX}.Buttons.${this.props.mode}`)}
        </button>

        {this.renderTestButton()}
      </ModalFooter>
    );
  }

  render() {
    return (
      <div className="hive-server2-detail">
        <div className="hive-server2-detail-content">

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
                  disabled={this.props.mode === ConnectionMode.Edit}
                  placeholder={T.translate(`${PREFIX}.Placeholders.name`)}
                />
              </div>
            </div>

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
            {this.renderDatabase()}
          </form>
          {this.renderAddConnectionButton()}
        </div>

        {this.renderMessage()}
      </div>
    );
  }
}

HIVEServer2Detail.propTypes = {
  db: PropTypes.object,
  onAdd: PropTypes.func,
  mode: PropTypes.oneOf([ConnectionMode.Add, ConnectionMode.Edit, ConnectionMode.Duplicate]).isRequired,
  connectionId: PropTypes.string
};

