import React, { Component } from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import './MRDS.css';
import LandingPage from './ModelManagement/LandingPage';
import ExperimentDetail from './ModelManagement/ExperimentDetail';

class MRDSComponent extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="mrdsui-container">
          <Switch>
            <Route exact path="/" component={LandingPage} />
            <Route path="/experimentDetail/:name" component={ExperimentDetail} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default MRDSComponent;
