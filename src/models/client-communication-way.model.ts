import * as mongoose from 'mongoose';
import { Schema, Document, Model } from 'mongoose';
import { ObjectID } from 'mongodb';
import { ClientCommunicationWayModelInterface } from '../interfaces/models';

export interface ClientCommunicationWayDocumentInterface
  extends ClientCommunicationWayModelInterface,
  Document {
  _id: string;
  value: string;
  description: string;
  isActive: boolean;
  lastModificationUser?: any;
  lastModificationDate?: Date;
}

const clientCommunicationWaySchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    required: true
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
clientCommunicationWaySchema.set('autoIndex', false);

export const ClientCommunicationWaySchema: Model<ClientCommunicationWayDocumentInterface> = mongoose.model<ClientCommunicationWayDocumentInterface>(
  'ClientCommunicationWay',
  clientCommunicationWaySchema
);

export default ClientCommunicationWaySchema;
