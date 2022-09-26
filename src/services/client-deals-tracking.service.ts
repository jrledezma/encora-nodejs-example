import { inject, injectable } from 'inversify';
import { ObjectID } from 'mongodb';

import {
	ClientDealTrackingDocumentInterface,
	ClientDealTrackingSchema,
	ClientSchema,
	ActionToTakeSchema,
	ClientCommunicationTrackingCommentDocumentInterface,
	ClientCommunicationTrackingCommentSchema,
} from '../models/index';
import { ServiceResultInterface } from '../interfaces/service-result.interface';
import { ClientDealsTrackingServiceInterface } from '../interfaces/services';
import { ClientDealTrackingModelInterface } from '../interfaces/models';
import { CommonFunctions } from '../common';
import { MailService } from './mail.service';
import { ApiTypes } from '../apiTypes';
import { ClientDocumentInterface } from '../models/client.model';
import { ClientModelInterface } from '../interfaces/models/client.model.interface';
import * as session from 'express-session';
import { ClientTrackingChangesLogModelInterface } from '../interfaces/models';
import { ActionToTakeModelInterface } from '../interfaces/models';
import { UserService } from './user.service';
import { TrackingInvitationStatusEnum, UserStatusEnum } from '../enums';
import ClientCommunicationTrackingInvitationSchema from '../models/client-communication-tracking-invitation.model';
import { ClientCommunicationTrackingInvitationDocumentInterface } from '../models/client-communication-tracking-invitation.model';
import { DBGateway } from '../common/db-gateway';
import UserSchema from '../models/user.model';
import {
	ClientDealDocumentInterface,
	ClientDealSchema,
} from '../models/client-deal.model';

let _ = require('lodash');

@injectable()
export class ClientDealsTrackingService implements ClientDealsTrackingServiceInterface {
	//#region public properties

	public Create = this.create;
	public Modify = this.modify;
	public AttendDealAction = this.attendDealAction;
	public ArchiveDeal = this.archiveDeal;
	public UnarchiveDeal = this.unarchiveDeal;
	public GetAll = this.getAll;
	public GetById = this.getById;
	public Search = this.search;
	public TrackingByDeal = this.trackingByDeal;

	//#endregion

	//#region private properties

	private mailSrv: MailService;
	private usersSrv: UserService;
	private dbSession: any = null;

	//#endregion

	private dbDocument: ClientDealTrackingDocumentInterface;
	private selectableFields = [
		'_id',
		'deal',
		'actionToTake',
		'clientContact',
		'scheduleDate',
		'scheduleHour',
		'comments',
		'mediaUrl',
		'teamMemberInCharge',
		'createdBy',
		'createdDate',
		'lastModificationUser',
		'lastModificationDate',
		'isArchived',
	];

	public constructor(
		@inject(ApiTypes.mailService) mailSrv: MailService,
		@inject(ApiTypes.userService) usersSrv: UserService
	) {
		this.mailSrv = mailSrv;
		this.usersSrv = usersSrv;
	}

	private async create(
		objToCreate: ClientDealTrackingModelInterface,
		files?: any
	): Promise<ServiceResultInterface> {
		// start mongoDb transacction
		this.dbSession = await DBGateway.sessionStarted();
		try {
			//upload files to S3
			const imagesUrl = await this.uploadFiles(files);
			//save communication data
			this.dbDocument = new ClientDealTrackingSchema({
				deal: objToCreate.deal,
				actionToTake: objToCreate.actionToTake,
				clientContact: objToCreate.clientContact,
				scheduleDate: objToCreate.scheduleDate,
				scheduleHour: objToCreate.scheduleHour,
				comments: objToCreate.comments,
				mediaUrl: imagesUrl || null,
				teamMemberInCharge: objToCreate.teamMemberInCharge,
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
					code: 'error',
					detail: 'any data was creted',
				};
			}
			this.dbSession.endSession();
			return {
				code: 'success',
				detail: insertResult,
			};
		} catch (ex) {
			this.dbSession.abortTransaction();
			throw ex;
		}
	}

	private async modify(
		objToModify: ClientDealTrackingModelInterface,
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
			let dbResult: ClientDealTrackingDocumentInterface = await ClientDealTrackingSchema.findById(
				objToModify._id
			)
				.populate({
					path: 'stakeHolders',
					model: 'User',
					select: ['email', 'firstName', 'lastName', 'status'],
				})
				.populate('createdBy', ['firstName', 'lastName', 'email'], 'User');
			if (!dbResult) {
				this.dbSession.abortTransaction();
				return {
					code: 'notDataFound',
					detail: 'Data not found for update',
				};
			}
			//upload files to S3
			const { audioMediaUrl } = await this.uploadFiles(files);

			dbResult.actionToTake = objToModify.actionToTake as string;
			dbResult.clientContact = objToModify.clientContact;
			dbResult.comments = objToModify.comments;
			dbResult.mediaUrl = dbResult.mediaUrl;
			dbResult.lastModificationUser = objToModify.lastModificationUser;
			dbResult.isArchived = objToModify.isArchived;
			dbResult.lastModificationDate = new Date();
			dbResult.markModified('ClientDealTrackingSchema');

			const updateResult = await dbResult.save();
			if (updateResult) {
				//ending mongodb session
				this.dbSession.endSession();
				return Promise.resolve({
					code: 'success',
					detail: 'Data updated successfully',
				});
			}

			this.dbSession.abortTransaction();
			return Promise.reject({
				code: 'notDataModified',
				detail: 'Data not updated',
			});
		} catch (ex) {
			this.dbSession.abortTransaction();
			throw ex;
		}
	}

	private async attendDealAction(
		dealTrackingId: string,
		attentionDescription: string,
		userid: string,
		nextAction: ClientDealTrackingModelInterface,
		files?: any[]
	): Promise<ServiceResultInterface> {
		this.dbSession = await DBGateway.sessionStarted();
		this.dbSession.startTransaction();
		try {
			//uploading files to S3
			const imagesUrl = await this.uploadFiles(files);
			//getting clientTracking data
			const trackingData = await ClientDealTrackingSchema.findById(dealTrackingId);
			if (!trackingData) {
				this.dbSession.abortTransaction();
				return {
					code: 'notDataFound',
					detail: 'Cannot find tracking info',
				};
			}
			//validate if the userId can attend the action
			let canAttentdAction = false,
				userIsDealOwner = false;
			if (userid === trackingData.teamMemberInCharge) {
				canAttentdAction = true;
			} else {
				const dealData = await ClientDealSchema.findById(trackingData.deal).select([
					'createdBy',
				]);
				if (!dealData) {
					this.dbSession.abortTransaction();
					return {
						code: 'notDataFound',
						detail: 'Cannot find event info',
					};
				}
				if (userid === dealData.createdBy) {
					canAttentdAction = true;
					userIsDealOwner = true;
				}
			}
			if (!canAttentdAction) {
				this.dbSession.abortTransaction();
				return {
					code: 'error',
					detail: 'user cannot attend the deal tracking action',
				};
			}
			//modify deal tracking record
			trackingData.attentionDate = new Date();
			trackingData.attentionDescription = attentionDescription;
			trackingData.attentedBy = userid;
			trackingData.markModified('ClientDealTrackingSchema');
			await trackingData.save();
			//create new deal tracking
			this.dbDocument = new ClientDealTrackingSchema({
				deal: trackingData._id,
				actionToTake: nextAction.actionToTake,
				clientContact: nextAction.clientContact,
				scheduleDate: nextAction.scheduleDate,
				scheduleHour: nextAction.scheduleHour,
				comments: nextAction.comments,
				mediaUrl: imagesUrl || null,
				teamMemberInCharge: nextAction.teamMemberInCharge,
				createdBy: nextAction.createdBy,
				createdDate: new Date(),
				isArchived: false,
			});
			await this.dbDocument.save({
				validateBeforeSave: true,
			});
			//send email to member in charge or deal owner
			//getting user info for who attends this action
			let attendedUserInfo = await UserSchema.findById(userid).select([
				'firstName',
				'lastName',
				'email',
			]);
			//getting remitend info
			let remitendUserid: string;
			if (!userIsDealOwner) {
				remitendUserid = trackingData.teamMemberInCharge;
			} else {
				//getting deal createdBy
				const deal = await ClientDealSchema.findById(trackingData.deal).select([
					'createdBy',
				]);
				remitendUserid = deal.createdBy;
			}
			let remitendUserInfo = await UserSchema.findById(remitendUserid).select([
				'firstName',
				'lastName',
				'email',
			]);
			this.mailSrv.SendDealActionAttendedMail(
				dealTrackingId,
				remitendUserInfo.firstName,
				remitendUserInfo.email,
				`${attendedUserInfo.firstName} ${attendedUserInfo.lastName}`
			);
			this.dbSession.endSession();
			return {
				code: 'success',
			};
		} catch (ex) {
			this.dbSession.abortTransaction();
			throw ex;
		}
	}

	private async archiveDeal(
		trackingId: string,
		ownerId: string
	): Promise<ServiceResultInterface> {
		try {
			//get tracking data
			let trackingData = await ClientDealTrackingSchema.findOne({
				_id: trackingId,
				createdBy: ownerId,
			});
			if (!trackingData) {
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}
			trackingData.isArchived = true;
			trackingData.markModified('ClientCommunicationTracking');
			const trackingResponse = await trackingData.save();
			if (!trackingResponse._id) {
				this.dbSession.abortTransaction();
				return {
					code: 'notDataModified',
					detail: 'Invitation was not revoked',
				};
			}
			return {
				code: 'success',
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async unarchiveDeal(
		trackingId: string,
		ownerId: string
	): Promise<ServiceResultInterface> {
		try {
			//get tracking data
			let trackingData = await ClientDealTrackingSchema.findOne({
				_id: trackingId,
				createdBy: ownerId,
			});
			if (!trackingData) {
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}
			trackingData.isArchived = false;
			trackingData.markModified('ClientCommunicationTracking');
			const trackingResponse = await trackingData.save();
			if (!trackingResponse._id) {
				this.dbSession.abortTransaction();
				return {
					code: 'notDataModified',
					detail: 'Invitation was not revoked',
				};
			}
			return {
				code: 'success',
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async getAll(): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientDealTrackingDocumentInterface[] = await ClientDealTrackingSchema.find()
				.select(this.selectableFields)
				.populate({
					path: 'client',
					select: ['idNumber', 'companyName', 'email'],
				})
				.populate({
					path: 'trackingType',
					select: ['value'],
				})
				.populate({
					path: 'wayOfEntry',
				})
				.populate({
					path: 'actionToTake',
					select: ['value'],
				})
				.sort({ value: 'asc' });
			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}
			return {
				code: 'success',
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
		console.log(id);
		try {
			let dbResult: ClientDealTrackingDocumentInterface = await ClientDealTrackingSchema.findOne(
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
				.select(this.selectableFields.concat(['changesLog']))
				.populate({
					path: 'deal',
					select: ['referenceCode', 'title', 'comments', 'client', 'teamMembers'],
				})
				.populate({
					path: 'actionToTake',
					select: ['value'],
				})
				.populate({
					path: 'teamMemberInCharge',
					model: 'User',
					select: ['_id', 'firstName', 'lastName', 'email'],
				})
				.populate({
					path: 'createdBy',
					model: 'User',
					select: ['_id', 'firstName', 'lastName', 'email'],
				})
				.populate({
					path: 'lastModificationUser',
					model: 'User',
					select: ['_id', 'firstName', 'lastName', 'email'],
				});
			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}
			//get tracking invitations
			/*const invitations = await ClientCommunicationTrackingInvitationSchema.find(
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
			//get contact info
			let clientContactName = "";
			const contacts = await ClientSchema.find({
				_id: dbResult[0].client._id,
			}).select(["contacts"]);
			contacts[0].contacts.forEach((contact: any) => {
				if (contact.idNumber === dbResult[0].clientContact) {
					clientContactName = `${contact.firstName || "Usuario"} ${
						contact.lastName || "No Confirmado"
					}`;
				}
			});

			const returnContactInfo =
				dbResult[0].createdBy._id.toString() === sessionUser ||
				(dbResult[0].stakeholdersConfiguration &&
					dbResult[0].stakeholdersConfiguration.canSeeClientContactsList);
			//make readable changelogs
			let readableChangeLogs: any[] = [];
			const clientContacts = await ClientSchema.findById(
				dbResult[0].client
			).select(["contacts"]);
			let communicationWays: actionToTakeModelInterface[] = [];
			readableChangeLogs = (await Promise.all(
				dbResult[0].changesLog.map(async (logItem) => {
					let valueKey = "",
						changeDescription = "";
					const userDataName = await UserSchema.findById(logItem.user).select([
						"firstName",
						"lastName",
					]);
					switch (logItem.valueKey) {
						case "clientContact":
							let previousContact = "",
								newContact = "";
							valueKey = "clientContact";
							clientContacts.contacts.forEach((contact) => {
								if (contact.idNumber === logItem.previusValue) {
									previousContact = `${contact.firstName} ${contact.lastName}`;
								}
								if (contact.idNumber === logItem.newValue) {
									newContact = `${contact.firstName} ${contact.lastName}`;
								}
							});
							changeDescription = `${`${userDataName.firstName} ${userDataName.lastName}`} cambió contacto ${
								returnContactInfo ? previousContact : "' Dato Oculto '"
							} por ${returnContactInfo ? newContact : "' Dato Oculto '"}`;
							break;
						case "actionToTake":
							if (!communicationWays.length) {
								communicationWays = await actionToTakeSchema.find();
							}
							let previousCommunicationWay = "",
								newCommunicationWay = "";
							communicationWays.forEach((item) => {
								if (item._id === logItem.previusValue) {
									previousCommunicationWay = `${item.value}`;
								}
								if (item._id === logItem.newValue) {
									newCommunicationWay = `${item.value}`;
								}
							});

							changeDescription = `${`${userDataName.firstName} ${userDataName.lastName}`} cambió medio de comunicación ${
								returnContactInfo ? previousCommunicationWay : "' Dato Oculto '"
							} por ${
								returnContactInfo ? newCommunicationWay : "' Dato Oculto '"
							}`;
							break;
						case "communicationDate":
							changeDescription = `${`${userDataName.firstName} ${userDataName.lastName}`} cambió fecha de comunicación ${
								returnContactInfo ? logItem.previusValue : "' Dato Oculto '"
							} por ${
								returnContactInfo ? logItem.newValue : "' Dato Oculto '"
							}`;
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
								if(logItem.previusValue === logItem.user){
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
					trackingType: dbResult[0].trackingType,
					client: dbResult[0].client,
					clientContact: returnContactInfo
						? {
								idNumber: dbResult[0].clientContact,
								fullName: clientContactName,
						  }
						: {
								idNumber: null,
								fullName: "Dato Oculto",
						  },
					actionToTake: dbResult[0].actionToTake,
					communicationDate: dbResult[0].communicationDate,
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
			};*/

			//get client contact
			const clientInfo = await ClientSchema.findById(dbResult.deal.client).select([
				'contacts',
			]);
			let dealTracking: any = {
				_id: dbResult._id,
				deal: dbResult.deal,
				actionToTake: dbResult.actionToTake,
				clientContact: '',
				scheduleDate: dbResult.scheduleDate,
				scheduleHour: dbResult.scheduleHour,
				comments: dbResult.comments,
				mediaUrl: dbResult.mediaUrl,
				teamMemberInCharge: dbResult.teamMemberInCharge,
				createdBy: dbResult.createdBy,
				createdDate: dbResult.createdDate,
				lastModificationUser: dbResult.lastModificationUser,
				lastModificationDate: dbResult.lastModificationDate,
				isArchived: dbResult.isArchived,
			};
			clientInfo.contacts.forEach((contact) => {
				if (contact.idNumber === dbResult.clientContact) {
					dealTracking.clientContact = {
						idNumber: dbResult.clientContact,
						fullName: `${contact.firstName} ${contact.lastName}`,
						email: contact.email,
						cellPhone: contact.cellPhone,
					};
				}
			});

			return {
				code: 'success',
				detail: dealTracking,
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
						$options: 'i',
					};
				}
				if (params.client.companyName) {
					clientParams.companyName = {
						$regex: params.client.companyName,
						$options: 'i',
					};
				}
				if (params.client.email) {
					clientParams.email = { $regex: params.client.email, $options: 'i' };
				}
			}
			//get clients data
			const clientResult: ClientDocumentInterface[] = await ClientSchema.find(
				clientParams
			);
			let clientIds = clientResult.map((client: ClientModelInterface) => {
				return client._id;
			});

			let paramsResult: any = CommonFunctions.buildQueryParams(params.communication);
			paramsResult.client = { $in: clientIds };
			//make search
			let dbResult: ClientDealTrackingDocumentInterface[];
			dbResult = await ClientDealTrackingSchema.find(paramsResult)
				.select(this.selectableFields)
				.populate({
					path: 'client',
					select: ['idNumber', 'companyName', 'email'],
				})
				.populate({
					path: 'trackingType',
					select: ['value'],
				})
				.populate({
					path: 'actionToTake',
					select: ['value'],
				});
			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}
			return {
				code: 'success',
				detail: dbResult,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async trackingByDeal(
		dealId: string,
		sessionUser: string
	): Promise<ServiceResultInterface> {
		try {
			if (!ObjectID.isValid(dealId)) {
				return {
					code: 'notDataFound',
					detail: 'Client not found',
				};
			}
			//get client data
			const dealResult: ClientDealDocumentInterface = await ClientDealSchema.findById(
				dealId
			).select([
				'idNumber',
				'companyName',
				'email',
				'phoneNumber',
				'contacts',
				'configuration',
				'isActive',
				'createdBy',
			]);
			if (!dealResult) {
				return {
					code: 'notDataFound',
					detail: 'Client not found',
				};
			}
			//make search
			let dbResult: ClientDealTrackingDocumentInterface[];
			dbResult = await ClientDealTrackingSchema.find({
				client: dealResult._id,
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
					path: 'trackingType',
					select: ['value'],
				})
				.populate({
					path: 'actionToTake',
					select: ['value'],
				});

			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}
			//get contact Name
			let contactName = '';
			/*
			dbResult.forEach((item) => {
				const returnContactInfo =
					item.createdBy._id.toString() === sessionUser ||
					(item.stakeholdersConfiguration &&
						item.stakeholdersConfiguration.canSeeClientContactsList);
				clientResult.contacts.forEach((contact) => {
					if (contact.idNumber === item.clientContact) {
						item.clientContact = returnContactInfo
							? `${contact.firstName} ${contact.lastName}`
							: "Dato Oculto";
					}
				});
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
			*/
			return {
				code: 'success',
				detail: {},
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
				if (file.mimetype.split('/')[0] === 'audio') {
					return file;
				}
			})[0];
			//getting images file from files list
			const imgList = files.filter((file) => {
				if (file.mimetype.split('/')[0] === 'image') {
					return file;
				}
			});
			//upload files to S3
			let audioMediaUrl = '';
			if (audioObj) {
				audioMediaUrl = await CommonFunctions.fileUploader(files[0], 'voiceNotes');
			}
			let imagesUrl = [];
			if (imgList.length) {
				imagesUrl = await CommonFunctions.filesUploader(imgList, 'trackingImages');
			}
			return {
				audioMediaUrl: audioMediaUrl || null,
				imagesUrl: imagesUrl.length ? imagesUrl.map((image) => image.location) : null,
			};
		} catch (ex) {
			throw ex;
		}
	}
}
