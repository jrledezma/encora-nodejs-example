import * as mongoose from "mongoose";
import { Schema, Document, Model } from "mongoose";
import { ObjectID } from "mongodb";
import { ClientCommunicationTrackingInvitationModelInterface } from "../interfaces/models";

export interface ClientCommunicationTrackingInvitationDocumentInterface
	extends ClientCommunicationTrackingInvitationModelInterface,
		Document {
	_id?: string;
	communicationTracking: any;
	stakeholder: any;
	invitationStatus: string;
	invitedby: any;
	invitationDate: Date;
	statusDateChanged?: Date;
}

const clientCommunicationTrackingInvitationSchema = new Schema({
	communicationTracking: {
		type: ObjectID,
		ref: "ClientCommunicationTracking",
		required: true,
	},
	stakeholder: {
		type: ObjectID,
		ref: "User",
		required: true,
	},
	invitationStatus: {
		type: String,
		required: true,
	},
	invitedby: {
		type: ObjectID,
		ref: "User",
		required: true,
	},
	invitationDate: {
		type: Date,
		required: true,
		default: new Date(),
	},
	statusDateChanged: {
		type: Date,
		required: false
	},
});
clientCommunicationTrackingInvitationSchema.set("autoIndex", false);

export const ClientCommunicationTrackingInvitationSchema: Model<ClientCommunicationTrackingInvitationModelInterface> = mongoose.model<ClientCommunicationTrackingInvitationModelInterface>(
	"ClientCommunicationTrackingInvitation",
	clientCommunicationTrackingInvitationSchema
);

export default ClientCommunicationTrackingInvitationSchema;
