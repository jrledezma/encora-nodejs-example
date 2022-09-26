import * as mongoose from 'mongoose';
import { Schema, Document, Model } from 'mongoose';
import { ObjectID } from 'mongodb';
import { ClientCommunicationTrackingCommentModelInterface } from '../interfaces/models';

export interface ClientCommunicationTrackingCommentDocumentInterface
  extends ClientCommunicationTrackingCommentModelInterface,
  Document {
    _id?: string;
    communicationTracking: any;
    comments: string;
    user: any;
    createdDate: any;
    isActive: boolean;
}

const clientCommunicationTrackingCommentSchema = new Schema({
  communicationTracking: {
    type: ObjectID,
    ref: 'ClientCommunicationTracking',
    required: true
  },
  comments: {
    type: String,
    required: true
  },
  user: {
    type: ObjectID,
    ref: 'User',
    required: true
  },
  createdDate: {
    type: Date,
    required: true,
    default: new Date()
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true
  }
});
clientCommunicationTrackingCommentSchema.set('autoIndex', false);

export const ClientCommunicationTrackingCommentSchema: Model<ClientCommunicationTrackingCommentDocumentInterface> = mongoose.model<ClientCommunicationTrackingCommentDocumentInterface>(
  'ClientCommunicationTrackingComment',
  clientCommunicationTrackingCommentSchema
);

export default ClientCommunicationTrackingCommentSchema;
