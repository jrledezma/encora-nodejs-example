import * as mongoose from 'mongoose';
import { Schema, Document, Model } from 'mongoose';
import { ObjectID } from 'mongodb';
import { PaymentTypeModelInterface } from '../interfaces/models';

export interface PaymentTypeDocumentInterface
  extends PaymentTypeModelInterface,
    Document {
  _id: string;
  value: string;
  description: string;
  isActive: boolean;
  lastModificationUser?: any;
  lastModificationDate?: Date;
}

const paymentTypeSchema = new Schema({
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
paymentTypeSchema.set('autoIndex', false);

export const PaymentTypeSchema: Model<PaymentTypeDocumentInterface> = mongoose.model<PaymentTypeDocumentInterface>(
  'PaymentType',
  paymentTypeSchema
);

export default PaymentTypeSchema;
