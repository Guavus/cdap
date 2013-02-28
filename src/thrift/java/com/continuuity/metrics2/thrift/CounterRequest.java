/**
 * Autogenerated by Thrift Compiler (0.9.0)
 *
 * DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
 *  @generated
 */
package com.continuuity.metrics2.thrift;

import org.apache.commons.lang.builder.HashCodeBuilder;
import org.apache.thrift.scheme.IScheme;
import org.apache.thrift.scheme.SchemeFactory;
import org.apache.thrift.scheme.StandardScheme;

import org.apache.thrift.scheme.TupleScheme;
import org.apache.thrift.protocol.TTupleProtocol;
import org.apache.thrift.protocol.TProtocolException;
import org.apache.thrift.EncodingUtils;
import org.apache.thrift.TException;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.EnumMap;
import java.util.Set;
import java.util.HashSet;
import java.util.EnumSet;
import java.util.Collections;
import java.util.BitSet;
import java.nio.ByteBuffer;
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Defines a request to be made to server.
 */
public class CounterRequest implements org.apache.thrift.TBase<CounterRequest, CounterRequest._Fields>, java.io.Serializable, Cloneable {
  private static final org.apache.thrift.protocol.TStruct STRUCT_DESC = new org.apache.thrift.protocol.TStruct("CounterRequest");

  private static final org.apache.thrift.protocol.TField ARGUMENT_FIELD_DESC = new org.apache.thrift.protocol.TField("argument", org.apache.thrift.protocol.TType.STRUCT, (short)1);
  private static final org.apache.thrift.protocol.TField NAME_FIELD_DESC = new org.apache.thrift.protocol.TField("name", org.apache.thrift.protocol.TType.LIST, (short)2);

  private static final Map<Class<? extends IScheme>, SchemeFactory> schemes = new HashMap<Class<? extends IScheme>, SchemeFactory>();
  static {
    schemes.put(StandardScheme.class, new CounterRequestStandardSchemeFactory());
    schemes.put(TupleScheme.class, new CounterRequestTupleSchemeFactory());
  }

  private FlowArgument argument; // required
  private List<String> name; // optional

  /** The set of fields this struct contains, along with convenience methods for finding and manipulating them. */
  public enum _Fields implements org.apache.thrift.TFieldIdEnum {
    ARGUMENT((short)1, "argument"),
    NAME((short)2, "name");

    private static final Map<String, _Fields> byName = new HashMap<String, _Fields>();

    static {
      for (_Fields field : EnumSet.allOf(_Fields.class)) {
        byName.put(field.getFieldName(), field);
      }
    }

    /**
     * Find the _Fields constant that matches fieldId, or null if its not found.
     */
    public static _Fields findByThriftId(int fieldId) {
      switch(fieldId) {
        case 1: // ARGUMENT
          return ARGUMENT;
        case 2: // NAME
          return NAME;
        default:
          return null;
      }
    }

    /**
     * Find the _Fields constant that matches fieldId, throwing an exception
     * if it is not found.
     */
    public static _Fields findByThriftIdOrThrow(int fieldId) {
      _Fields fields = findByThriftId(fieldId);
      if (fields == null) throw new IllegalArgumentException("Field " + fieldId + " doesn't exist!");
      return fields;
    }

    /**
     * Find the _Fields constant that matches name, or null if its not found.
     */
    public static _Fields findByName(String name) {
      return byName.get(name);
    }

    private final short _thriftId;
    private final String _fieldName;

    _Fields(short thriftId, String fieldName) {
      _thriftId = thriftId;
      _fieldName = fieldName;
    }

    public short getThriftFieldId() {
      return _thriftId;
    }

    public String getFieldName() {
      return _fieldName;
    }
  }

  // isset id assignments
  private _Fields optionals[] = {_Fields.NAME};
  public static final Map<_Fields, org.apache.thrift.meta_data.FieldMetaData> metaDataMap;
  static {
    Map<_Fields, org.apache.thrift.meta_data.FieldMetaData> tmpMap = new EnumMap<_Fields, org.apache.thrift.meta_data.FieldMetaData>(_Fields.class);
    tmpMap.put(_Fields.ARGUMENT, new org.apache.thrift.meta_data.FieldMetaData("argument", org.apache.thrift.TFieldRequirementType.DEFAULT, 
        new org.apache.thrift.meta_data.StructMetaData(org.apache.thrift.protocol.TType.STRUCT, FlowArgument.class)));
    tmpMap.put(_Fields.NAME, new org.apache.thrift.meta_data.FieldMetaData("name", org.apache.thrift.TFieldRequirementType.OPTIONAL, 
        new org.apache.thrift.meta_data.ListMetaData(org.apache.thrift.protocol.TType.LIST, 
            new org.apache.thrift.meta_data.FieldValueMetaData(org.apache.thrift.protocol.TType.STRING))));
    metaDataMap = Collections.unmodifiableMap(tmpMap);
    org.apache.thrift.meta_data.FieldMetaData.addStructMetaDataMap(CounterRequest.class, metaDataMap);
  }

  public CounterRequest() {
  }

  public CounterRequest(
    FlowArgument argument)
  {
    this();
    this.argument = argument;
  }

  /**
   * Performs a deep copy on <i>other</i>.
   */
  public CounterRequest(CounterRequest other) {
    if (other.isSetArgument()) {
      this.argument = new FlowArgument(other.argument);
    }
    if (other.isSetName()) {
      List<String> __this__name = new ArrayList<String>();
      for (String other_element : other.name) {
        __this__name.add(other_element);
      }
      this.name = __this__name;
    }
  }

  public CounterRequest deepCopy() {
    return new CounterRequest(this);
  }

  @Override
  public void clear() {
    this.argument = null;
    this.name = null;
  }

  public FlowArgument getArgument() {
    return this.argument;
  }

  public void setArgument(FlowArgument argument) {
    this.argument = argument;
  }

  public void unsetArgument() {
    this.argument = null;
  }

  /** Returns true if field argument is set (has been assigned a value) and false otherwise */
  public boolean isSetArgument() {
    return this.argument != null;
  }

  public void setArgumentIsSet(boolean value) {
    if (!value) {
      this.argument = null;
    }
  }

  public int getNameSize() {
    return (this.name == null) ? 0 : this.name.size();
  }

  public java.util.Iterator<String> getNameIterator() {
    return (this.name == null) ? null : this.name.iterator();
  }

  public void addToName(String elem) {
    if (this.name == null) {
      this.name = new ArrayList<String>();
    }
    this.name.add(elem);
  }

  public List<String> getName() {
    return this.name;
  }

  public void setName(List<String> name) {
    this.name = name;
  }

  public void unsetName() {
    this.name = null;
  }

  /** Returns true if field name is set (has been assigned a value) and false otherwise */
  public boolean isSetName() {
    return this.name != null;
  }

  public void setNameIsSet(boolean value) {
    if (!value) {
      this.name = null;
    }
  }

  public void setFieldValue(_Fields field, Object value) {
    switch (field) {
    case ARGUMENT:
      if (value == null) {
        unsetArgument();
      } else {
        setArgument((FlowArgument)value);
      }
      break;

    case NAME:
      if (value == null) {
        unsetName();
      } else {
        setName((List<String>)value);
      }
      break;

    }
  }

  public Object getFieldValue(_Fields field) {
    switch (field) {
    case ARGUMENT:
      return getArgument();

    case NAME:
      return getName();

    }
    throw new IllegalStateException();
  }

  /** Returns true if field corresponding to fieldID is set (has been assigned a value) and false otherwise */
  public boolean isSet(_Fields field) {
    if (field == null) {
      throw new IllegalArgumentException();
    }

    switch (field) {
    case ARGUMENT:
      return isSetArgument();
    case NAME:
      return isSetName();
    }
    throw new IllegalStateException();
  }

  @Override
  public boolean equals(Object that) {
    if (that == null)
      return false;
    if (that instanceof CounterRequest)
      return this.equals((CounterRequest)that);
    return false;
  }

  public boolean equals(CounterRequest that) {
    if (that == null)
      return false;

    boolean this_present_argument = true && this.isSetArgument();
    boolean that_present_argument = true && that.isSetArgument();
    if (this_present_argument || that_present_argument) {
      if (!(this_present_argument && that_present_argument))
        return false;
      if (!this.argument.equals(that.argument))
        return false;
    }

    boolean this_present_name = true && this.isSetName();
    boolean that_present_name = true && that.isSetName();
    if (this_present_name || that_present_name) {
      if (!(this_present_name && that_present_name))
        return false;
      if (!this.name.equals(that.name))
        return false;
    }

    return true;
  }

  @Override
  public int hashCode() {
    HashCodeBuilder builder = new HashCodeBuilder();

    boolean present_argument = true && (isSetArgument());
    builder.append(present_argument);
    if (present_argument)
      builder.append(argument);

    boolean present_name = true && (isSetName());
    builder.append(present_name);
    if (present_name)
      builder.append(name);

    return builder.toHashCode();
  }

  public int compareTo(CounterRequest other) {
    if (!getClass().equals(other.getClass())) {
      return getClass().getName().compareTo(other.getClass().getName());
    }

    int lastComparison = 0;
    CounterRequest typedOther = (CounterRequest)other;

    lastComparison = Boolean.valueOf(isSetArgument()).compareTo(typedOther.isSetArgument());
    if (lastComparison != 0) {
      return lastComparison;
    }
    if (isSetArgument()) {
      lastComparison = org.apache.thrift.TBaseHelper.compareTo(this.argument, typedOther.argument);
      if (lastComparison != 0) {
        return lastComparison;
      }
    }
    lastComparison = Boolean.valueOf(isSetName()).compareTo(typedOther.isSetName());
    if (lastComparison != 0) {
      return lastComparison;
    }
    if (isSetName()) {
      lastComparison = org.apache.thrift.TBaseHelper.compareTo(this.name, typedOther.name);
      if (lastComparison != 0) {
        return lastComparison;
      }
    }
    return 0;
  }

  public _Fields fieldForId(int fieldId) {
    return _Fields.findByThriftId(fieldId);
  }

  public void read(org.apache.thrift.protocol.TProtocol iprot) throws org.apache.thrift.TException {
    schemes.get(iprot.getScheme()).getScheme().read(iprot, this);
  }

  public void write(org.apache.thrift.protocol.TProtocol oprot) throws org.apache.thrift.TException {
    schemes.get(oprot.getScheme()).getScheme().write(oprot, this);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder("CounterRequest(");
    boolean first = true;

    sb.append("argument:");
    if (this.argument == null) {
      sb.append("null");
    } else {
      sb.append(this.argument);
    }
    first = false;
    if (isSetName()) {
      if (!first) sb.append(", ");
      sb.append("name:");
      if (this.name == null) {
        sb.append("null");
      } else {
        sb.append(this.name);
      }
      first = false;
    }
    sb.append(")");
    return sb.toString();
  }

  public void validate() throws org.apache.thrift.TException {
    // check for required fields
    // check for sub-struct validity
    if (argument != null) {
      argument.validate();
    }
  }

  private void writeObject(java.io.ObjectOutputStream out) throws java.io.IOException {
    try {
      write(new org.apache.thrift.protocol.TCompactProtocol(new org.apache.thrift.transport.TIOStreamTransport(out)));
    } catch (org.apache.thrift.TException te) {
      throw new java.io.IOException(te);
    }
  }

  private void readObject(java.io.ObjectInputStream in) throws java.io.IOException, ClassNotFoundException {
    try {
      read(new org.apache.thrift.protocol.TCompactProtocol(new org.apache.thrift.transport.TIOStreamTransport(in)));
    } catch (org.apache.thrift.TException te) {
      throw new java.io.IOException(te);
    }
  }

  private static class CounterRequestStandardSchemeFactory implements SchemeFactory {
    public CounterRequestStandardScheme getScheme() {
      return new CounterRequestStandardScheme();
    }
  }

  private static class CounterRequestStandardScheme extends StandardScheme<CounterRequest> {

    public void read(org.apache.thrift.protocol.TProtocol iprot, CounterRequest struct) throws org.apache.thrift.TException {
      org.apache.thrift.protocol.TField schemeField;
      iprot.readStructBegin();
      while (true)
      {
        schemeField = iprot.readFieldBegin();
        if (schemeField.type == org.apache.thrift.protocol.TType.STOP) { 
          break;
        }
        switch (schemeField.id) {
          case 1: // ARGUMENT
            if (schemeField.type == org.apache.thrift.protocol.TType.STRUCT) {
              struct.argument = new FlowArgument();
              struct.argument.read(iprot);
              struct.setArgumentIsSet(true);
            } else { 
              org.apache.thrift.protocol.TProtocolUtil.skip(iprot, schemeField.type);
            }
            break;
          case 2: // NAME
            if (schemeField.type == org.apache.thrift.protocol.TType.LIST) {
              {
                org.apache.thrift.protocol.TList _list0 = iprot.readListBegin();
                struct.name = new ArrayList<String>(_list0.size);
                for (int _i1 = 0; _i1 < _list0.size; ++_i1)
                {
                  String _elem2; // required
                  _elem2 = iprot.readString();
                  struct.name.add(_elem2);
                }
                iprot.readListEnd();
              }
              struct.setNameIsSet(true);
            } else { 
              org.apache.thrift.protocol.TProtocolUtil.skip(iprot, schemeField.type);
            }
            break;
          default:
            org.apache.thrift.protocol.TProtocolUtil.skip(iprot, schemeField.type);
        }
        iprot.readFieldEnd();
      }
      iprot.readStructEnd();
      struct.validate();
    }

    public void write(org.apache.thrift.protocol.TProtocol oprot, CounterRequest struct) throws org.apache.thrift.TException {
      struct.validate();

      oprot.writeStructBegin(STRUCT_DESC);
      if (struct.argument != null) {
        oprot.writeFieldBegin(ARGUMENT_FIELD_DESC);
        struct.argument.write(oprot);
        oprot.writeFieldEnd();
      }
      if (struct.name != null) {
        if (struct.isSetName()) {
          oprot.writeFieldBegin(NAME_FIELD_DESC);
          {
            oprot.writeListBegin(new org.apache.thrift.protocol.TList(org.apache.thrift.protocol.TType.STRING, struct.name.size()));
            for (String _iter3 : struct.name)
            {
              oprot.writeString(_iter3);
            }
            oprot.writeListEnd();
          }
          oprot.writeFieldEnd();
        }
      }
      oprot.writeFieldStop();
      oprot.writeStructEnd();
    }

  }

  private static class CounterRequestTupleSchemeFactory implements SchemeFactory {
    public CounterRequestTupleScheme getScheme() {
      return new CounterRequestTupleScheme();
    }
  }

  private static class CounterRequestTupleScheme extends TupleScheme<CounterRequest> {

    @Override
    public void write(org.apache.thrift.protocol.TProtocol prot, CounterRequest struct) throws org.apache.thrift.TException {
      TTupleProtocol oprot = (TTupleProtocol) prot;
      BitSet optionals = new BitSet();
      if (struct.isSetArgument()) {
        optionals.set(0);
      }
      if (struct.isSetName()) {
        optionals.set(1);
      }
      oprot.writeBitSet(optionals, 2);
      if (struct.isSetArgument()) {
        struct.argument.write(oprot);
      }
      if (struct.isSetName()) {
        {
          oprot.writeI32(struct.name.size());
          for (String _iter4 : struct.name)
          {
            oprot.writeString(_iter4);
          }
        }
      }
    }

    @Override
    public void read(org.apache.thrift.protocol.TProtocol prot, CounterRequest struct) throws org.apache.thrift.TException {
      TTupleProtocol iprot = (TTupleProtocol) prot;
      BitSet incoming = iprot.readBitSet(2);
      if (incoming.get(0)) {
        struct.argument = new FlowArgument();
        struct.argument.read(iprot);
        struct.setArgumentIsSet(true);
      }
      if (incoming.get(1)) {
        {
          org.apache.thrift.protocol.TList _list5 = new org.apache.thrift.protocol.TList(org.apache.thrift.protocol.TType.STRING, iprot.readI32());
          struct.name = new ArrayList<String>(_list5.size);
          for (int _i6 = 0; _i6 < _list5.size; ++_i6)
          {
            String _elem7; // required
            _elem7 = iprot.readString();
            struct.name.add(_elem7);
          }
        }
        struct.setNameIsSet(true);
      }
    }
  }

}

