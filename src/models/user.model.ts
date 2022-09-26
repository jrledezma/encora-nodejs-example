import * as mongoose from 'mongoose';
import { Schema, Document, Model } from 'mongoose';
import { UserModelInterface } from '../interfaces/models';

export interface UserDocumentInterface extends UserModelInterface, Document {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  countryCode?: string;
  phoneNumber?: string;
  image?: string;
  about?: string;
  registrationToken?: string;
  recoverAccountToken?: string;
  recoverPasswordToken?: string;
  salt?: string;
  password?: string;
  status?: string;
  isAdmin?: boolean;
  createdDate: Date;
  lastModificationDate: Date;
}

const userSchema = new Schema({
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true
  },
  countryCode: {
    type: String,
    required: false
  },
  phoneNumber: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  about: {
    type: String,
    required: false
  },
  registrationToken: {
    type: String,
    required: false
  },
  recoverPasswordToken: {
    type: String,
    required: false
  },
  recoverAccountToken: {
    type: String,
    required: false
  },
  oAuthId: {
    type: String,
    required: false
  },
  salt: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: false
  },
  isAdmin: {
    type: Boolean,
    default: false,
    required: false
  },
  createdDate: {
    required: true,
    type: Date,
    default: Date.now
  },
  lastModificationDate: {
    required: false,
    type: Date,
  }
});
userSchema.set('autoIndex', false);

export const UserSchema: Model<UserDocumentInterface> = mongoose.model<UserDocumentInterface>(
  'User',
  userSchema
);

export default UserSchema;
