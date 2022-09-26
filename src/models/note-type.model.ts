import * as mongoose from 'mongoose';
import { Schema, Document, Model } from 'mongoose';
import { ObjectID } from 'mongodb';
import { NoteTypeModelInterface} from '../interfaces/models';

export interface NoteTypeDocumentInterface
  extends NoteTypeModelInterface,
  Document {
  _id: string;
  value: string;
  description: string;
  isActive: boolean;
  lastModificationUser?: any;
  lastModificationDate?: Date;
}

const noteTypeSchema = new Schema({
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
noteTypeSchema.set('autoIndex', false);

export const NoteTypeSchema: Model<NoteTypeDocumentInterface> = mongoose.model<NoteTypeDocumentInterface>(
  'NoteType',
  noteTypeSchema
);

export default NoteTypeSchema;
