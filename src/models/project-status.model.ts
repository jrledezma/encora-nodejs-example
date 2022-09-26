import * as mongoose from 'mongoose';
import { Schema, Document, Model } from 'mongoose';
import { ObjectID } from 'mongodb';
import { ProjectStatusModelInterface } from '../interfaces/models';

export interface ProjectStatusDocumentInterface
  extends ProjectStatusModelInterface,
    Document {
  _id: string;
  value: string;
  description: string;
  isActive: boolean;
  lastModificationUser?: any;
  lastModificationDate?: Date;
}

const projectStatusSchema = new Schema({
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
projectStatusSchema.set('autoIndex', false);

export const ProjectStatusSchema: Model<ProjectStatusDocumentInterface> = mongoose.model<ProjectStatusDocumentInterface>(
  'ProjectStatu',
  projectStatusSchema
);

export default ProjectStatusSchema;
