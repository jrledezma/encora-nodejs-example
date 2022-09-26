import * as mongoose from 'mongoose';
import { Schema, Document, Model } from 'mongoose';
import { ObjectID } from 'mongodb';
import { ActionToTakeModelInterface } from '../interfaces/models';

export interface ActionToTakeDocumentInterface
  extends ActionToTakeModelInterface,
  Document {
  _id: string;
  value: string;
  description: string;
  isActive: boolean;
  lastModificationUser?: any;
  lastModificationDate?: Date;
}

const actionToTakeSchema = new Schema({
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
actionToTakeSchema.set('autoIndex', false);

export const ActionToTakeSchema: Model<ActionToTakeDocumentInterface> = mongoose.model<ActionToTakeDocumentInterface>(
  'ActionToTake',
  actionToTakeSchema
);

export default ActionToTakeSchema;
