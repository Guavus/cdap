import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import './CorrelationContainer.scss';


class CorrelationContainer extends Component {
  algolist = [{ id: 1, name: "pearson" }, { id: 2, name: "spearman" }];

  constructor(props) {
    super(props)
    this.state = {
      algolist: this.algolist,
      openAlgoDropdown: false,
      selectedAlog: { id: -1, name: 'Select' },
    }
  }


  toggleAlgoDropDown = () => {
    this.setState(prevState => ({
      openAlgoDropdown: !prevState.openAlgoDropdown
    }));
  }

  algoTypeChange = (item) => {
    this.setState({ selectedAlog: item });
  }

  applyCorrelation = () => {

  }


  render() {
    return (
      <div className="correlation-container">
        <div className="algo-box">
          <label className="algo-label">Algorithm: </label>
          <Dropdown isOpen={this.state.openAlgoDropdown} toggle={this.toggleAlgoDropDown}>
            <DropdownToggle caret>
              {this.state.selectedAlog.name}
            </DropdownToggle>
            <DropdownMenu>
              {
                this.state.algolist.map((column) => {
                  return (
                    <DropdownItem onClick={this.algoTypeChange.bind(this, column)}
                      key={'algo_' + column.id.toString()}
                    >{column.name}</DropdownItem>
                  );
                })
              }
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="control-box">
          <button className="feature-button" onClick={this.applyCorrelation}>Apply</button>
        </div>
      </div>
    );
  }
}

export default CorrelationContainer;