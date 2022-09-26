import * as mongoose from 'mongoose';
import { Schema, Document, Model } from 'mongoose';
import { ObjectID } from 'mongodb';
import {
  ClientModelInterface,
  ClientContactModelInterface,
  ClientConfigurationModelInterface
} from '../interfaces/models';

export interface ClientDocumentInterface extends ClientModelInterface, Document {
  _id: string;
  idNumber: string;
  companyName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  wayOfEntry: any;
  dateOfEntry: Date;
  comments?: string;
  contacts?: ClientContactModelInterface[];
  configuration?: ClientConfigurationModelInterface;
  isActive: boolean;
  createdBy: any;
  createdDate: Date;
  lastModificationUser?: any;
  lastModificationDate?: Date;
}

const clientSchema = new Schema({
  idNumber: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  phoneNumber: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  wayOfEntry: {
    type: ObjectID,
    ref: 'ClientWayOfEntrys',
    required: false
  },
  dateOfEntry: {
    type: Date,
    required: true
  },
  comments: {
    type: String,
    required: false
  },
  contacts: {
    type: [],
    required: false
  },
  configuration: {
    type: {},
    required: false
  },
  isActive: {
    type: Boolean,
    required: true
  },
  createdBy: {
    type: ObjectID,
    ref: 'User',
    required: true
  },
  createdDate: {
    type: Date,
    required: true,
    default: new Date()
  },
  lastModificationUser: {
    type: ObjectID,
    ref: 'User',
    required: false
  },
  lastModificationDate: {
    type: Date,
    required: false
  }
});
clientSchema.set('autoIndex', false);

export const ClientSchema: Model<ClientDocumentInterface> = mongoose.model<ClientDocumentInterface>(
  'Client',
  clientSchema
);

export default ClientSchema;
