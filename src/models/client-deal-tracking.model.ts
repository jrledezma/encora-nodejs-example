import * as mongoose from 'mongoose';
import { Schema, Document, Model } from 'mongoose';
import { ObjectID } from 'mongodb';
import {
	ClientTrackingChangesLogModelInterface,
	ClientDealTrackingModelInterface,
	StakeholderConfigurationModelInterface,
} from '../interfaces/models';

export interface ClientDealTrackingDocumentInterface
	extends ClientDealTrackingModelInterface,
		Document {
	_id: string;
	deal: any;
	actionToTake: any;
	clientContact?: any;
	scheduleDate: string;
	scheduleHour: string;
	comments: string;
	mediaUrl?: string[];
	teamMemberInCharge?: any | string;
	attentionDescription?: string;
	attentedBy?: any;
	attentionDate?: Date;
	createdBy: any;
	createdDate: Date;
	lastModificationUser?: any;
	lastModificationDate?: Date;
	changesLog?: ClientTrackingChangesLogModelInterface[];
	isArchived?: boolean;
}

const clientDealTrackingSchema = new Schema({
	deal: {
		type: ObjectID,
		ref: 'ClientDeal',
		required: true,
	},
	actionToTake: {
		type: String,
		ref: 'ActionToTake',
		required: false,
	},
	clientContact: {
		type: String,
		required: false,
	},
	scheduleDate: {
		type: String,
		required: true,
	},
	scheduleHour: {
		type: String,
		required: true,
	},
	comments: {
		type: String,
		required: true,
	},
	mediaUrl: {
		type: [],
		required: false,
	},
	teamMemberInCharge: {
		type: ObjectID,
		ref: 'User',
		required: false,
	},
	attentionDescription: {
		type: String,
		required: false,
	},
	attentionDate: {
		type: Date,
		required: false,
	},
	attendedBy: {
		type: ObjectID,
		ref: 'User',
		required: false,
	},
	createdBy: {
		type: ObjectID,
		ref: 'User',
		required: true,
	},
	createdDate: {
		type: Date,
		required: true,
		default: new Date(),
	},
	lastModificationUser: {
		type: ObjectID,
		ref: 'User',
		required: false,
	},
	lastModificationDate: {
		type: Date,
		required: false,
	},
	changesLog: {
		type: [],
		required: false,
	},
	isArchived: {
		type: Boolean,
		default: false,
		required: false,
	},
});
clientDealTrackingSchema.set('autoIndex', false);

export const ClientDealTrackingSchema: Model<ClientDealTrackingDocumentInterface> = mongoose.model<ClientDealTrackingDocumentInterface>(
	'ClientDealTracking',
	clientDealTrackingSchema
);

export default ClientDealTrackingSchema;
