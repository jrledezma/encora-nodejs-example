import { inject, injectable } from "inversify";
import { ObjectID } from 'mongodb';

import { DBGateway } from "../common";
import {
	ClientCommunicationTrackingInvitationDocumentInterface,
	ClientCommunicationTrackingInvitationSchema,
	ClientDealTrackingSchema,
	ClientDealTrackingDocumentInterface,
} from "../models/index";
import { ServiceResultInterface } from "../interfaces/service-result.interface";
import { ClientCommunicationTrackingInvitationsServiceInterface } from "../interfaces/services";
import { TrackingInvitationStatusEnum } from "../enums";
import { MailService } from "./mail.service";
import { ApiTypes } from "../apiTypes";
import * as path from "path";

let _ = require("lodash");

@injectable()
export class ClientCommunicationTrackingInvitationsService
	implements ClientCommunicationTrackingInvitationsServiceInterface {
	//#region Public Properties

	public GetNewInvitationsByUser = this.getNewInvitationsByUser;
	public GetByTracking = this.getByTracking;
	public GetById = this.getById;
	public GetAllInvitationsByUser = this.getAllInvitationsByUser;
	public GetStakeholderInvitation = this.getStakeholderInvitation;
	public GetInvitationsByInvitedBy = this.getInvitationsByInvitedBy;
	public GetInvitationsByStakeholder = this.getInvitationsByStakeholder;
	public AcceptInvitation = this.acceptInvitation;
	public RejectInvitation = this.rejectInvitation;
	public RevokeInvitation = this.revokeInvitation;
	public StakeholdersLeave = this.stakeholdersLeave;
	//#endregion

	private dbSession: any = null;
	private mailSrv: MailService;
	private dbDocument: ClientCommunicationTrackingInvitationDocumentInterface;
	private selectableFields = [
		"communicationTracking",
		"stakeholder",
		"invitationStatus",
		"invitedby",
		"invitationDate",
		"statusDateChanged",
	];

	public constructor(@inject(ApiTypes.mailService) mailSrv: MailService) {
		this.mailSrv = mailSrv;
	}

	private async getNewInvitationsByUser(
		userId: string
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientCommunicationTrackingInvitationDocumentInterface[] = await ClientCommunicationTrackingInvitationSchema.find(
				{ stakeholder: userId }
			)
				.select(this.selectableFields)
				//communicationTracking
				.populate({
					path: "communicationTracking",
					select: [
						"trackingType",
						"client",
						"clientCommunicationWay",
						"communicationDate",
						"title",
						"comments",
					],
					populate: [
						{
							path: "trackingType",
							model: "ClientTrackingType",
							select: ["_id", "value"],
						},
						{
							path: "client",
							model: "Client",
							select: ["_id", "companyName"],
						},
						{
							path: "clientCommunicationWay",
							model: "ClientCommunicationWay",
							select: ["_id", "value"],
						},
					],
				})
				//invitedby
				.populate({
					path: "invitedby",
					select: [
						"_id",
						"firstName",
						"lastName",
						"email",
						"countryCode",
						"image",
					],
				})
				.sort({ value: "asc" });
			if (!dbResult || !dbResult.length) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			return {
				code: "success",
				detail: dbResult,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async getByTracking(
		trackingId: string
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientCommunicationTrackingInvitationDocumentInterface[] = await ClientCommunicationTrackingInvitationSchema.find(
				{ communicationTracking: trackingId }
			)
				.select(this.selectableFields)
				//communicationTracking
				.populate({
					path: "communicationTracking",
					select: [
						"trackingType",
						"client",
						"clientCommunicationWay",
						"communicationDate",
						"title",
						"comments",
					],
					populate: [
						{
							path: "trackingType",
							model: "ClientTrackingType",
							select: ["_id", "value"],
						},
						{
							path: "client",
							model: "Client",
							select: ["_id", "companyName"],
						},
						{
							path: "clientCommunicationWay",
							model: "ClientCommunicationWay",
							select: ["_id", "value"],
						},
					],
				})
				//stakeholder
				.populate({
					path: "stakeholder",
					select: [
						"_id",
						"firstName",
						"lastName",
						"email",
						"countryCode",
						"image",
					],
				})
				//invitedby
				.populate({
					path: "invitedby",
					select: [
						"_id",
						"firstName",
						"lastName",
						"email",
						"countryCode",
						"image",
					],
				})
				.sort({ value: "asc" });
			if (!dbResult || !dbResult.length) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			return {
				code: "success",
				detail: dbResult,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async getById(id: string): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientCommunicationTrackingInvitationDocumentInterface = await ClientCommunicationTrackingInvitationSchema.findById(
				id
			)
				.select(this.selectableFields)
				//communicationTracking
				.populate({
					path: "communicationTracking",
					select: [
						"trackingType",
						"client",
						"clientCommunicationWay",
						"communicationDate",
						"title",
						"comments",
					],
					populate: [
						{
							path: "trackingType",
							model: "ClientTrackingType",
							select: ["_id", "value"],
						},
						{
							path: "client",
							model: "Client",
							select: ["_id", "companyName"],
						},
						{
							path: "clientCommunicationWay",
							model: "ClientCommunicationWay",
							select: ["_id", "value"],
						},
					],
				})
				//stakeholder
				.populate({
					path: "stakeholder",
					select: [
						"_id",
						"firstName",
						"lastName",
						"email",
						"countryCode",
						"image",
						"status",
					],
				})
				//invitedby
				.populate({
					path: "invitedby",
					select: [
						"_id",
						"firstName",
						"lastName",
						"email",
						"countryCode",
						"image",
					],
				})
				.sort({ value: "asc" });
			if (!dbResult) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			return {
				code: "success",
				detail: dbResult,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async getStakeholderInvitation(
		invitationId: string,
		stakeholderId: string
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientCommunicationTrackingInvitationDocumentInterface[] = await ClientCommunicationTrackingInvitationSchema.find(
				{
					_id: invitationId,
					stakeholder: stakeholderId,
					invitationStatus: TrackingInvitationStatusEnum.requested,
				}
			)
				.select(this.selectableFields)
				//communicationTracking
				.populate({
					path: "communicationTracking",
					select: [
						"trackingType",
						"client",
						"clientCommunicationWay",
						"communicationDate",
						"title",
						"comments",
					],
					populate: [
						{
							path: "trackingType",
							model: "ClientTrackingType",
							select: ["_id", "value"],
						},
						{
							path: "client",
							model: "Client",
							select: ["_id", "companyName"],
						},
						{
							path: "clientCommunicationWay",
							model: "ClientCommunicationWay",
							select: ["_id", "value"],
						},
					],
				})
				//stakeholder
				.populate({
					path: "stakeholder",
					select: [
						"_id",
						"firstName",
						"lastName",
						"email",
						"countryCode",
						"image",
					],
				})
				//invitedby
				.populate({
					path: "invitedby",
					select: [
						"_id",
						"firstName",
						"lastName",
						"email",
						"countryCode",
						"image",
					],
				})
				.sort({ value: "asc" });
			if (!dbResult || !dbResult.length) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			return {
				code: "success",
				detail: dbResult[0],
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async getAllInvitationsByUser(
		userId: string
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientCommunicationTrackingInvitationDocumentInterface[] = await ClientCommunicationTrackingInvitationSchema.find(
				{
					$or: [
						{
							invitedby: userId,
						},
						{
							stakeholder: userId,
						},
					],
				}
			)
				.select(this.selectableFields)
				//communicationTracking
				.populate({
					path: "communicationTracking",
					select: [
						"trackingType",
						"client",
						"clientCommunicationWay",
						"communicationDate",
						"title",
						"comments",
					],
					populate: [
						{
							path: "trackingType",
							model: "ClientTrackingType",
							select: ["_id", "value"],
						},
						{
							path: "client",
							model: "Client",
							select: ["_id", "companyName"],
						},
						{
							path: "clientCommunicationWay",
							model: "ClientCommunicationWay",
							select: ["_id", "value"],
						},
					],
				})
				//stakeholder
				.populate({
					path: "stakeholder",
					select: [
						"_id",
						"firstName",
						"lastName",
						"email",
						"countryCode",
						"phoneNumber",
						"image",
						"about",
						"status",
					],
				})
				//invitedby
				.populate({
					path: "invitedby",
					select: [
						"_id",
						"firstName",
						"lastName",
						"email",
						"countryCode",
						"phoneNumber",
						"image",
						"about",
						"status",
					],
				})
				.sort({ value: "asc" });
			if (!dbResult || !dbResult.length) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			return {
				code: "success",
				detail: dbResult,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async getInvitationsByInvitedBy(
		invitedby: string
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientCommunicationTrackingInvitationDocumentInterface[] = await ClientCommunicationTrackingInvitationSchema.find(
				{
					invitedby: invitedby,
				}
			)
				.select(this.selectableFields)
				//communicationTracking
				.populate({
					path: "communicationTracking",
					select: [
						"trackingType",
						"client",
						"clientCommunicationWay",
						"communicationDate",
						"title",
						"comments",
					],
					populate: [
						{
							path: "trackingType",
							model: "ClientTrackingType",
							select: ["_id", "value"],
						},
						{
							path: "client",
							model: "Client",
							select: ["_id", "companyName"],
						},
						{
							path: "clientCommunicationWay",
							model: "ClientCommunicationWay",
							select: ["_id", "value"],
						},
					],
				})
				//stakeholder
				.populate({
					path: "stakeholder",
					select: [
						"_id",
						"firstName",
						"lastName",
						"email",
						"countryCode",
						"phoneNumber",
						"image",
						"status",
					],
				})
				//invitedby
				.populate({
					path: "invitedby",
					select: [
						"_id",
						"firstName",
						"lastName",
						"email",
						"countryCode",
						"phoneNumber",
						"image",
						,
						"status",
					],
				})
				.sort({ value: "asc" });
			if (!dbResult || !dbResult.length) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			return {
				code: "success",
				detail: dbResult,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async getInvitationsByStakeholder(
		stakeholder: string
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientCommunicationTrackingInvitationDocumentInterface[] = await ClientCommunicationTrackingInvitationSchema.find(
				{
					stakeholder: stakeholder,
					invitationStatus: { $ne: TrackingInvitationStatusEnum.revoked },
				}
			)
				.select(this.selectableFields)
				//communicationTracking
				.populate({
					path: "communicationTracking",
					select: [
						"trackingType",
						"client",
						"clientCommunicationWay",
						"communicationDate",
						"title",
						"comments",
					],
					populate: [
						{
							path: "trackingType",
							model: "ClientTrackingType",
							select: ["_id", "value"],
						},
						{
							path: "client",
							model: "Client",
							select: ["_id", "companyName"],
						},
						{
							path: "clientCommunicationWay",
							model: "ClientCommunicationWay",
							select: ["_id", "value"],
						},
					],
				})
				//stakeholder
				.populate({
					path: "stakeholder",
					select: [
						"_id",
						"firstName",
						"lastName",
						"email",
						"countryCode",
						"phoneNumber",
						"image",
						"about",
						"status",
					],
				})
				//invitedby
				.populate({
					path: "invitedby",
					select: [
						"_id",
						"firstName",
						"lastName",
						"email",
						"countryCode",
						"phoneNumber",
						"image",
						"about",
						"status",
					],
				})
				.sort({ value: "asc" });
			if (!dbResult || !dbResult.length) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			return {
				code: "success",
				detail: dbResult,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async acceptInvitation(
		invitationId: string,
		stakeholderId: string
	): Promise<ServiceResultInterface> {
		// start mongoDb transacction
		this.dbSession = await DBGateway.sessionStarted();
		try {
			this.dbSession.startTransaction();
			let invitationResult: ClientCommunicationTrackingInvitationDocumentInterface = await ClientCommunicationTrackingInvitationSchema.findOne(
				{
					_id: invitationId,
					stakeholder: stakeholderId,
				}
			)
				.populate({
					path: "invitedby",
					model: "User",
					select: ["_id", "firstName", "lastName", "email"],
				})
				.populate({
					path: "stakeholder",
					model: "User",
					select: ["_id", "firstName", "lastName", "email"],
				})
				.populate({
					path: "communicationTracking",
					model: "ClientCommunicationTracking",
					populate: [
						{
							path: "client",
							model: "Client",
							select: ["companyName"],
						},
						{
							path: "createdBy",
							model: "User",
							select: ["_id", "firstName", "lastName", "email"],
						},
					],
				});
			if (!invitationResult) {
				this.dbSession.abortTransaction();
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			//change invitation status
			invitationResult.invitationStatus = TrackingInvitationStatusEnum.accepted;
			invitationResult.statusDateChanged = new Date();
			invitationResult.markModified("ClientCommunicationTrackingInvitation");
			const invitationStatusResponse = await invitationResult.save();
			if (!invitationStatusResponse._id) {
				this.dbSession.abortTransaction();
				return {
					code: "notDataModified",
					detail: "Invitation was not accepted",
				};
			}
			//add invited stakeholder to tracking
			let trackingInfoResult: ClientDealTrackingDocumentInterface = await ClientDealTrackingSchema.findById(
				invitationResult.communicationTracking._id
			).select(["_id", "stakeHolders", "changesLog"]);
			/*changeLogs.push({
						valueKey: "stakeholders",
						previusValue: previousItem,
						newValue: "",
						user: newTracking.lastModificationUser,
						modificationDate: new Date(),
					}); */
			if (!trackingInfoResult) {
				this.dbSession.abortTransaction();
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			if (!trackingInfoResult.changesLog) {
				trackingInfoResult.changesLog = [];
			}
			trackingInfoResult.changesLog.push({
				valueKey: "stakeholders",
				previusValue: "",
				newValue: stakeholderId,
				user: invitationResult.invitedby._id,
				modificationDate: new Date(),
			});
			invitationResult.markModified("ClientCommunicationTracking");
			const trackingResponse = await trackingInfoResult.save();
			if (!trackingResponse._id) {
				this.dbSession.abortTransaction();
				return {
					code: "notDataModified",
					detail: "Invitation was not accepted",
				};
			}
			// closing mongodb transaction
			this.dbSession.endSession();

			//send email to invitedby
			this.mailSrv.SendInvitationAcceptedNotificationToStakeholder(
				invitationResult.invitedby.firstName,
				invitationResult.communicationTracking.client.companyName,
				invitationResult.communicationTracking._id,
				invitationResult.invitedby.email,
				`${invitationResult.stakeholder.firstName} ${invitationResult.stakeholder.lastName}`
			);
			//send email to stakeholder
			this.mailSrv.SendInvitationAcceptedNotification(
				invitationResult.stakeholder.firstName,
				invitationResult.communicationTracking.client.companyName,
				invitationResult.communicationTracking._id,
				invitationResult.stakeholder.email
			);
			//send email to tracking owner
			if (
				invitationResult.invitedby !==
				invitationResult.communicationTracking.createdBy._id
			) {
				this.mailSrv.SendInvitationAcceptedNotificationToOwner(
					invitationResult.communicationTracking.createdBy.firstName,
					invitationResult.communicationTracking.client.companyName,
					invitationResult.communicationTracking._id,
					invitationResult.communicationTracking.createdBy.email,
					`${invitationResult.stakeholder.firstName} ${invitationResult.stakeholder.lastName}`,
					`${invitationResult.invitedby.firstName} ${invitationResult.invitedby.lastName}`,
					invitationResult.invitationDate
				);
			}
			return {
				code: "success",
				detail: "Invitation accepted successfuly",
			};
		} catch (ex) {
			this.dbSession.abortTransaction();
			throw ex;
		}
	}

	private async rejectInvitation(
		invitationId: string,
		stakeholderId
	): Promise<ServiceResultInterface> {
		try {
			let invitationResult: ClientCommunicationTrackingInvitationDocumentInterface = await ClientCommunicationTrackingInvitationSchema.findOne(
				{
					_id: invitationId,
					stakeholder: stakeholderId,
				}
			)
				.populate({
					path: "invitedby",
					model: "User",
					select: ["_id", "firstName", "email"],
				})
				.populate({
					path: "stakeholder",
					model: "User",
					select: ["_id", "firstName", "email"],
				})
				.populate({
					path: "communicationTracking",
					model: "ClientCommunicationTracking",
					populate: [
						{
							path: "client",
							model: "Client",
							select: ["companyName"],
						},
						{
							path: "createdBy",
							model: "User",
							select: ["_id", "firstName", "lastName", "email"],
						},
					],
				});
			if (!invitationResult) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			//change invitation status
			invitationResult.invitationStatus = TrackingInvitationStatusEnum.rejected;
			invitationResult.statusDateChanged = new Date();
			invitationResult.markModified("ClientCommunicationTrackingInvitation");
			const invitationStatusResponse = await invitationResult.save();
			if (!invitationStatusResponse._id) {
				return {
					code: "notDataModified",
					detail: "Invitation was not rejected",
				};
			}
			//send email to invitedby
			this.mailSrv.SendInvitationRejectedNotification(
				invitationResult.invitedby.firstName,
				invitationResult.communicationTracking.client.companyName,
				invitationResult.communicationTracking,
				`${invitationResult.stakeholder.firstName} ${invitationResult.stakeholder.lastName}`,
				invitationResult.invitedby.email
			);
			return {
				code: "success",
				detail: "Invitation rejected successfuly",
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async revokeInvitation(
		invitationId: string,
		invitedby: string
	): Promise<ServiceResultInterface> {
		try {
			this.dbSession = await DBGateway.sessionStarted();
			let invitationResult: ClientCommunicationTrackingInvitationDocumentInterface = await ClientCommunicationTrackingInvitationSchema.findOne(
				{
					_id: invitationId,
					invitedby,
				}
			);
			if (!invitationResult) {
				this.dbSession.abortTransaction();
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			//change invitation status
			const invitationStatus = invitationResult.invitationStatus;
			invitationResult.invitationStatus = TrackingInvitationStatusEnum.revoked;
			invitationResult.statusDateChanged = new Date();
			invitationResult.markModified("ClientCommunicationTrackingInvitation");
			const invitationStatusResponse = await invitationResult.save();
			if (!invitationStatusResponse._id) {
				this.dbSession.abortTransaction();
				return {
					code: "notDataModified",
					detail: "Invitation was not rejected",
				};
			}
			if (invitationStatus === TrackingInvitationStatusEnum.accepted) {
				//getting tracking info
				const trackingInfoResult = await ClientDealTrackingSchema.findById(
					invitationResult.communicationTracking
				).select(["_id", "changesLog", "stakeHolders"]);
				if (!trackingInfoResult) {
					this.dbSession.abortTransaction();
					return {
						code: "notDataFound",
						detail: "Tracking Info not found",
					};
				}
				trackingInfoResult.changesLog.push({
					valueKey: "stakeholders",
					previusValue: invitationResult.stakeholder,
					newValue: "",
					user: invitedby,
					modificationDate: new Date(),
				});
				trackingInfoResult.markModified("ClientCommunicationTracking");
				const trackingResponse = await trackingInfoResult.save();
				if (!trackingResponse._id) {
					this.dbSession.abortTransaction();
					return {
						code: "notDataModified",
						detail: "Invitation was not revoked",
					};
				}
			}
			// closing mongodb transaction
			this.dbSession.endSession();
			return {
				code: "success",
				detail: "Invitation revoked successfuly",
			};
		} catch (ex) {
			this.dbSession.abortTransaction();
			throw ex;
		}
	}

	private async stakeholdersLeave(
		invitationId: string,
		stakeholderId: string
	): Promise<ServiceResultInterface> {
		this.dbSession = await DBGateway.sessionStarted();
		try {
			let invitationResult: ClientCommunicationTrackingInvitationDocumentInterface = await ClientCommunicationTrackingInvitationSchema.findOne(
				{
					_id: invitationId,
					stakeholder: stakeholderId,
				}
			)
				.populate({
					path: "invitedby",
					model: "User",
					select: ["_id", "firstName", "lastName", "email"],
				})
				.populate({
					path: "stakeholder",
					model: "User",
					select: ["_id", "firstName", "email"],
				})
				.populate({
					path: "communicationTracking",
					model: "ClientCommunicationTracking",
					populate: [
						{
							path: "client",
							model: "Client",
							select: ["companyName"],
						},
						{
							path: "createdBy",
							model: "User",
							select: ["_id", "firstName", "lastName", "email"],
						},
					],
				});
			if (!invitationResult) {
				this.dbSession.abortTransaction();
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			//change invitation status
			invitationResult.invitationStatus =
				TrackingInvitationStatusEnum.stakeholderLeaves;
			invitationResult.statusDateChanged = new Date();
			invitationResult.markModified("ClientCommunicationTrackingInvitation");
			const invitationStatusResponse = await invitationResult.save();
			if (!invitationStatusResponse._id) {
				return {
					code: "notDataModified",
					detail: "Invitation was not rejected",
				};
			}
			//get clientCommunicationTracking
			let trackingData = await ClientDealTrackingSchema.findById(
				invitationResult.communicationTracking._id
			);
			if (!trackingData) {
				this.dbSession.abortTransaction();
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			//add new value to changes log
			trackingData.changesLog.push({
				valueKey: "stakeholders",
				previusValue: stakeholderId,
				newValue: "",
				user: stakeholderId,
				modificationDate: new Date(),
			});
			//save data
			trackingData.markModified("ClientCommunicationTracking");
			const trackingResponse = await trackingData.save();
			if (!trackingResponse._id) {
				this.dbSession.abortTransaction();
				return {
					code: "notDataModified",
					detail: "Invitation was not revoked",
				};
			}
			//send email to invitedby
			this.mailSrv.SendStakeholderLeavesdNotification(
				`${invitationResult.invitedby.firstName} ${invitationResult.invitedby.lastName}`,
				invitationResult.communicationTracking.client.companyName,
				invitationResult.communicationTracking,
				`${invitationResult.stakeholder.firstName} ${invitationResult.stakeholder.lastName}`,
				invitationResult.invitedby.email
			);

			this.dbSession.endSession();
			return {
				code: "success",
				detail: "Tracking leaved successfuly",
			};
		} catch (ex) {
			throw ex;
		}
	}
}
