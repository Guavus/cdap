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
import LoadingSVG from 'components/LoadingSVG';
import ValidatedInput from 'components/ValidatedInput';
import types from 'services/inputValidationTemplates';

const LABEL_COL_CLASS = 'col-xs-4 col-form-label text-xs-right';
const INPUT_COL_CLASS = 'col-xs-7';
const ConnectionMode = {
  Add: 'ADD',
  Edit: 'EDIT',
  Duplicate: 'DUPLICATE',
};
const PREFIX = 'features.DataPrepConnections.AddConnections.HIVEServer2';
const ADDCONN_PREFIX = 'features.DataPrepConnections.AddConnections';
const errorMap = 'error';
const templateMap = 'template';
const labelMap = 'label';
const nameMap = 'name';
const urlMap = 'url';

export default class HIVEServer2Detail extends Component {
  constructor(props) {
    super(props);

    let customId = uuidV4();

    this.state = {
      name: '',
      database: customId,
      url: '',
      error: null,
      databaseList: [customId],
      customId: customId,
      testConnectionLoading: false,
      fetchDatabaseLoading: false,
      databaseSelectionError:'',
      connectionResult: {
        message: '',
        type: '',
      },
      inputs: {
        name: {
          error: '',
          required: true,
          template: 'NAME',
          label:  T.translate(`${PREFIX}.name`),
        },
        url: {
          error: '',
          required: true,
          template: 'NAME',
          label:  T.translate(`${PREFIX}.url`),
        }
      }
    };

    this.eventEmitter = ee(ee);
    this.addConnection = this.addConnection.bind(this);
    this.editConnection = this.editConnection.bind(this);
    this.testConnection = this.testConnection.bind(this);
    this.preventDefault = this.preventDefault.bind(this);
    this.handleDatabaseSelect = this.handleDatabaseSelect.bind(this);
  }

  fetchDatabases() {
    this.setState({ fetchDatabaseLoading: true, databaseSelectionError: '' });

    let namespace = NamespaceStore.getState().selectedNamespace;
    let requestBody = {
      name: this.state.name,
      type: ConnectionType.HIVESERVER2,
      properties: this.constructProperties()
    };

    MyDataPrepApi.hiveserver2getDatabaseList({ namespace }, requestBody)
      .subscribe((databaseList) => {
        let list = databaseList.values.sort();
        let customId = this.state.customId;

        if (list.indexOf(customId) !== -1) {
          customId = uuidV4();
        }

        list.unshift(customId);

        this.setState({
          databaseList: list,
          database: this.props.mode === ConnectionMode.Edit ? this.props.db.database : list[0],
          customId,
          fetchDatabaseLoading: false,
          databaseSelectionError: ''
        });
      }, (err) => {
        console.log('err fetching database list', err);

        let errorMessage = objectQuery(err, 'response', 'message') || objectQuery(err, 'response') || T.translate(`${PREFIX}.defaultFetchDatabaseErrorMessage`);
        this.setState({
          connectionResult: {
            type: CARD_ACTION_TYPES.DANGER,
            message: errorMessage
          },
          fetchDatabaseLoading: false
        });
      });
  }

  componentWillMount() {
    if (this.props.mode !== ConnectionMode.Add) {
      let name = this.props.mode === ConnectionMode.Edit ? this.props.db.name : '';
      let url = this.props.db ? this.props.db.url : '';
      let database = this.props.db ? this.props.db.database : this.state.customId;

      this.setState({
        name,
        url,
        database,
        databaseSelectionError: ''
      });

      if (this.props.mode === 'EDIT') {
        setTimeout(() => {
          this.fetchDatabases();
        });
      }
    }
  }

  preventDefault(e) {
    e.preventDefault();
  }

  handleChange = (key, e) => {
    if (Object.keys(this.state.inputs).indexOf(key) > -1) {
      // validate input
      const isValid = types[this.state.inputs[key][templateMap]].validate(e.target.value);
      let errorMsg = '';
      if (e.target.value && !isValid) {
        errorMsg = types[this.state.inputs[key][templateMap]].getErrorMsg();
      }

      this.setState({
        [key]: e.target.value,
        inputs: {
          ...this.state.inputs,
          [key]: {
            ...this.state.inputs[key],
            error: errorMsg,
          },
        },
      });
    } else {
      this.setState({
        [key]: e.target.value,
      });
    }
  }

  handleDatabaseSelect(e) {
    this.setState({
      database: e.target.value,
      databaseSelectionError: e.target.value === this.state.customId ? T.translate(`${PREFIX}.customLabel`) : ''
    });
  }

  constructProperties() {
    let properties = {};
    if (this.state.url) {
      properties.url = this.state.url;
    }
    if (this.state.database) {
      properties.database = this.state.database;
    }
    return properties;
  }

  addConnection() {
    if (this.state.database === '' || this.state.database === this.state.customId) {
      this.setState({
        databaseSelectionError: T.translate(`${PREFIX}.customLabel`)
      });
    } else {
      let namespace = NamespaceStore.getState().selectedNamespace;
      this.setState({
        databaseSelectionError: ''
      });
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

  }

  editConnection() {
    let requestBody = {
      name: this.state.name,
      id: this.props.connectionId,
      type: ConnectionType.HIVESERVER2,
      properties: this.constructProperties()
    };
    if (requestBody.properties.database == '' || requestBody.properties.database === this.state.customId) {
      this.setState({
        databaseSelectionError: T.translate(`${PREFIX}.customLabel`)
      });
    } else {
      let namespace = NamespaceStore.getState().selectedNamespace;

      let params = {
        namespace,
        connectionId: this.props.connectionId
      };

      MyDataPrepApi.updateConnection(params, requestBody)
        .subscribe(() => {
          this.setState({ error: null });
          this.eventEmitter.emit('DATAPREP_CONNECTION_EDIT_HIVESERVER2', this.props.connectionId);
          this.props.onAdd();
        }, (err) => {
          console.log('err', err);

          let error = objectQuery(err, 'response', 'message') || objectQuery(err, 'response');
          this.setState({ error });
        });
    }
  }

  testConnection() {
    this.setState({ testConnectionLoading: true });

    let namespace = NamespaceStore.getState().selectedNamespace;

    let requestBody = {
      name: this.state.name,
      type: ConnectionType.HIVESERVER2,
      properties: this.constructProperties()
    };

    MyDataPrepApi.hiveserver2TestConnection({ namespace }, requestBody)
      .subscribe((res) => {
        this.setState({
          connectionResult: {
            type: CARD_ACTION_TYPES.SUCCESS,
            message: res.message
          },
          testConnectionLoading: false
        });
        this.fetchDatabases();
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
    return (
      <span className='test-connection-button'>
        <BtnWithLoading
          className="btn btn-secondary"
          onClick={this.testConnection}
          disabled={this.isButtonDisable()}
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
    const databaseErrorClass = this.state.databaseSelectionError ? 'database-error' : '';
    return (
      <div className="form-group row">
        <label className={LABEL_COL_CLASS}>
          {T.translate(`${PREFIX}.database`)}
        </label>
        <div className={INPUT_COL_CLASS}>
          {
            this.state.fetchDatabaseLoading ?
              <LoadingSVG />
              :<select
                  className={`form-control ${databaseErrorClass}`}
                  value={this.state.database}
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
          }

        </div>
        {
          this.state.databaseSelectionError ? <div className='database-error-message'>{this.state.databaseSelectionError}</div>: null
        }
      </div>
    );
  }

  isButtonDisable() {
    return !this.state.name || !this.state.url  || this.state.inputs[nameMap].error !== '' ||  this.state.inputs[urlMap].error !== ''
  }
  renderAddTestConnectionButton = () => {
    let onClickFn = this.addConnection;
    let disabled = this.isButtonDisable() || this.state.fetchDatabaseLoading;

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
                <ValidatedInput
                  type="text"
                  label={this.state.inputs[nameMap][labelMap]}
                  validationError={this.state.inputs[nameMap][errorMap]}
                  className="form-control"
                  value={this.state.name}
                  onChange={this.handleChange.bind(this, 'name')}
                  placeholder={T.translate(`${PREFIX}.Placeholders.name`).toString()}
                />
              </div>
            </div>

            <div className="form-group row">
              <label className={LABEL_COL_CLASS}>
                {T.translate(`${PREFIX}.url`)}
                <span className="asterisk">*</span>
              </label>
              <div className={INPUT_COL_CLASS}>
                <ValidatedInput
                  type="text"
                  label={this.state.inputs[urlMap][labelMap]}
                  validationError={this.state.inputs[urlMap][errorMap]}
                  className="form-control"
                  value={this.state.url}
                  onChange={this.handleChange.bind(this, 'url')}
                  placeholder={T.translate(`${PREFIX}.Placeholders.urlDefault`).toString()}
                />
              </div>
            </div>
            {this.renderDatabase()}
          </form>
          {this.renderAddTestConnectionButton()}
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

