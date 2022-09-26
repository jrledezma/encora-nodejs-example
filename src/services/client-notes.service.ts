import { inject, injectable } from "inversify";
import { ObjectID } from "mongodb";

import { DBGateway } from "../common/db-gateway";
import {
	ClientNoteDocumentInterface,
	ClientNoteSchema,
	UserSchema,
	ClientSchema,
	ClientCommunicationWaySchema,
	ClientCommunicationTrackingCommentDocumentInterface,
	ClientCommunicationTrackingCommentSchema,
} from "../models/index";
import { ClientNotesServiceInterface } from "../interfaces/services";
import { CommonFunctions } from "../common";
import { MailService } from "./mail.service";
import { ApiTypes } from "../apiTypes";
import {
	ClientDocumentInterface,
	ClientCommunicationTrackingInvitationSchema,
	ClientCommunicationTrackingInvitationDocumentInterface,
} from "../models";
import {
	ClientModelInterface,
	ClientNoteModelInterface,
	ClientTrackingChangesLogModelInterface,
	ClientCommunicationWayModelInterface,
} from "../interfaces/models/";
import { ServiceResultInterface } from "../interfaces/service-result.interface";
import { UserService } from "./user.service";
import { TrackingInvitationStatusEnum, UserStatusEnum } from "../enums";

let _ = require("lodash");

@injectable()
export class ClientNotesService implements ClientNotesServiceInterface {
	//#region public properties

	public Create = this.create;
	public Modify = this.modify;
	public LeaveNote = this.leaveNote;
	public ArchiveNote = this.archiveNote;
	public UnarchiveNote = this.unarchiveNote;
	public GetAll = this.getAll;
	public GetById = this.getById;
	public Search = this.search;
	public GetClients = this.getClients;
	public NotesByClient = this.notesByClient;

	//#endregion

	//#region private properties

	private mailSrv: MailService;
	private usersSrv: UserService;
	private dbSession: any = null;

	//#endregion

	private dbDocument: ClientNoteDocumentInterface;
	private selectableFields = [
		"_id",
		"noteType",
		"client",
		"title",
		"voiceMediaUrl",
		"images",
		"comments",
		"stakeHolders",
		"stakeholdersConfiguration",
		"createdBy",
		"createdDate",
		"lastModificationUser",
		"lastModificationDate",
		"isArchived",
	];

	public constructor(
		@inject(ApiTypes.mailService) mailSrv: MailService,
		@inject(ApiTypes.userService) usersSrv: UserService
	) {
		this.mailSrv = mailSrv;
		this.usersSrv = usersSrv;
	}

	private async create(
		objToCreate: ClientNoteModelInterface,
		peopleToInvite?: any[],
		files?: any
	): Promise<ServiceResultInterface> {
		// start mongoDb transacction
		this.dbSession = await DBGateway.sessionStarted();
		try {
			//upload files to S3
			const { audioMediaUrl, imagesUrl } = await this.uploadFiles(files);
			//save communication data
			this.dbDocument = new ClientNoteSchema({
				client: objToCreate.client,
				noteType: objToCreate.noteType,
				title: objToCreate.title,
				voiceMediaUrl: audioMediaUrl || null,
				images: imagesUrl || null,
				comments: objToCreate.comments,
				stakeholdersConfiguration: objToCreate.stakeholdersConfiguration,
				createdBy: objToCreate.createdBy,
				createdDate: new Date(),
				isArchived: false,
			});
			const insertResult = await this.dbDocument.save({
				validateBeforeSave: true,
			});
			if (!insertResult) {
				this.dbSession.abortTransaction();
				return {
					code: "error",
					detail: "any data was creted",
				};
			}
			//invite new users or stakholders
			if (peopleToInvite) {
				await this.prepareUserInvitations(
					peopleToInvite,
					insertResult._id,
					objToCreate.createdBy
				);
			}
			this.dbSession.endSession();
			return {
				code: "success",
				detail: insertResult,
			};
		} catch (ex) {
			this.dbSession.abortTransaction();
			throw ex;
		}
	}

	private async modify(
		objToModify: ClientNoteModelInterface,
		peopleToInvite?: any[],
		stakeholdersToRevokeInvitations?: string[],
		files?: any
	): Promise<ServiceResultInterface> {
		// start mongoDb transacction
		this.dbSession = await DBGateway.sessionStarted();
		try {
			//revoke invitations
			await ClientCommunicationTrackingInvitationSchema.updateMany(
				{
					communicationTracking: objToModify._id,
					stakeholder: {
						$in: stakeholdersToRevokeInvitations,
					},
				},
				{
					invitationStatus: TrackingInvitationStatusEnum.revoked,
				}
			);
			//find tracking
			let dbResult: ClientNoteDocumentInterface = await ClientNoteSchema.findById(
				objToModify._id
			)
				.populate({
					path: "stakeHolders",
					model: "User",
					select: ["email", "firstName", "lastName", "status"],
				})
				.populate("createdBy", ["firstName", "lastName", "email"], "User");
			if (!dbResult) {
				this.dbSession.abortTransaction();
				return {
					code: "notDataFound",
					detail: "Data not found for update",
				};
			}
			if (dbResult.noteType !== objToModify.noteType) {
				return {
					code: "error",
					detail: "Cannot change Record Type",
				};
			}
			//upload files to S3
			const { audioMediaUrl, imagesUrl } = await this.uploadFiles(files);
			//remove stakeholders
			if (stakeholdersToRevokeInvitations) {
				stakeholdersToRevokeInvitations.forEach((stakeholderToRemove) => {
					objToModify.stakeHolders = dbResult.stakeHolders.filter(
						(stakeholder) => {
							if ((stakeholder as any)._id.toString() !== stakeholderToRemove) {
								return stakeholder;
							}
						}
					);
				});
			}

			if (!objToModify.stakeHolders) {
				objToModify.stakeHolders = dbResult.stakeHolders;
			}

			// changes log
			const newChangesLog = this.compareRecordChanges(dbResult, objToModify);
			dbResult.changesLog = dbResult.changesLog
				? dbResult.changesLog.concat(newChangesLog)
				: newChangesLog;
			//detect if the tracking is an audio note and if it's audio has changed
			if (files && files.length > 0) {
				const imgQtt = files.filter(
						(file) => file.mimetype.split("/")[0] === "image"
					).length,
					newAudio =
						files.filter((file) => file.mimetype.split("/")[0] === "audio")
							.length > 0;
				if (newAudio) {
					dbResult.changesLog.push({
						valueKey: "audio",
						previusValue: "",
						newValue: "",
						user: objToModify.lastModificationUser,
						modificationDate: new Date(),
					});
				}
				if (imgQtt > 0) {
					//adding new images url to tracking images\
					objToModify.images = objToModify.images
						? objToModify.images.concat(imagesUrl)
						: imagesUrl;
					dbResult.changesLog.push({
						valueKey: "images",
						previusValue: "",
						newValue: imgQtt.toString(),
						user: objToModify.lastModificationUser,
						modificationDate: new Date(),
					});
				}
			}
			//validates if the user is a stakeholder
			//to modify some values
			if (
				dbResult.createdBy._id.toString() === objToModify.lastModificationUser
			) {
				dbResult.stakeholdersConfiguration =
					objToModify.stakeholdersConfiguration;
			}
			dbResult.stakeHolders = objToModify.stakeHolders as string[];
			dbResult.title = objToModify.title;
			dbResult.voiceMediaUrl = audioMediaUrl || dbResult.voiceMediaUrl;
			dbResult.images = objToModify.images;
			dbResult.comments = objToModify.comments;
			dbResult.lastModificationUser = objToModify.lastModificationUser;
			dbResult.isArchived = objToModify.isArchived;
			dbResult.lastModificationDate = new Date();
			dbResult.markModified("ClientNoteSchema");

			const updateResult = await dbResult.save();
			if (updateResult) {
				//create stakeHolders array
				let stakeHoldersList: any[] = [];
				if (objToModify.stakeHolders && objToModify.stakeHolders.length) {
					stakeHoldersList = (objToModify.stakeHolders as any[]).map(
						(stakeHolder: any) => {
							return {
								_id: stakeHolder._id,
								firstName: stakeHolder.firstName,
								lastName: stakeHolder.lastName,
								email: stakeHolder.email,
								status: stakeHolder.status,
							};
						}
					);

					if (newChangesLog.length) {
						//get lastModificationUser info
						const userData = await UserSchema.findById(
							objToModify.lastModificationUser
						).select(["email", "firstName", "lastName"]);
						//send mail to stake holders
						stakeHoldersList.forEach((stakeHolder) => {
							if (
								stakeHolder.status === UserStatusEnum.confirmed &&
								objToModify.lastModificationUser !== stakeHolder._id
							) {
								this.mailSrv.SendClientCommunicationMail(
									false,
									objToModify._id,
									objToModify.noteType,
									stakeHolder.firstName,
									stakeHolder.email,
									`${userData.firstName} ${userData.lastName}`
								);
							}
						});
						//send email to createdBy user
						if (
							dbResult.createdBy._id.toString() !==
							objToModify.lastModificationUser
						) {
							this.mailSrv.SendClientCommunicationMail(
								false,
								objToModify._id,
								objToModify.noteType,
								`${dbResult.createdBy.firstName}`,
								dbResult.createdBy.email,
								`${userData.firstName} ${userData.lastName}`
							);
						}
					}
				}

				//invite new users or stakholders
				if (peopleToInvite) {
					await this.prepareUserInvitations(
						peopleToInvite,
						objToModify._id,
						objToModify.lastModificationUser
					);
				}
				//ending mongodb session
				this.dbSession.endSession();
				return Promise.resolve({
					code: "success",
					detail: "Data updated successfully",
				});
			}

			this.dbSession.abortTransaction();
			return Promise.reject({
				code: "notDataModified",
				detail: "Data not updated",
			});
		} catch (ex) {
			this.dbSession.abortTransaction();
			throw ex;
		}
	}

	private async leaveNote(
		trackingId: string,
		stakeholderId: string
	): Promise<ServiceResultInterface> {
		// start mongoDb transacction
		this.dbSession = await DBGateway.sessionStarted();
		try {
			//get invitation associated to the tracking and stakeholder
			let invitationResult = await ClientCommunicationTrackingInvitationSchema.findOne(
				{
					communicationTracking: trackingId,
					stakeholder: stakeholderId,
					invitationStatus: TrackingInvitationStatusEnum.accepted,
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
					code: "notDataModified",
					detail: "Invitation data not found",
				};
			}
			invitationResult.invitationStatus =
				TrackingInvitationStatusEnum.stakeholderLeaves;
			invitationResult.statusDateChanged = new Date();
			invitationResult.markModified("ClientCommunicationTrackingInvitation");
			const invitationStatusResponse = await invitationResult.save();
			if (!invitationStatusResponse._id) {
				return {
					code: "notDataModified",
					detail: "tracking was not leaved",
				};
			}
			//get clientCommunicationTracking
			let trackingData = await ClientNoteSchema.findById(
				invitationResult.communicationTracking._id
			).populate({
				path: "client",
				select: ["companyName"],
				model: "Client",
			});
			if (!trackingData) {
				this.dbSession.abortTransaction();
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			//remove stakeholder from list
			trackingData.stakeHolders = trackingData.stakeHolders.filter(
				(stakeholder) => {
					if (new ObjectID(stakeholder).toHexString() !== stakeholderId) {
						return stakeholder;
					}
				}
			);
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
				detail: "Tracking abandoned successfuly",
			};
		} catch (ex) {
			this.dbSession.abortTransaction();
			throw ex;
		}
	}

	private async archiveNote(
		trackingId: string,
		ownerId: string
	): Promise<ServiceResultInterface> {
		try {
			//get tracking data
			let trackingData = await ClientNoteSchema.findOne({
				_id: trackingId,
				createdBy: ownerId,
			});
			if (!trackingData) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			trackingData.isArchived = true;
			trackingData.markModified("ClientCommunicationTracking");
			const trackingResponse = await trackingData.save();
			if (!trackingResponse._id) {
				this.dbSession.abortTransaction();
				return {
					code: "notDataModified",
					detail: "Invitation was not revoked",
				};
			}
			return {
				code: "success",
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async unarchiveNote(
		trackingId: string,
		ownerId: string
	): Promise<ServiceResultInterface> {
		try {
			//get tracking data
			let trackingData = await ClientNoteSchema.findOne({
				_id: trackingId,
				createdBy: ownerId,
			});
			if (!trackingData) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			trackingData.isArchived = false;
			trackingData.markModified("ClientCommunicationTracking");
			const trackingResponse = await trackingData.save();
			if (!trackingResponse._id) {
				this.dbSession.abortTransaction();
				return {
					code: "notDataModified",
					detail: "Invitation was not revoked",
				};
			}
			return {
				code: "success",
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async getAll(): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientNoteDocumentInterface[] = await ClientNoteSchema.find()
				.select(this.selectableFields)
				.populate({
					path: "client",
					select: ["idNumber", "companyName", "email"],
				})
				.populate({
					path: "trackingType",
					select: ["value"],
				})
				.populate({
					path: "wayOfEntry",
				})
				.populate({
					path: "clientCommunicationWay",
					select: ["value"],
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

	private async getById(
		id: string,
		sessionUser: string
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientNoteDocumentInterface[] = await ClientNoteSchema.find(
				{
					_id: id,
					$or: [
						{
							createdBy: sessionUser,
						},
						{
							stakeHolders: new ObjectID(sessionUser),
						},
						{
							stakeHolders: sessionUser,
						},
					],
				}
			)
				.select(this.selectableFields.concat(["changesLog"]))
				.populate({
					path: "client",
					select: ["idNumber", "companyName", "email", "phoneNumber"],
				})
				.populate({
					path: "trackingType",
					select: ["value"],
				})
				.populate({
					path: "clientCommunicationWay",
					select: ["value"],
				})
				.populate({
					path: "stakeHolders",
					model: "User",
					select: [
						"_id",
						"firstName",
						"lastName",
						"email",
						"countryCode",
						"phoneNumber",
						"image",
						"about",
						"countryCode",
						"phoneNumber",
						"status",
					],
				})
				.populate({
					path: "createdBy",
					model: "User",
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
				});
			if (!dbResult) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			//get tracking invitations
			const invitations = await ClientCommunicationTrackingInvitationSchema.find(
				{
					communicationTracking: id,
					invitationStatus: TrackingInvitationStatusEnum.requested,
				}
			)
				.select(["stakeholder", "invitationStatus"])
				.populate({
					path: "stakeholder",
					model: "User",
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
				});
			//create stakeholders array
			let stakeholders: any = [];
			stakeholders = stakeholders.concat(
				dbResult[0]
					? (dbResult[0].stakeHolders as any[]).map((stakeholder) => {
							return {
								_id: stakeholder._id.toString(),
								fullName:
									stakeholder.status === UserStatusEnum.created
										? "Usuario no Confirmado"
										: `${stakeholder.firstName} ${stakeholder.lastName}`,
								email: stakeholder.email,
								countryCode: stakeholder.countryCode,
								phoneNumber: stakeholder.phoneNumber,
								image: stakeholder.image,
								about: stakeholder.about,
								status: stakeholder.status,
								invitationStatus: TrackingInvitationStatusEnum.accepted,
							};
					  })
					: []
			);
			stakeholders = stakeholders.concat(
				invitations.map((invitation) => {
					return {
						_id: invitation.stakeholder._id.toString(),
						email: invitation.stakeholder.email,
						fullName:
							invitation.stakeholder.status !== UserStatusEnum.created
								? `${invitation.stakeholder.firstName} ${invitation.stakeholder.lastName}`
								: `Usuario no Confirmado`,
						status: invitation.stakeholder.status,
						image: invitation.stakeholder.image,
						invitationStatus: invitation.invitationStatus,
					};
				})
			);
			//get comments
			let commentsResult: ClientCommunicationTrackingCommentDocumentInterface[] = await ClientCommunicationTrackingCommentSchema.find(
				{ communicationTracking: id }
			)
				.select(this.selectableFields)
				.populate({
					path: "communicationTracking",
				})
				.populate({
					path: "user",
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
			if (!dbResult.length) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			//format user name
			const trackingComments = commentsResult.map((item) => ({
				_id: item._id,
				communicationTracking: item.communicationTracking,
				comments: item.comments,
				createdDate: item.createdDate,
				user: {
					_id: item.user._id,
					fullName: `${item.user.firstName || "Usuario"} ${
						item.user.lastName || "No Confirmado"
					}`,
					email: item.user.email,
					countryCode: item.user.countryCode,
					phoneNumber: item.user.phoneNumber,
					image: item.user.image,
					about: item.user.about,
					status: item.user.status,
				},
			}));

			const returnContactInfo =
				dbResult[0].createdBy._id.toString() === sessionUser ||
				(dbResult[0].stakeholdersConfiguration &&
					dbResult[0].stakeholdersConfiguration.canSeeClientContactsList);
			//make readable changelogs
			let readableChangeLogs: any[] = [];
			readableChangeLogs = (await Promise.all(
				dbResult[0].changesLog.map(async (logItem) => {
					let valueKey = "",
						changeDescription = "";
					const userDataName = await UserSchema.findById(logItem.user).select([
						"firstName",
						"lastName",
					]);
					switch (logItem.valueKey) {
						case "title":
							changeDescription = `${`${userDataName.firstName} ${userDataName.lastName}`} cambió el titulo de ${
								logItem.previusValue
							}" por ${logItem.newValue}"`;
							break;
						case "comments":
							changeDescription = `${`${userDataName.firstName} ${userDataName.lastName}`} cambió comentarios "${
								logItem.previusValue
							}" por "${logItem.newValue}"`;
							break;
						case "stakeholders":
							const userData = await UserSchema.findById(
								logItem.previusValue || logItem.newValue
							).select(["firstName", "lastName", "email"]);
							if (!logItem.previusValue) {
								changeDescription = `${`${userDataName.firstName} ${userDataName.lastName}`} agregó al interesado ${
									userData.firstName || userData.email
								} ${userData.lastName || ""}`;
							}
							if (!logItem.newValue) {
								if (logItem.previusValue === logItem.user) {
									changeDescription = `${`${userDataName.firstName} ${userDataName.lastName}`} ha abandonado el seguimiento.`;
								} else {
									changeDescription = `${`${userDataName.firstName} ${userDataName.lastName}`} eliminó al interesado ${
										userData.firstName || userData.email
									} ${userData.lastName || ""}`;
								}
							}
							break;
						case "audio":
							changeDescription = `${`${userDataName.firstName} ${userDataName.lastName}`} editó el audio de voz`;
							break;
						case "images":
							if (logItem.newValue > logItem.previusValue) {
								changeDescription = `${`${userDataName.firstName} ${userDataName.lastName}`} agregó ${
									logItem.newValue
								} ${
									Number.parseInt(logItem.newValue) > 1
										? "imágenes nuevas"
										: "nueva imagen"
								}`;
							}
							if (logItem.newValue < logItem.previusValue) {
								changeDescription = `${`${userDataName.firstName} ${userDataName.lastName}`} eliminó ${
									Number.parseInt(logItem.previusValue) -
									Number.parseInt(logItem.newValue)
								} ${
									Number.parseInt(logItem.previusValue) -
										Number.parseInt(logItem.newValue) >
									1
										? "imágenes"
										: "imagen"
								}`;
							}
							break;
					}

					return {
						valueKey: logItem.valueKey,
						description: changeDescription,
						date: logItem.modificationDate,
					};
				})
			)) as any;

			readableChangeLogs.unshift({
				valueKey: "creation",
				description: `${dbResult[0].createdBy.firstName} ${dbResult[0].createdBy.lastName} ha creado el registro`,
				date: dbResult[0].createdDate,
			});
			return {
				code: "success",
				detail: {
					_id: dbResult[0]._id,
					trackingType: dbResult[0].noteType,
					client: dbResult[0].client,
					title: dbResult[0].title,
					voiceMediaUrl: dbResult[0].voiceMediaUrl,
					images: dbResult[0].images,
					comments: dbResult[0].comments,
					trackingComments,
					stakeHolders: stakeholders,
					stakeholdersConfiguration: dbResult[0].stakeholdersConfiguration,
					createdBy: dbResult[0].createdBy,
					createdDate: dbResult[0].createdDate,
					changesLog: readableChangeLogs,
					isArchived: dbResult[0].isArchived,
					userRole:
						dbResult[0].createdBy._id.toString() === sessionUser
							? "owner"
							: "stakeholder",
				},
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async search(params: any): Promise<ServiceResultInterface> {
		try {
			//process client params search
			let clientParams: any = {};
			if (params.client) {
				if (params.client.idNumber) {
					clientParams.idNumber = {
						$regex: params.client.idNumber,
						$options: "i",
					};
				}
				if (params.client.companyName) {
					clientParams.companyName = {
						$regex: params.client.companyName,
						$options: "i",
					};
				}
				if (params.client.email) {
					clientParams.email = { $regex: params.client.email, $options: "i" };
				}
			}
			//get clients data
			const clientResult: ClientDocumentInterface[] = await ClientSchema.find(
				clientParams
			);
			let clientIds = clientResult.map((client: ClientModelInterface) => {
				return client._id;
			});

			let paramsResult: any = CommonFunctions.buildQueryParams(
				params.communication
			);
			paramsResult.client = { $in: clientIds };
			//make search
			let dbResult: ClientNoteDocumentInterface[];
			dbResult = await ClientNoteSchema.find(paramsResult)
				.select(this.selectableFields)
				.populate({
					path: "client",
					select: ["idNumber", "companyName", "email"],
				})
				.populate({
					path: "trackingType",
					select: ["value"],
				})
				.populate({
					path: "clientCommunicationWay",
					select: ["value"],
				});
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

	private async getClients(
		sessionUser: string,
		params?: any
	): Promise<ServiceResultInterface> {
		try {
			//process client params search
			let clientParams: any = {};
			if (params.client) {
				if (params.client.idNumber) {
					clientParams.idNumber = {
						$regex: params.client.idNumber,
						$options: "i",
					};
				}
				if (params.client.companyName) {
					clientParams.companyName = {
						$regex: params.client.companyName,
						$options: "i",
					};
				}
				if (params.client.email) {
					clientParams.email = { $regex: params.client.email, $options: "i" };
				}
			}
			//get clients data
			const clientResult: ClientDocumentInterface[] = await ClientSchema.find(
				clientParams
			);
			let clientIds = clientResult.map((client: ClientModelInterface) => {
				return client._id;
			});

			let paramsResult: any = { client: { $in: clientIds } };
			//paramsResult.client = { $in: clientIds };
			paramsResult.$or = [
				{
					createdBy: sessionUser,
				},
				{
					stakeHolders: new ObjectID(sessionUser),
				},
				{
					stakeHolders: sessionUser,
				},
			];
			//make search
			let dbResult: ClientNoteDocumentInterface[];
			dbResult = await ClientNoteSchema.find(paramsResult)
				.select(this.selectableFields)
				.populate({
					path: "client",
					select: [
						"idNumber",
						"companyName",
						"email",
						"phoneNumber",
						"configuration",
						"isActive",
						"createdBy",
					],
					populate: {
						path: "createdBy",
						select: [
							"firstName",
							"lastName",
							"email",
							"countryCode",
							"phoneNumber",
							"image",
							"about",
							"status",
						],
						model: "User",
					},
				});
			if (!dbResult) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			//get clients
			let returningData: any[] = [];
			dbResult.forEach((communicationTracking) => {
				if (!returningData.length) {
					returningData.push(
						this.createTrackingObject(communicationTracking.client, sessionUser)
					);
				} else {
					let clientFound = false;
					returningData.forEach((item) => {
						if (item.clientId === communicationTracking.client._id) {
							clientFound = true;
						}
					});
					if (!clientFound) {
						returningData.push(
							this.createTrackingObject(
								communicationTracking.client,
								sessionUser
							)
						);
					}
				}
			});
			return {
				code: "success",
				detail: returningData,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async notesByClient(
		clientId: string,
		sessionUser: string
	): Promise<ServiceResultInterface> {
		try {
			if (!ObjectID.isValid(clientId)) {
				return {
					code: "notDataFound",
					detail: "Client not found",
				};
			}
			//get client data
			const clientResult: ClientDocumentInterface = await ClientSchema.findById(
				clientId
			).select([
				"idNumber",
				"companyName",
				"email",
				"phoneNumber",
				"contacts",
				"configuration",
				"isActive",
				"createdBy",
			]);
			if (!clientResult) {
				return {
					code: "notDataFound",
					detail: "Client not found",
				};
			}
			//make search
			let dbResult: ClientNoteDocumentInterface[];
			dbResult = await ClientNoteSchema.find({
				client: clientResult._id,
				$or: [
					{
						createdBy: sessionUser,
					},
					{
						stakeHolders: new ObjectID(sessionUser),
					},
					{
						stakeHolders: sessionUser,
					},
				],
			})
				.populate({
					path: "trackingType",
					select: ["value"],
				})
				.populate({
					path: "clientCommunicationWay",
					select: ["value"],
				});

			if (!dbResult) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			//get contact Name
			let contactName = "";
			dbResult.forEach((item) => {
				const returnContactInfo =
					item.createdBy._id.toString() === sessionUser ||
					(item.stakeholdersConfiguration &&
						item.stakeholdersConfiguration.canSeeClientContactsList);
			});
			let idNumber = clientResult.idNumber,
				emailAddress = clientResult.email,
				phoneNumber = clientResult.phoneNumber;
			if (clientResult.createdBy.toString() !== sessionUser) {
				idNumber =
					clientResult.idNumber &&
					clientResult.configuration &&
					clientResult.configuration.canShowIdNumber
						? clientResult.idNumber
						: "Dato Oculto";
				emailAddress =
					clientResult.configuration &&
					clientResult.configuration.canShowEmailAddress
						? clientResult.email
						: "Dato Oculto";
				phoneNumber =
					clientResult.configuration &&
					clientResult.configuration.canShowPhoneNumber
						? clientResult.phoneNumber
						: "Dato Oculto";
			}
			return {
				code: "success",
				detail: {
					client: {
						_id: clientResult._id,
						idNumber: idNumber,
						companyName: clientResult.companyName,
						email: emailAddress,
						phoneNumber: phoneNumber,
						ownClient: clientResult.createdBy.toString() === sessionUser,
					},
					recordHistory: dbResult,
				},
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async uploadFiles(
		files: any
	): Promise<{ audioMediaUrl: string; imagesUrl: string[] }> {
		try {
			//getting audio file from files list
			const audioObj = files.filter((file) => {
				if (file.mimetype.split("/")[0] === "audio") {
					return file;
				}
			})[0];
			//getting images file from files list
			const imgList = files.filter((file) => {
				if (file.mimetype.split("/")[0] === "image") {
					return file;
				}
			});
			//upload files to S3
			let audioMediaUrl = "";
			if (audioObj) {
				audioMediaUrl = await CommonFunctions.fileUploader(
					files[0],
					"voiceNotes"
				);
			}
			let imagesUrl = [];
			if (imgList.length) {
				imagesUrl = await CommonFunctions.filesUploader(
					imgList,
					"trackingImages"
				);
			}
			return {
				audioMediaUrl: audioMediaUrl || null,
				imagesUrl: imagesUrl.length
					? imagesUrl.map((image) => image.location)
					: null,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private createTrackingObject(payload: any, sessionUser: string) {
		let emailAddress = payload.email,
			phoneNumber = payload.phoneNumber;
		if (payload.createdBy._id.toString() !== sessionUser) {
			emailAddress =
				payload.configuration && payload.configuration.canShowEmailAddress
					? payload.email
					: "Dato Oculto";
			phoneNumber =
				payload.configuration && payload.configuration.canShowPhoneNumber
					? payload.phoneNumber
					: "Dato Oculto";
		}
		return {
			clientId: payload._id,
			idNumber: payload.idNumber,
			companyName: payload.companyName,
			email: emailAddress,
			phoneNumber: phoneNumber,
			isActive: payload.isActive,
			createdBy: payload.createdBy,
			about: payload.about,
			ownClient: payload.createdBy._id.toString() === sessionUser,
		};
	}

	private compareRecordChanges(
		previousTracking: ClientNoteModelInterface,
		newTracking: ClientNoteModelInterface
	): ClientTrackingChangesLogModelInterface[] {
		try {
			let changeLogs: ClientTrackingChangesLogModelInterface[] = [];
			//compare general data
			if (previousTracking.title.trim() !== newTracking.title.trim()) {
				changeLogs.push({
					valueKey: "title",
					previusValue: previousTracking.title,
					newValue: newTracking.title,
					user: newTracking.lastModificationUser,
					modificationDate: new Date(),
				});
			}
			if (previousTracking.comments.trim() !== newTracking.comments.trim()) {
				changeLogs.push({
					valueKey: "comments",
					previusValue: previousTracking.comments.trim(),
					newValue: newTracking.comments.trim(),
					user: newTracking.lastModificationUser,
					modificationDate: new Date(),
				});
			}
			//compare images
			if (newTracking.images) {
				const newImgsQtt = newTracking.images ? newTracking.images.length : 0;
				if (previousTracking.images.length !== newImgsQtt) {
					changeLogs.push({
						valueKey: "images",
						previusValue: previousTracking.images.length.toString(),
						newValue: newImgsQtt.toString(),
						user: newTracking.lastModificationUser,
						modificationDate: new Date(),
					});
				}
			}
			//compare stakholders
			//get removed stackholders
			previousTracking.stakeHolders.forEach((previousItem) => {
				let itemFound = false;
				newTracking.stakeHolders.forEach((newItem) => {
					if (previousItem === newItem) {
						itemFound = true;
					}
				});
				if (!itemFound) {
					changeLogs.push({
						valueKey: "stakeholders",
						previusValue: previousItem,
						newValue: "",
						user: newTracking.lastModificationUser,
						modificationDate: new Date(),
					});
				}
			});
			//get added stackholders
			if (newTracking.stakeHolders) {
				newTracking.stakeHolders.forEach((newItem) => {
					let itemFound = false;
					previousTracking.stakeHolders.forEach((previousItem) => {
						if (newItem === previousItem) {
							itemFound = true;
						}
					});
					if (!itemFound) {
						changeLogs.push({
							valueKey: "stakeholders",
							previusValue: "",
							newValue: newItem,
							user: newTracking.lastModificationUser,
							modificationDate: new Date(),
						});
					}
				});
			}
			return changeLogs;
		} catch (ex) {
			throw ex;
		}
	}

	private async prepareUserInvitations(
		peopleToInvite: any[],
		trackingId: string,
		invitedBy: string
	): Promise<ServiceResultInterface> {
		try {
			const createdUserInfo = await UserSchema.findById(invitedBy).select([
				"firstName",
				"lastName",
			]);
			//create new Users
			await Promise.all(
				peopleToInvite.map(async (person) => {
					if (!person._id) {
						const userCreationResult = await this.usersSrv.Create(
							person.email,
							invitedBy
						);
						if (userCreationResult.code !== "success") {
							return;
						}
						//create invitation
						const invitation: ClientCommunicationTrackingInvitationDocumentInterface = new ClientCommunicationTrackingInvitationSchema(
							{
								communicationTracking: trackingId,
								stakeholder: userCreationResult.detail._id,
								invitedby: invitedBy,
								invitationStatus: TrackingInvitationStatusEnum.requested,
							}
						);
						await invitation.save({
							validateBeforeSave: true,
						});
					} else {
						//create invitation for existing user
						const invitation: ClientCommunicationTrackingInvitationDocumentInterface = new ClientCommunicationTrackingInvitationSchema(
							{
								communicationTracking: trackingId,
								stakeholder: person._id,
								invitedby: invitedBy,
								invitationStatus: TrackingInvitationStatusEnum.requested,
							}
						);
						const invitationResult = await invitation.save({
							validateBeforeSave: true,
						});
						//getting user status
						const userStatusResult = await UserSchema.findById(
							person._id
						).select(["email", "firstName", "status"]);
						if (userStatusResult.status === UserStatusEnum.confirmed) {
							//send invitation email
							this.mailSrv.SendInvitationNotification(
								"note",
								userStatusResult.firstName,
								`${createdUserInfo.firstName} ${createdUserInfo.lastName}`,
								invitationResult._id,
								userStatusResult.email
							);
						}
					}
				})
			);
			return {
				code: "",
			};
		} catch (ex) {
			throw ex;
		}
	}
}
