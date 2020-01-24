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

import cssVars from 'css-vars-ponyfill';
import {objectQuery, isNilOrEmpty} from 'services/helpers';
import isColor from 'is-color';
import isBoolean from 'lodash/isBoolean';

interface IThemeJSON {
  "spec-version": string;
  "is-customer-MWC"?: boolean;
}

interface IJsonFeatureNames {
  "analytics"?: string;
  "control-center"?: string;
  "dashboard"?: string;
  "data-prep"?: string;
  "feature-engineering"?: string;
  "entities"?: string;
  "hub"?: string;
  "metadata"?: string;
  "pipelines"?: string;
  "reports"?: string;
  "rules-engine"?: string;
}

interface IOnePoint0SpecJSON extends IThemeJSON {
  "styles"?: {
    "brand-primary-color"?: string;
    "navbar-color"?: string;
    "font-family"?: string;
  };
  "content"?: {
    "product-name"?: string;
    "product-description"?: string;
    "product-logo-navbar"?: {
      "type"?: string;
      "arguments"?: {
         "url"?: string;
         "data"?: string;
      };
    };
    "product-logo-about"?: {
      "type"?: string;
      "arguments"?: {
         "url"?: string;
         "data"?: string;
      };
    };
    "favicon-path"?: string;
    "footer-text"?: string;
    "footer-link"?: string;
    "feature-names"?: IJsonFeatureNames;
    "show-footer"?: boolean;
    "show-header"?: boolean;
    "show-pipeline-create-button"?: boolean;
    "show-data-prep-plus-button"?: boolean;
  };
  "features"?: {
    "about-product"?: boolean;
    "dashboard"?: boolean;
    "reports"?: boolean;
    "data-prep"?: boolean;
    "feature-engineering"?: boolean;
    "pipelines"?: boolean;
    "analytics"?: boolean;
    "rules-engine"?: boolean;
    "metadata"?: boolean;
    "hub"?: boolean;
    "ingest-data"?: boolean;
    "add-namespace"?: boolean;
    "enable-jio"?: boolean,
    "batch-pipeline-connection"?: string[];
    "realtime-pipeline-connection"?: string[];
    "auto-save-timer"?: number;
    "startstop-disable"?: string[]
  };
}

// TODO: Investigate moving this to a separate typings folder, as we shouldn't
// do this in multiple places
declare global {
  /* tslint:disable:interface-name */
  interface Window {
    CDAP_UI_THEME: IOnePoint0SpecJSON;
  }
}

export function applyTheme() {
  if (
    !objectQuery(window, 'CDAP_UI_THEME', 'styles') ||
    isNilOrEmpty(window.CDAP_UI_THEME.styles)
  ) {
    // need to run this at least once even if there's no theme customization
    // so that css variables are parsed correctly even in older browsers
    cssVars();
    return;
  }

  function apply1Point0Styles() {
    const stylesJSON = window.CDAP_UI_THEME.styles;
    const stylesToApply: IOnePoint0SpecJSON['styles'] = {};
    if ('brand-primary-color' in stylesJSON && isColor(stylesJSON['brand-primary-color'])) {
      stylesToApply['brand-primary-color'] = stylesJSON['brand-primary-color'];
    }
    if ('navbar-color' in stylesJSON && isColor(stylesJSON['navbar-color'])) {
      stylesToApply['navbar-color'] = stylesJSON['navbar-color'];
    }
    // TODO: Validate fonts more rigorously
    if ('font-family' in stylesJSON && typeof stylesJSON['font-family'] === 'string') {
      stylesToApply['font-family'] = stylesJSON['font-family'];
    }

    // this is what's going on under the hood for modern browsers:
    // document.documentElement.style.setProperty(`--${cssVar}`, cssValue);
    cssVars({
      variables: stylesToApply,
    });
  }

  const specVersion = window.CDAP_UI_THEME['spec-version'];
  if (specVersion === '1.0') {
    apply1Point0Styles();
  }
  return;
}

interface IFeatureNames {
  analytics: string;
  controlCenter: string;
  dashboard: string;
  dataPrep: string;
  featureEngineering: string;
  entities: string;
  hub: string;
  metadata: string;
  pipelines: string;
  reports: string;
  rulesEngine: string;
}

interface IThemeObj {
  productName?: string;
  productDescription?: string;
  footerText?: string;
  footerLink?: string;
  showFooter?: boolean;
  showHeader?: boolean;
  productLogoNavbar?: string;
  productLogoAbout?: string;
  favicon?: string;
  showDashboard?: boolean;
  showReports?: boolean;
  showDataPrep?: boolean;
  showFeatureEngineering?: boolean;
  showPipelines?: boolean;
  showAnalytics?: boolean;
  showRulesEngine?: boolean;
  showMetadata?: boolean;
  showHub?: boolean;
  showIngestData?: boolean;
  showAddNamespace?: boolean;
  featureNames?: IFeatureNames;
  showAboutProductModal?: boolean;
  showPipelineCreateButton?: boolean;
  showDataPrepPlusButton?: boolean;
  isCustomerMWC?: boolean;
  isCustomerJIO?: boolean;
  batchPipelineConnection?: string[];
  realtimePipelineConnection?: string[];
  autoSaveTimer?: number;
  startstopDisable?: string[];
}

function getTheme(): IThemeObj {
  let theme: IThemeObj = {};
  const DEFAULT_THEME_JSON: IThemeJSON = {
    'spec-version': '1.0',
    'is-customer-MWC': false,
  };

  const themeJSON = window.CDAP_UI_THEME || DEFAULT_THEME_JSON;
  const specVersion = themeJSON['spec-version'] || '1.0';
  if (themeJSON['is-customer-MWC'] !== undefined) {
    theme.isCustomerMWC = themeJSON['is-customer-MWC'];
  }
  if (specVersion === '1.0') {
    theme = {
      ...theme,
      ...parse1Point0Spec(themeJSON),
    };
  }
  // Need to specify this here to show default/customized title when a CDAP page
  // is not active in the browser, since the <Helmet> titles of the pages won't
  // take effect until the page is active/rendered
  document.title = theme.productName;
  return theme;
}

function parse1Point0Spec(themeJSON: IOnePoint0SpecJSON): IThemeObj {
  const theme: IThemeObj = {};

  function getContent(): IThemeObj {
    const contentJson = themeJSON.content;
    const content: IThemeObj = {
      productName: 'Data Playbook',
      productDescription: `Enables SME in Designer Mode to create Analytics use cases
      by creation of Playbook using re-usable Accelerators.
      For Production Deployment, Application Developers can optimise Playbooks using Developer Mode..`,
      productLogoNavbar: '/cdap_assets/img/company_logo.png',
      productLogoAbout: '/cdap_assets/img/Company_logo_darkgray.png',
      favicon: '/cdap_assets/img/favicon.png',
      footerText: 'Licensed under the Apache License, Version 2.0',
      footerLink: 'https://www.apache.org/licenses/LICENSE-2.0',
      showFooter: true,
      showHeader: true,
      showPipelineCreateButton: true,
      showDataPrepPlusButton: true,
      featureNames: {
        analytics: 'Analytics',
        controlCenter: 'Control Center',
        dashboard: 'Dashboard',
        dataPrep: 'Preparation',
        featureEngineering: 'Feature Engineering',
        entities: 'Entities',
        hub: 'Hub',
        metadata: 'Metadata',
        pipelines: 'Pipelines',
        reports: 'Reports',
        rulesEngine: 'Rules',
      },
    };
    if (isNilOrEmpty(contentJson)) {
      return content;
    }
    if ('product-name' in contentJson) {
      content.productName = contentJson['product-name'];
    }
    if ('product-description' in contentJson) {
      content.productDescription = contentJson['product-description'];
    }
    if ('footer-text' in contentJson) {
      content.footerText = contentJson['footer-text'];
    }
    if ('footer-link' in contentJson) {
      content.footerLink = contentJson['footer-link'];
    }
    if ('show-footer' in contentJson) {
      content.showFooter = contentJson['show-footer'];
    }
    if ('show-header' in contentJson) {
      content.showHeader = contentJson['show-header'];
    }
    if ('show-pipeline-create-button' in contentJson) {
      content.showPipelineCreateButton = contentJson['show-pipeline-create-button'];
    }
    if ('show-data-prep-plus-button' in contentJson) {
      content.showDataPrepPlusButton = contentJson['show-data-prep-plus-button'];
    }
    if ('product-logo-navbar' in contentJson) {
      const productLogoNavbar = window.CDAP_UI_THEME.content['product-logo-navbar'];
      if (productLogoNavbar.type) {
        const productLogoNavbarType = productLogoNavbar.type;
        if (productLogoNavbarType === 'inline') {
          content.productLogoNavbar = objectQuery(productLogoNavbar, 'arguments', 'data');
        } else if (productLogoNavbarType === 'link') {
          content.productLogoNavbar = objectQuery(productLogoNavbar, 'arguments', 'url');
        }
      }
    }
    if ('product-logo-about' in contentJson) {
      const productLogoAbout = window.CDAP_UI_THEME.content['product-logo-about'];
      if (productLogoAbout.type) {
        const productLogoAboutType = productLogoAbout.type;
        if (productLogoAboutType === 'inline') {
          content.productLogoAbout = objectQuery(productLogoAbout, 'arguments', 'data');
        } else if (productLogoAboutType === 'link') {
          content.productLogoAbout = objectQuery(productLogoAbout, 'arguments', 'url');
        }
      }
    }
    if ('feature-names' in contentJson) {
      const featureNames = { ...content.featureNames };

      if ('analytics' in contentJson['feature-names']) {
        featureNames.analytics = objectQuery(contentJson, 'feature-names', 'analytics');
      }
      if ('control-center' in contentJson['feature-names']) {
        featureNames.controlCenter = objectQuery(contentJson, 'feature-names', 'control-center');
      }
      if ('dashboard' in contentJson['feature-names']) {
        featureNames.dashboard = objectQuery(contentJson, 'feature-names', 'dashboard');
      }
      if ('data-prep' in contentJson['feature-names']) {
        featureNames.dataPrep = objectQuery(contentJson, 'feature-names', 'data-prep');
      }
      if ('feature-engineering' in contentJson['feature-names']) {
        featureNames.featureEngineering = objectQuery(contentJson, 'feature-names', 'feature-engineering');
      }
      if ('entities' in contentJson['feature-names']) {
        featureNames.entities = objectQuery(contentJson, 'feature-names', 'entities');
      }
      if ('hub' in contentJson['feature-names']) {
        featureNames.hub = objectQuery(contentJson, 'feature-names', 'hub');
      }
      if ('metadata' in contentJson['feature-names']) {
        featureNames.metadata = objectQuery(contentJson, 'feature-names', 'metadata');
      }
      if ('pipelines' in contentJson['feature-names']) {
        featureNames.pipelines = objectQuery(contentJson, 'feature-names', 'pipelines');
      }
      if ('reports' in contentJson['feature-names']) {
        featureNames.reports = objectQuery(contentJson, 'feature-names', 'reports');
      }
      if ('rules-engine' in contentJson['feature-names']) {
        featureNames.rulesEngine = objectQuery(contentJson, 'feature-names', 'rules-engine');
      }

      content.featureNames = featureNames;
    }

    return content;
  }

  function getFeatures(): IThemeObj {
    const featuresJson = themeJSON.features;
    const features: IThemeObj = {
      showDashboard: true,
      showReports: true,
      showDataPrep: true,
      showFeatureEngineering: false,
      showPipelines: true,
      showAnalytics: true,
      showRulesEngine: true,
      showMetadata: true,
      showHub: true,
      showIngestData: true,
      showAddNamespace: true,
      showAboutProductModal: true,
      isCustomerJIO: false,
      batchPipelineConnection: [],
      realtimePipelineConnection: [],
      autoSaveTimer: 10000,
      startstopDisable: [],
    };
    if (isNilOrEmpty(featuresJson)) {
      return features;
    }
    if ('dashboard' in featuresJson && isBoolean(featuresJson.dashboard)) {
      features.showDashboard = featuresJson.dashboard;
    }
    if ('reports' in featuresJson && isBoolean(featuresJson.reports)) {
      features.showReports = featuresJson.reports;
    }
    if ('data-prep' in featuresJson && isBoolean(featuresJson['data-prep'])) {
      features.showDataPrep = featuresJson['data-prep'];
    }
    if ('feature-engineering' in featuresJson && isBoolean(featuresJson['feature-engineering'])) {
      features.showFeatureEngineering = featuresJson['feature-engineering'];
    }
    if ('pipelines' in featuresJson && isBoolean(featuresJson.pipelines)) {
      features.showPipelines = featuresJson.pipelines;
    }
    if ('analytics' in featuresJson && isBoolean(featuresJson.analytics)) {
      features.showAnalytics = featuresJson.analytics;
    }
    if ('rules-engine' in featuresJson && isBoolean(featuresJson['rules-engine'])) {
      features.showRulesEngine = featuresJson['rules-engine'];
    }
    if ('metadata' in featuresJson && isBoolean(featuresJson.metadata)) {
      features.showMetadata = featuresJson.metadata;
    }
    if ('hub' in featuresJson && isBoolean(featuresJson.hub)) {
      features.showHub = featuresJson.hub;
    }
    if ('ingest-data' in featuresJson && isBoolean(featuresJson['ingest-data'])) {
      features.showIngestData = featuresJson['ingest-data'];
    }
    if ('add-namespace' in featuresJson && isBoolean(featuresJson['add-namespace'])) {
      features.showAddNamespace = featuresJson['add-namespace'];
    }

    if ('about-product' in featuresJson && isBoolean(featuresJson['about-product'])) {
      features.showAboutProductModal = featuresJson['about-product'];
    }
    if ('enable-jio' in featuresJson && isBoolean(featuresJson['enable-jio'])) {
      features.isCustomerJIO = featuresJson['enable-jio'];
    }
    if ('batch-pipeline-connection' in featuresJson) {
      features.batchPipelineConnection = featuresJson['batch-pipeline-connection'];
    }
    if ('realtime-pipeline-connection' in featuresJson) {
      features.realtimePipelineConnection = featuresJson['realtime-pipeline-connection'];
    }
    if ('auto-save-timer' in featuresJson) {
      features.autoSaveTimer = featuresJson['auto-save-timer'];
    }
    if ('startstop-disable' in featuresJson) {
      features.startstopDisable = featuresJson['startstop-disable'];
    }
    return features;
  }

  return {
    ...theme,
    ...getContent(),
    ...getFeatures(),
  };
}

export const Theme = getTheme();
