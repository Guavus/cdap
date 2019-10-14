/*
 * Copyright © 2015-2016 Cask Data, Inc.
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

/*global require, module */

var log4js = require('log4js');
var log = log4js.getLogger('default');

const createDOMPurify = require('dompurify');
const jsdom = require('jsdom').jsdom;

const windowDom = jsdom('').defaultView;
const DOMPurify = createDOMPurify(windowDom);
const unescape = require('lodash/unescape');



function UrlValidator(cdapConfig) {
  this.whiteListIps = this.getWhiltListIps(cdapConfig);
}


UrlValidator.prototype.isValidURL = function (url) {
  var urlBreakup = this.getUrlBreakup(url);
  var ip = urlBreakup.ipAddress;
  var apiPath = urlBreakup.path;
  var isValid = true;
  if (this.whiteListIps.indexOf(ip) > -1) {
    // check for path
    if (apiPath) {
      if (apiPath.indexOf('http://') > -1 || apiPath.indexOf('https://') > -1 || apiPath.indexOf('ftp://') > -1 || apiPath.indexOf('redirectUrl=') > -1) {
        isValid = false;
      }
    }
  } else {
    isValid = false;
  }
  return isValid;
};

UrlValidator.prototype.getUrlBreakup = function (url) {
  var protocol;
  var hostPort;
  var path;
  // find  protocol (http, ftp, etc.) and get hostname
  if (url.indexOf('//') > -1) {
    var protocolSplitArr = url.split('//');
    var protoclStr = protocolSplitArr[0];
    if (protoclStr.indexOf(':') > -1) {
      protocol = protoclStr.split(':')[0];
    }

    protocolSplitArr.shift();
    var hostPortPathStr = protocolSplitArr.join('//');

    //break url two parts hostportstr and pathstr
    if (hostPortPathStr) {
      var splitSymbol = this.getPortSplitSymbol(hostPortPathStr);
      if (splitSymbol) {
        var hostPortPathSplitArr = hostPortPathStr.split(splitSymbol);
        hostPort = hostPortPathSplitArr.length > 0 ? hostPortPathSplitArr[0] : undefined;
        hostPortPathSplitArr.shift();
        path = hostPortPathSplitArr.join(splitSymbol);
      } else {
        hostPort = hostPortPathStr;
      }
    }
  }
  return { ipAddress: `${protocol}://${hostPort}`, path: path };
};

UrlValidator.prototype.getPortSplitSymbol = function (str) {
  var splitSymbol;
  if (str) {

    var slashIndex = str.indexOf('/');
    var questionIndex = str.indexOf('?');

    if (slashIndex > -1 && questionIndex > -1) {

      splitSymbol = slashIndex < questionIndex ? '/' : '?';

    } else if (slashIndex > -1 || questionIndex > -1) {

      splitSymbol = slashIndex > -1 ? '/' : '?';
    }
  }
  return splitSymbol;
};


UrlValidator.prototype.getWhiltListIps = function (config) {
  var whiteList = [];
  if (config) {
    //default whitelist ips define in application
    if (config.hasOwnProperty('default.white.list.ips') && config['default.white.list.ips'].trim() !== '') {
      whiteList = whiteList.concat(config['default.white.list.ips'].trim().split(',').map((a) => a.trim()));
    }

    // if user provide any white list from cdap config the it will addpend those ips in whitelisting
    if (config.hasOwnProperty('white.list.ips') && config['white.list.ips'].trim() !== '') {
      whiteList = whiteList.concat(config['white.list.ips'].trim().split(',').map((a) => a.trim()));
    }

    // generate whitelist based on cdap config
    var protocol = config['ssl.external.enabled'] === 'true' ? 'https://' : 'http://';
    var port = config['ssl.external.enabled'] === 'true' ? config['router.ssl.server.port'] : config['router.server.port'];
    port = ':' + port;
    var url = [protocol, config['router.server.address'], port].join('');
    whiteList.push(url);
  }
  return whiteList;
};

UrlValidator.prototype.isValidRequest = function (url, req) {
  var validUrl = true;
  var validrequest = true;
  //cehck url
  if(url !== undefined && url !== null) {
    const dirtyURL = JSON.stringify(url);
    log.info ('Request URL::  ' +dirtyURL);
    const cleanURL = unescape(DOMPurify.sanitize(dirtyURL, { ALLOWED_TAGS: []}));
    validUrl = cleanURL === dirtyURL ? true : false;
  }

  // check request body
  if(req !== undefined && req !==  null){
    const dirty = JSON.stringify(req);
    log.info ('\nRequest Body::  ' +dirty);
    const clean = unescape(DOMPurify.sanitize(dirty, { ALLOWED_TAGS: []}));
    validrequest =  clean === dirty ? true : false;
  }

  return validUrl && validrequest;
};


module.exports = UrlValidator;
