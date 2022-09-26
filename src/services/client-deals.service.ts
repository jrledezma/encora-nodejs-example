import { inject, injectable } from 'inversify';
import { ObjectID } from 'mongodb';

import { ApiTypes } from '../apiTypes';
import {
	ClientCommunicationTrackingInvitationDocumentInterface,
	ClientCommunicationTrackingInvitationSchema,
	ClientDealDocumentInterface,
	ClientDealSchema,
	ClientDealTrackingDocumentInterface,
	ClientDealTrackingSchema,
	ClientDocumentInterface,
	ClientSchema,
	UserSchema,
} from '../models/index';
import {
	ClientDealModelInterface,
	ClientDealTrackingModelInterface,
	ClientModelInterface,
} from '../interfaces/models';
import { ClientDealsServiceInterface } from '../interfaces/services';
import { CommonFunctions } from '../common';
import { DBGateway } from '../common/db-gateway';
import { MailService } from './mail.service';
import { ServiceResultInterface } from '../interfaces/service-result.interface';
import { TrackingInvitationStatusEnum, UserStatusEnum } from '../enums';
import { UserService } from './user.service';

let _ = require('lodash');

@injectable()
export class ClientDealsService implements ClientDealsServiceInterface {
	//#region public properties

	public Create = this.create;
	public Modify = this.modify;
	public LeaveDeal = this.leaveDeal;
	public ArchiveDeal = this.archiveDeal;
	public UnarchiveDeal = this.unarchiveDeal;
	public GetAll = this.getAll;
	public GetById = this.getById;
	public Search = this.search;
	public GetClients = this.getClients;
	public DealsByClient = this.dealsByClient;
	public ValidateReferenceCode = this.validateReferenceCode;

	//#endregion

	//#region private properties

	private mailSrv: MailService;
	private dbSession: any = null;
	private usersSrv: UserService;

	//#endregion

	private dbDocument: ClientDealDocumentInterface;
	private selectableFields = [
		'_id',
		'referenceCode',
		'client',
		'title',
		'mediaUrl',
		'comments',
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
		clientDealObject: any,
		clientDealTrackingObject: any,
		peopleToInvite?: any[],
		files?: any
	): Promise<ServiceResultInterface> {
		// start mongoDb transacction
		this.dbSession = await DBGateway.sessionStarted();
		this.dbSession.startTransaction();
		try {
			//upload files to S3
			const mediaUrls = files ? await this.uploadFiles(files) : null;
			//save communication data
			//console.log('objToCreate =>', objToCreate);
			this.dbDocument = new ClientDealSchema({
				client: clientDealObject.client,
				referenceCode: clientDealObject.referenceCode,
				title: clientDealObject.title,
				mediaUrls: mediaUrls,
				comments: clientDealObject.comments,
				teamMembers: clientDealObject.teamMembers,
				createdBy: clientDealObject.createdBy,
				createdDate: new Date(),
				isArchived: false,
			});
			const clientDealResult = await this.dbDocument.save({
				validateBeforeSave: true,
			});
			if (!clientDealResult) {
				this.dbSession.abortTransaction();
				return {
					code: 'error',
					detail: 'any data was created',
				};
			}
			console.log(clientDealTrackingObject);
			const dealTrackingDocument: ClientDealTrackingDocumentInterface = new ClientDealTrackingSchema(
				{
					deal: clientDealResult._id,
					actionToTake: clientDealTrackingObject.actionToTake,
					clientContact: clientDealTrackingObject.clientContact,
					scheduleDate: clientDealTrackingObject.scheduleDate,
					scheduleHour: clientDealTrackingObject.scheduleHour,
					title: clientDealTrackingObject.trackingTitle,
					comments: clientDealTrackingObject.trackingComments,
					mediaUrl: null,
					teamMemberInCharge:
						clientDealTrackingObject.teamMemberInCharge || clientDealObject.createdBy,
					createdBy: clientDealObject.createdBy,
					createdDate: new Date(),
					isArchived: false,
				}
			);
			const dealTrackingResult = await dealTrackingDocument.save();
			//invite new users or team members
			if (peopleToInvite) {
				await this.prepareUserInvitations(
					peopleToInvite,
					clientDealResult._id,
					clientDealObject.createdBy
				);
			}
			this.dbSession.endSession();
			return {
				code: 'success',
				detail: { clientDeal: clientDealResult, clientDealTracking: dealTrackingResult },
			};
		} catch (ex) {
			this.dbSession.abortTransaction();
			throw ex;
		}
	}

	private async modify(
		objToModify: ClientDealModelInterface,
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
			let dbResult: ClientDealDocumentInterface = await ClientDealSchema.findById(
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
			const mediaUrls = await this.uploadFiles(files);
			//remove stakeholders
			if (stakeholdersToRevokeInvitations) {
				stakeholdersToRevokeInvitations.forEach((temMemberToRemove) => {
					objToModify.teamMembers = dbResult.teamMembers.filter((temMember) => {
						if ((temMember as any)._id.toString() !== temMemberToRemove) {
							return temMember;
						}
					});
				});
			}

			if (!objToModify.teamMembers) {
				objToModify.teamMembers = dbResult.teamMembers;
			}
			(dbResult.mediaUrls = dbResult.mediaUrls
				? dbResult.mediaUrls.concat(mediaUrls)
				: mediaUrls),
				(dbResult.teamMembers = objToModify.teamMembers as string[]);
			dbResult.title = objToModify.title;
			dbResult.comments = objToModify.comments;
			dbResult.lastModificationUser = objToModify.lastModificationUser;
			dbResult.isArchived = objToModify.isArchived;
			dbResult.lastModificationDate = new Date();
			dbResult.markModified('ClientDealSchema');

			const updateResult = await dbResult.save();
			if (updateResult) {
				//create stakeHolders array
				let stakeHoldersList: any[] = [];
				if (objToModify.teamMembers && objToModify.teamMembers.length) {
					stakeHoldersList = (objToModify.teamMembers as any[]).map(
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

	private async leaveDeal(
		trackingId: string,
		temMemberId: string
	): Promise<ServiceResultInterface> {
		// start mongoDb transacction
		this.dbSession = await DBGateway.sessionStarted();
		try {
			//get invitation associated to the tracking and stakeholder
			let invitationResult = await ClientCommunicationTrackingInvitationSchema.findOne({
				communicationTracking: trackingId,
				temMember: temMemberId,
				invitationStatus: TrackingInvitationStatusEnum.accepted,
			})
				.populate({
					path: 'invitedby',
					model: 'User',
					select: ['_id', 'firstName', 'lastName', 'email'],
				})
				.populate({
					path: 'temMember',
					model: 'User',
					select: ['_id', 'firstName', 'email'],
				})
				.populate({
					path: 'communicationTracking',
					model: 'ClientCommunicationTracking',
					populate: [
						{
							path: 'client',
							model: 'Client',
							select: ['companyName'],
						},
						{
							path: 'createdBy',
							model: 'User',
							select: ['_id', 'firstName', 'lastName', 'email'],
						},
					],
				});
			if (!invitationResult) {
				this.dbSession.abortTransaction();
				return {
					code: 'notDataModified',
					detail: 'Invitation data not found',
				};
			}
			invitationResult.invitationStatus = TrackingInvitationStatusEnum.stakeholderLeaves;
			invitationResult.statusDateChanged = new Date();
			invitationResult.markModified('ClientCommunicationTrackingInvitation');
			const invitationStatusResponse = await invitationResult.save();
			if (!invitationStatusResponse._id) {
				return {
					code: 'notDataModified',
					detail: 'tracking was not leaved',
				};
			}
			//get clientCommunicationTracking
			let trackingData = await ClientDealSchema.findById(
				invitationResult.communicationTracking._id
			).populate({
				path: 'client',
				select: ['companyName'],
				model: 'Client',
			});
			if (!trackingData) {
				this.dbSession.abortTransaction();
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}
			//remove stakeholder from list
			trackingData.teamMembers = trackingData.teamMembers.filter((temMember) => {
				if (new ObjectID(temMember).toHexString() !== temMemberId) {
					return temMember;
				}
			});
			//save data
			trackingData.markModified('ClientCommunicationTracking');
			const trackingResponse = await trackingData.save();
			if (!trackingResponse._id) {
				this.dbSession.abortTransaction();
				return {
					code: 'notDataModified',
					detail: 'Invitation was not revoked',
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
				code: 'success',
				detail: 'Tracking abandoned successfuly',
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
			let trackingData = await ClientDealSchema.findOne({
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
			let trackingData = await ClientDealSchema.findOne({
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
			return {
				code: 'success',
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
			console.log(id, sessionUser);
			let dbResult: ClientDealDocumentInterface = await ClientDealSchema.findOne({
				_id: id,
				$or: [
					{
						createdBy: sessionUser,
					},
					{
						teamMembers: { $in: [new ObjectID(sessionUser)] },
					},
				],
			})
				.select(this.selectableFields.concat(['changesLog']))
				.populate({
					path: 'client',
					select: ['idNumber', 'companyName', 'email', 'phoneNumber', 'contacts'],
				})
				.populate({
					path: 'trackingType',
					select: ['value'],
				})
				.populate({
					path: 'actionToTake',
					select: ['value'],
				})
				.populate({
					path: 'stakeHolders',
					model: 'User',
					select: [
						'_id',
						'firstName',
						'lastName',
						'email',
						'countryCode',
						'phoneNumber',
						'image',
						'about',
						'countryCode',
						'phoneNumber',
						'status',
					],
				})
				.populate({
					path: 'createdBy',
					model: 'User',
					select: [
						'_id',
						'firstName',
						'lastName',
						'email',
						'countryCode',
						'phoneNumber',
						'image',
						'about',
						'status',
					],
				});
			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}
			//get tracking invitations
			const invitations = await ClientCommunicationTrackingInvitationSchema.find({
				communicationTracking: id,
				invitationStatus: TrackingInvitationStatusEnum.requested,
			})
				.select(['stakeholder', 'invitationStatus'])
				.populate({
					path: 'stakeholder',
					model: 'User',
					select: [
						'_id',
						'firstName',
						'lastName',
						'email',
						'countryCode',
						'phoneNumber',
						'image',
						'about',
						'status',
					],
				});
			//create teamMembers array
			let teamMembers: any[] = [];
			if (dbResult.teamMembers && dbResult.teamMembers.length) {
				teamMembers = teamMembers.concat(
					dbResult
						? (dbResult.teamMembers as any[]).map((stakeholder) => {
								return {
									_id: stakeholder._id.toString(),
									fullName:
										stakeholder.status === UserStatusEnum.created
											? 'Usuario no Confirmado'
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
				teamMembers = teamMembers.concat(
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
			}
			//getting deal tracking
			let dealTrackingDetail = await ClientDealTrackingSchema.find({
				deal: id,
			})
				.populate({
					path: 'actionToTake',
					select: ['value', 'description'],
					model: 'ActionToTake',
				})
				.populate({
					path: 'teamMemberInCharge',
					select: ['email', 'firstName', 'lastName'],
					model: 'User',
				});
			//getting client contacts for each deal tracking
			const fomatedTracking = dealTrackingDetail.map((item: any) => {
				let clientContactFullName = '';
				(dbResult.client.contacts as any[]).forEach((contact) => {
					if (contact.idNumber === item.clientContact) {
						clientContactFullName = `${contact.firstName} ${contact.lastName}`;
					}
				});
				const {
					_id,
					deal,
					actionToTake,
					scheduleDate,
					scheduleHour,
					clientContact,
					comments,
					mediaUrl,
					teamMemberInCharge,
					createdBy,
					createdDate,
					lastModificationUser,
					lastModificationDate,
					isArchived,
				} = item as ClientDealTrackingModelInterface;
				return {
					_id,
					deal,
					actionToTake,
					scheduleDate,
					scheduleHour,
					clientContact: {
						idNumber: clientContact,
						fullName: clientContactFullName,
					},
					comments,
					mediaUrl,
					teamMemberInCharge,
					createdBy,
					createdDate,
					lastModificationUser,
					lastModificationDate,
					isArchived,
				};
			});

			return {
				code: 'success',
				detail: {
					dealData: {
						_id: dbResult._id,
						referenceCode: dbResult.referenceCode,
						client: dbResult.client,
						title: dbResult.title,
						comments: dbResult.comments,
						teamMembers: teamMembers,
						createdBy: dbResult.createdBy,
						createdDate: dbResult.createdDate,
						isArchived: dbResult.isArchived,
						userRole:
							dbResult.createdBy._id.toString() === sessionUser ? 'owner' : 'stakeholder',
					},
					dealTrackingDetail: fomatedTracking,
				},
			};
		} catch (ex) {
			console.log(ex);
			throw ex;
		}
	}

	private async validateReferenceCode(
		referenceCode: string,
		userId: string
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientDealDocumentInterface = await ClientDealSchema.findOne({
				referenceCode: {
					$regex: RegExp(`^${referenceCode.trim().toLocaleLowerCase()}$`, 'i'),
				},
				createdBy: userId,
			});
			if (!dbResult) {
				return {
					code: 'success',
					detail: 'Data not found',
				};
			}
			return {
				code: 'valueAlreadyCreated',
				detail: dbResult,
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
			let dbResult: ClientDealDocumentInterface[];
			dbResult = await ClientDealSchema.find(paramsResult)
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

	private async getClients(
		sessionUser: string,
		params?: any
	): Promise<ServiceResultInterface> {
		try {
			//make search
			let dbResult: ClientDealDocumentInterface[] = await ClientDealSchema.find({
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
				.select(this.selectableFields)
				.populate({
					path: 'client',
					select: [
						'idNumber',
						'companyName',
						'email',
						'phoneNumber',
						'comments',
						'contacts',
						'isActive',
					],
				})
				.populate({
					path: 'createdBy',
					select: ['firstName', 'lastName', 'email', 'isActive'],
				});
			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}
			//getting deal trackings
			const dealIds = dbResult.map((deal) => deal._id);
			const nextActions = await ClientDealTrackingSchema.find({
				deal: { $in: dealIds },
			})
				.select(['deal', 'scheduleDate', 'scheduleHour'])
				.sort({ _id: -1 });
			console.log(nextActions);
			//creating clients array
			const clients: any[] = [];
			dbResult.forEach((deal) => {
				let addClient = true;
				if (params.client && (params.client.email || params.client.companyName)) {
					if (params.client.email && params.client.companyName) {
						if (
							!deal.client.email.toLowerCase().includes(params.client.email) &&
							!deal.client.companyName.toLowerCase().includes(params.client.companyName)
						) {
							addClient = false;
						}
					} else {
						if (
							!params.client.email &&
							!deal.client.companyName.toLowerCase().includes(params.client.companyName)
						) {
							addClient = false;
						}
						if (
							!params.client.companyName &&
							!deal.client.idNumber.toLowerCase().includes(params.client.email)
						) {
							addClient = false;
						}
					}
				}
				if (addClient) {
					if (!clients.length) {
						clients.push(deal.client);
					} else {
						let clientFound = false;
						clients.forEach((client) => {
							if (client._id === deal.client._id) {
								clientFound = true;
							}
						});
						if (!clientFound) {
							clients.push(deal.client);
						}
					}
				}
			});

			//get clients
			let returningData: any[] = [];
			clients.map((clientItem) => {
				returningData.push({
					_id: clientItem._id,
					idNumber: clientItem.idNumber,
					companyName: clientItem.companyName,
					email: clientItem.email,
					phoneNumber: clientItem.phoneNumber,
					address: clientItem.address,
					comments: clientItem.comments,
					contacts: clientItem.contacts,
					isActive: clientItem.isActive,
					deals: dbResult
						.filter((dealItem) => {
							if (clientItem._id === dealItem.client._id) {
								return dealItem;
							}
						})
						.map((dealItem) => {
							let nextActionToTake: any = {};
							nextActions.forEach((nextAction) => {
								if (nextAction.deal.toString() === dealItem._id.toString()) {
									nextActionToTake = {
										_id: nextAction._id,
										scheduleDate: nextAction.scheduleDate,
										scheduleHour: nextAction.scheduleHour,
									};
								}
							});
							return {
								_id: dealItem._id,
								client: dealItem.client._id,
								referenceCode: dealItem.referenceCode,
								title: dealItem.title,
								comments: dealItem.comments,
								mediaUrls: dealItem.mediaUrls,
								teamMembers: dealItem.teamMembers,
								nextActionToTake: nextActionToTake,
								createdBy: dealItem.createdBy,
								createdDate: dealItem.createdDate,
								isArchived: dealItem.isArchived,
							};
						}),
				});
			});

			return {
				code: 'success',
				detail: returningData,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async dealsByClient(
		clientId: string,
		sessionUser: string
	): Promise<ServiceResultInterface> {
		try {
			if (!ObjectID.isValid(clientId)) {
				return {
					code: 'notDataFound',
					detail: 'Client not found',
				};
			}
			//get client data
			const clientResult: ClientDocumentInterface = await ClientSchema.findById(
				clientId
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
			if (!clientResult) {
				return {
					code: 'notDataFound',
					detail: 'Client not found',
				};
			}
			//make search
			let dbResult: ClientDealDocumentInterface[];
			dbResult = await ClientDealSchema.find({
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
					path: 'trackingType',
					select: ['value'],
				})
				.populate({
					path: 'clientCommunicationWay',
					select: ['value'],
				});

			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}
			let idNumber = clientResult.idNumber,
				emailAddress = clientResult.email,
				phoneNumber = clientResult.phoneNumber;
			if (clientResult.createdBy.toString() !== sessionUser) {
				idNumber =
					clientResult.idNumber &&
					clientResult.configuration &&
					clientResult.configuration.canShowIdNumber
						? clientResult.idNumber
						: 'Dato Oculto';
				emailAddress =
					clientResult.configuration && clientResult.configuration.canShowEmailAddress
						? clientResult.email
						: 'Dato Oculto';
				phoneNumber =
					clientResult.configuration && clientResult.configuration.canShowPhoneNumber
						? clientResult.phoneNumber
						: 'Dato Oculto';
			}
			return {
				code: 'success',
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

	private async uploadFiles(files: any): Promise<string[]> {
		try {
			//getting audio file from files list
			const audiosList = files.filter((file) => {
				if (file.mimetype.split('/')[0] === 'audio') {
					return file;
				}
			})[0];
			const docsList = files.filter((file) => {
				if (
					file.mimetype.split('/')[0] === 'application' ||
					file.mimetype.split('/')[0] === 'text'
				) {
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
			let mediaUrls: string[] = [];
			if (audiosList.length) {
				mediaUrls.concat(
					await CommonFunctions.filesUploader(audiosList, 'dealsVoiceNotes')
				);
			}
			if (docsList.length) {
				mediaUrls.concat(await CommonFunctions.filesUploader(docsList, 'dealsDocuments'));
			}
			if (imgList.length) {
				mediaUrls.concat(await CommonFunctions.filesUploader(imgList, 'dealsImages'));
			}
			return mediaUrls;
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
					: 'Dato Oculto';
			phoneNumber =
				payload.configuration && payload.configuration.canShowPhoneNumber
					? payload.phoneNumber
					: 'Dato Oculto';
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

	private async prepareUserInvitations(
		peopleToInvite: any[],
		trackingId: string,
		invitedBy: string
	): Promise<ServiceResultInterface> {
		try {
			const createdUserInfo = await UserSchema.findById(invitedBy).select([
				'firstName',
				'lastName',
			]);
			//create new Users
			await Promise.all(
				peopleToInvite.map(async (person) => {
					if (!person._id) {
						const userCreationResult = await this.usersSrv.Create(
							person.email,
							invitedBy
						);
						if (userCreationResult.code !== 'success') {
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
						const userStatusResult = await UserSchema.findById(person._id).select([
							'email',
							'firstName',
							'status',
						]);
						if (userStatusResult.status === UserStatusEnum.confirmed) {
							//send invitation email
							this.mailSrv.SendInvitationNotification(
								'dealTracking',
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
				code: '',
			};
		} catch (ex) {
			throw ex;
		}
	}
}
