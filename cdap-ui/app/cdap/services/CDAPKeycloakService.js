/*
 * Copyright © 2017 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import Keycloak from 'keycloak-js';
import cookie from 'react-cookie';
import RedirectToLogin from './redirect-to-login';

const refreshBeforeExpTime = 30;

const isKeycloakEnable = () => {
  return new Promise((resolve, reject) => {
    fetch("/keycloak-enable").then((response) => {
      if (response.status >= 200 && response.status < 300) {
        resolve(response.json());
      } else {
        reject(new Error('keycloak-enable call fail'));
      }
    });
  });
};

const getKeycloakConfig = () => {
  return new Promise((resolve, reject) => {
    let keycloakConfig = window.keycloakConfig;
    if (!keycloakConfig) {
      fetch("/keycloak-config").then((response) => {
        if (response.status >= 200 && response.status < 300) {
          resolve(response.json());
        } else {
          reject(new Error('Unable to load keycloak config'));
        }
      });
    } else {
      resolve(keycloakConfig);
    }
  });
};

const getKeycloakInstance = (isLoginRequired = false) => {
  return new Promise((resolve, reject) => {
    let keycloakInstance = window.keycloakInstance;
    if (!keycloakInstance) {
      let getConifg = getKeycloakConfig();
      getConifg.then(
        config => {
          window['keycloakConfig'] = config;
          const keycloak = Keycloak(config);
          // check is token present in cokiee
          let previousToken = getKeycloakToken();
          let initParams = {};
          if (!isLoginRequired && previousToken) {
            initParams = {
              onLoad: 'check-sso',
              token: previousToken.token,
              refreshToken: previousToken.refreshToken,
              idToken: previousToken.idToken,
              promiseType: 'native',
            };
          } else {
            initParams = {
              onLoad: 'login-required',
              checkLoginIframe: false,
              promiseType: 'native',
            };
          }
          keycloak.init(initParams)
            .then(authenticated => {
              console.log(" status factory authenticated -> ", authenticated);
              if (authenticated) {
                window['keycloakInstance'] = keycloak;
                updateKeycloakToken(Keycloak);
                // update cdaptoken
                let updateToken = getCDAPToken(keycloak);
                updateToken.then(
                  (response) => {
                    updateCDAPToken(response);
                    resolve(keycloak);
                  },
                  (error) => {
                    reject(error);
                  }
                );
              } else {
                // TODO need to handle this case if the authenticated is false
              }
            });
        },
        error => {
          console.log(error.message);
          reject(new Error('Unable create keycloak instance'));
        });
    } else {
      resolve(keycloakInstance);
    }
  });
};


// const getKeycloakInstance = (type='check-sso') => {
//   return new Promise((resolve, reject) => {
//     let keycloakInstance = window.keycloakInstance;
//     if (!keycloakInstance) {
//       let getConifg = getKeycloakConfig();
//       getConifg.then(
//         config => {
//           window['keycloakConfig'] = config;
//           const keycloak = Keycloak(config);
//           keycloak.init(
//             {
//               onLoad: 'check-sso',
//               token: cookie.load('Keycloak_Token'),
//               refreshToken: cookie.load('Keycloak_Refresh_Token'),
//               idToken: cookie.load('Keycloak_Id_Token'),
//               promiseType: 'native',
//             }).then(authenticated => {
//               console.log(" status factory authenticated -> ", authenticated);
//               if (authenticated) {
//                 window['keycloakInstance'] = keycloak;
//                 updateKeycloakToken(Keycloak);
//                 resolve(keycloak);
//               } else {
//                 // TODO need to handle this case if the authenticated is false
//               }
//             });
//         },
//         error => {
//           console.log(error.message);
//           reject(new Error('Unable create keycloak instance'));
//         });
//     } else {
//       resolve(keycloakInstance);
//     }
//   });
// };

const updateKeycloakToken = (keycloak) => {
  cookie.save('Keycloak_Refresh_Token', keycloak.refreshToken, { path: '/' });
  cookie.save('Keycloak_Token', keycloak.token, { path: '/' });
  cookie.save('Keycloak_Id_Token', keycloak.idToken, { path: '/' });
};

const updateCDAPToken = (response) => {
  cookie.save('CDAP_Auth_Token', response.access_token, { path: '/' });
  cookie.save('CDAP_Auth_User', response.userName, { path: '/' });
};

const getKeycloakToken = () => {
  var token = cookie.load('Keycloak_Token');
  var refreshToken = cookie.load('Keycloak_Refresh_Token');
  var idToken = cookie.load('Keycloak_Id_Token');

  if (token && refreshToken && idToken && token !== "undefined" && refreshToken !== "undefined" && idToken !== "undefined") {
    return { token, refreshToken, idToken };
  }
  return undefined;
};

const updateKeycloak = (minValidity) => {
  minValidity = minValidity || refreshBeforeExpTime;
  let keycloak = getKeycloakInstance();
  keycloak.then(
    (instance) => {
      instance.updateToken(minValidity)
        .then((refreshed) => {
          if (refreshed) {
            updateKeycloakToken(instance);
            let cdapToken = getCDAPToken(instance);
            cdapToken.then(
              (response) => {
                updateCDAPToken(response);
              },
              (error) => {
                console.log(`Error: ${error.message}`);
              }
            );
          }
        }).catch((error) => {
          console.log('unbable to update keycloak token', error);
          logout();
        });
    },
    (error) => {
      console.log(error.message);
    });

};

const getCDAPToken = (keycloakInstance) => {
  return new Promise((resolve, reject) => {
    fetch(('/cdapToken'), {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Keycloak_Token': keycloakInstance.token },
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          resolve(response.json());
        } else {
          reject(new Error(`Unable to get CDAP Token, Status : ${response.status}`));
        }
      },
        (error) => {
          reject(new Error(`Error: ${error.message}`));
        });
  });

};

const logout = () => {
  cookie.remove('show-splash-screen-for-session', {path: '/'});
  RedirectToLogin({statusCode: 401});
};

export default {
  keycloakEnable: isKeycloakEnable,
  keycloakConfig: getKeycloakInstance,
  keycloakInstance: getKeycloakInstance,
  updateKeycloak: updateKeycloak,
  updateCdapToken: getCDAPToken,
  logout: logout
};
