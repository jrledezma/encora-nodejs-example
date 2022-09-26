import * as mongoose from 'mongoose';
import { Schema, Document, Model } from 'mongoose';
import { ObjectID } from 'mongodb';
import { ClientWayOfEntryModelInterface } from '../interfaces/models';

export interface ClientWayOfEntryDocumentInterface
  extends ClientWayOfEntryModelInterface,
    Document {
  _id: string;
  code: string;
  value: string;
  description: string;
  isActive: boolean;
  lastModificationUser?: any;
  lastModificationDate?: Date;
}

const clientWayOfEntrySchema = new Schema({
  code: {
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
clientWayOfEntrySchema.set('autoIndex', false);

export const ClientWayOfEntrySchema: Model<ClientWayOfEntryDocumentInterface> = mongoose.model<ClientWayOfEntryDocumentInterface>(
  'ClientWayOfEntrys',
  clientWayOfEntrySchema
);

export default ClientWayOfEntrySchema;
