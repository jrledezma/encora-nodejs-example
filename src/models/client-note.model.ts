import * as mongoose from "mongoose";
import { Schema, Document, Model } from "mongoose";
import { ObjectID } from "mongodb";
import {
	ClientTrackingChangesLogModelInterface,
	ClientNoteModelInterface,
	StakeholderConfigurationModelInterface,
} from "../interfaces/models";

export interface ClientNoteDocumentInterface
	extends ClientNoteModelInterface,
		Document {
	_id: string;
	noteType: any;
	client: any;
	title: string;
	voiceMediaUrl?: string;
	images?: string[];
	comments?: string;
	stakeHolders?: any[] | string[];
	stakeholdersConfiguration: StakeholderConfigurationModelInterface;
	createdBy: any;
	createdDate: Date;
	lastModificationUser?: any;
	lastModificationDate?: Date;
	changesLog?: ClientTrackingChangesLogModelInterface[];
	isArchived?: boolean;
}

const clientNoteSchema = new Schema({
	noteType: {
		type: String,
		ref: "NoteType",
		required: true,
	},
	client: {
		type: ObjectID,
		ref: "Client",
		required: true,
	},
	title: {
		type: String,
		required: false,
	},
	voiceMediaUrl: {
		type: String,
		required: false,
	},
	images: {
		type: [],
		required: false,
	},
	comments: {
		type: String,
		required: false,
	},
	stakeHolders: {
		type: [],
		required: false,
	},
	stakeholdersConfiguration: {
		type: {},
		required: true,
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
clientNoteSchema.set("autoIndex", false);

export const ClientNoteSchema: Model<ClientNoteDocumentInterface> = mongoose.model<ClientNoteDocumentInterface>(
	"ClientNote",
	clientNoteSchema
);

export default ClientNoteSchema;
