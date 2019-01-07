/* eslint react/prop-types: 0 */
import React from 'react';
import { Button, Modal, ModalHeader,  ModalBody, ModalFooter } from 'reactstrap';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';


import { ListGroup, ListGroupItem } from 'reactstrap';
import CheckList from '../CheckList';
import { toCamelCase } from '../util';

require('./SchemaSelectorModal.scss');

class SchemaSelectorModal extends React.Component {
  changedColumnList;
  constructor(props) {
    super(props);
    this.state = {
      open: this.props.open,
      selectedSchema: undefined,
    };

    this.onCancel = this.onCancel.bind(this);
    this.onDone = this.onDone.bind(this);
    this.onSchemaClick = this.onSchemaClick.bind(this);
  }

  componentDidMount() {
    this.setState({
      selectedSchema: undefined
    });
  }

  onCancel() {
    this.props.onClose('CANCEL', {});
  }

  onDone() {
    let finalSchema = cloneDeep(this.state.selectedSchema);
    finalSchema.schemaColumns = finalSchema.schemaColumns.filter((item, index) => this.changedColumnList.get(index));
    this.props.onClose('OK', finalSchema);
  }

  onSchemaClick(schema) {
    if (this.lastSelectedSchema) {
      this.lastSelectedSchema.selected = false;
    }
    schema.selected = true;
    this.lastSelectedSchema = schema;
    this.setState({
      selectedSchema: schema
    });
  }

  handleColumnChange(changeList) {
    this.changedColumnList = changeList;
  }

  render() {
    let columns = isEmpty(this.state.selectedSchema) ? [] : this.state.selectedSchema.schemaColumns.map(column => {
      return { name: column.columnName, description: toCamelCase(column.columnType), checked: false };
    });
    this.changedColumnList = new Map();
    return (
      <div>
        <Modal isOpen={this.props.open}
          zIndex='1070'>
          <ModalHeader>Select Columns</ModalHeader>
          <ModalBody>
            <div className='body-container'>
              <div className='schema-container'>
                <div className='schema-header'>Schema</div>
                <ListGroup>
                  {
                    this.props.dataProvider.map((item) => {
                      return (<ListGroupItem active={item.selected} key = {item.schemaName}
                        onClick={() => this.onSchemaClick(item)}>{item.schemaName}</ListGroupItem>);
                    })
                  }
                </ListGroup>
              </div>
              <div className='column-container'>
                 <div className='schema-header'>{"Select Columns: " + (this.state.selectedSchema? this.state.selectedSchema.schemaName : "")}</div>
                 {
                   !isEmpty(columns) &&
                   <div className='column-control'>
                    <label className='select-all-container'>
                        <input type="checkbox"/>
                        Select All
                    </label>
                    <div className='column-header'>
                        <div className='column-name'>Column Name</div>
                        <div className='column-type'>Type</div>
                    </div>
                   </div>
                 }
                 <CheckList className = "column-list" dataProvider={columns} handleChange={this.handleColumnChange.bind(this)} />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button className="btn-margin" color="secondary" onClick={this.onCancel}>Cancel</Button>
            <Button className="btn-margin" color="primary" onClick={this.onDone}>Done</Button>{' '}
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default SchemaSelectorModal;
