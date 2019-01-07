/* eslint react/prop-types: 0 */

import React from 'react';
import { Input } from 'reactstrap';
import { EDIT_PIPELINE } from '../config';
require('./DetailProvider.scss');

class DetailProvider extends React.Component {
  name;
  constructor(props) {
    super(props);
  }

  onNameUpdated(event) {
    this.name =  event.target.value;
    this.props.updateFeatureName(this.name);
  }

  render() {
    return (
      <div className = "detail-step-container">
        <div className='field-row'>
            <div className='name'>Name*</div>
            <div className='colon'>:</div>
            <Input className='value' type="text" name="name" placeholder='name'  readOnly = {this.props.operationType == EDIT_PIPELINE}
              defaultValue = {this.props.featureName} onChange={this.onNameUpdated.bind(this)}/>
        </div>
        <div className='field-row'>
            <div className='name'>Description</div>
            <div className='colon'>:</div>
            <textarea className='description'></textarea>
        </div>
      </div>
    );
  }
}

export default DetailProvider;
