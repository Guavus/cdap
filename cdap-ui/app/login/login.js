/*
 * Copyright © 2016 Cask Data, Inc.
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

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';
import cookie from 'react-cookie';

import Card from 'components/Card';
import CardActionFeedback from 'components/CardActionFeedback';

import * as util from './utils';
import Footer from '../cdap/components/Footer';

require('./styles/lib-styles.scss');
require('./login.scss');
import T from 'i18n-react';
T.setTexts(require('./text/text-en.yaml'));

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: localStorage.getItem('login_username') || '',
      password: '',
      message: '',
      formState: false,
      rememberUser: false,
      isKnoxEnable: true,
      knoxUrl:'',
      applicationPrefix:''
    };

    this.getLoginConfig();
  }

  login(e) {
    e.preventDefault();
    if (this.state.rememberUser) {
      localStorage.setItem('login_username', this.state.username);
    }
    fetch('/login', {
      method: 'POST',
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      })
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.json();
        } else {
          this.setState({
            message: 'Login failed. Username or Password incorrect.'
          });
          return Promise.reject();
        }
      })
      .then((res) => {
        cookie.save('CDAP_Auth_Token', res.access_token, { path: '/'});
        cookie.save('CDAP_Auth_User', this.state.username);
        var queryObj = util.getQueryParams(location.search);
        queryObj.redirectUrl = queryObj.redirectUrl || '/';
        window.location.href = queryObj.redirectUrl;
      });
  }
  onUsernameUpdate(e) {
    this.setState({
      username: e.target.value,
      formState: e.target.value.length && this.state.password.length,
      message: '',
    });
  }
  onPasswordUpdate(e) {
    this.setState({
      password: e.target.value,
      formState: this.state.username.length && e.target.value.length,
      message: '',
    });
  }
  rememberUser() {
    this.setState({
      rememberUser: true
    });
  }


  // get cdap token

  getLoginConfig = () => {
    const knoxGatewayElement = document.getElementById('logingateway');
    let knoxGateway = '';
    if (knoxGatewayElement) {
      knoxGateway = document.getElementById('logingateway').innerHTML.replace('/login','');
    }
    fetch((knoxGateway+'/loginConfig'), {
      method: 'GET',
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          var result = response.json();
          this.setState({
            isKnoxEnable: result.knoxEnabled,
            knoxUrl: result.knoxLoginUrl,
            applicationPrefix: result.applicationPrefix
          });
          console.log('response =>' + response);
          console.log('result.knoxEnabled =>' + result.knoxEnabled);
          console.log('result.applicationPrefix =>' + result.applicationPrefix);
          if (result.knoxEnabled) {
           this. getCdapToken(result.applicationPrefix);
          }
        } else {
          console.log('login config call fail');
        }
      });
  }


  getCdapToken = (prefix) => {
    fetch((prefix+'/cdapToken'), {
      method: 'GET',
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.json();
        } else {
          const url = `${location.protocol}//${location.host}/gateway/knoxsso/api/v1/websso?originalUrl=${location.protocol}//${location.host}${prefix}/cdap`;
          window.open(url, '_self');
          return Promise.reject();
        }
      })
      .then((res) => {
        cookie.save('CDAP_Auth_Token', res.access_token, { path: '/'});
        cookie.save('CDAP_Auth_User', res.userName);
        var queryObj = util.getQueryParams(location.search);
        queryObj.redirectUrl = queryObj.redirectUrl || '/';
        window.location.href = queryObj.redirectUrl;
      });
  }

  render() {
    let footer;
    if (this.state.message) {
      footer = (
        <CardActionFeedback
          type="DANGER"
          message={this.state.message}
        />
      );
    }

    return (
      !this.state.isKnoxEnable ?
              <div>
                <Card footer={footer}>
                  <div className="cdap-logo"></div>
                  <form
                    role="form"
                    onSubmit={this.login.bind(this)}
                  >
                    <div className="form-group">
                      <input
                        id="username"
                        className="form-control"
                        name="username"
                        value={this.state.username}
                        placeholder={T.translate('login.placeholders.username')}
                        onChange={this.onUsernameUpdate.bind(this)}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        id="password"
                        className="form-control"
                        placeholder={T.translate('login.placeholders.password')}
                        onChange={this.onPasswordUpdate.bind(this)}
                        type="password"
                      />
                    </div>
                    <div className="form-group">
                      <div className="clearfix">
                        <div className="float-xs-left">
                          <div className="checkbox form-check">
                            <label className="form-check-label">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                value={this.state.rememberUser}
                                onClick={this.rememberUser.bind(this)}
                              />
                            {T.translate('login.labels.rememberme')}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <button
                        id="submit"
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={!this.state.formState}
                        onClick={this.login.bind(this)}
                      >
                        {T.translate('login.labels.loginbtn')}
                      </button>
                    </div>
                  </form>
                </Card>
              </div>
            : <div></div>
    );
  }
}

ReactDOM.render(<Login />,
  document.getElementById('login-form')
);
ReactDOM.render(<Footer />,
  document.getElementById('footer-container')
);
