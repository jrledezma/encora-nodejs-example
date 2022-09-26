import * as mongoose from "mongoose";
import { Schema, Document, Model } from "mongoose";
import { ObjectID } from "mongodb";
import {
	ClientDealModelInterface,
	StakeholderConfigurationModelInterface,
} from "../interfaces/models";

export interface ClientDealDocumentInterface
	extends ClientDealModelInterface,
		Document {
	_id: string;
	client: any;
	referenceCode: string;
	title: string;
	comments: string;
	mediaUrls?: string[];
	teamMembers?: any[] | string[];
	createdBy: any;
	createdDate: Date;
	lastModificationUser?: any;
	lastModificationDate?: Date;
	isArchived?: boolean;
}

const clientDealSchema = new Schema({
	client: {
		type: ObjectID,
		ref: "Client",
		required: true,
	},
	referenceCode: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	comments: {
		type: String,
		required: true,
	},
	mediaUrls: {
		type: [],
		required: false,
	},
	teamMembers: {
		type: [],
		required: false,
	},
	createdBy: {
		type: ObjectID,
		ref: "User",
		required: true,
	},
	createdDate: {
		type: Date,
		required: true,
		default: new Date(),
	},
	lastModificationUser: {
		type: ObjectID,
		ref: "User",
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
clientDealSchema.set("autoIndex", false);

export const ClientDealSchema: Model<ClientDealDocumentInterface> = mongoose.model<ClientDealDocumentInterface>(
	"ClientDeal",
	clientDealSchema
);

export default ClientDealSchema;
