import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
	controller,
	interfaces,
	httpGet,
	httpPost,
	httpPut,
} from 'inversify-express-utils';
import * as jwt_decode from 'jwt-decode';

import { ApiTypes } from '../apiTypes';
import { ConstantValues } from '../constantValues';
import { ClientDealsTrackingService } from '../services';
import { ServiceResultInterface } from '../interfaces/service-result.interface';
import { ClientDealTrackingModelInterface } from '../interfaces/models';

@controller(ConstantValues.clientdealstracking)
export class ClientDealsTrackingController implements interfaces.Controller {
	private communicationTrackingSrv: ClientDealsTrackingService;

	public constructor(
		@inject(ApiTypes.clientDealsTrackingService)
		communicationTrackingSrv: ClientDealsTrackingService
	) {
		this.communicationTrackingSrv = communicationTrackingSrv;
	}

	@httpPost('/')
	public async Create(req: Request, res: Response): Promise<void> {
		try {
			const newTracking: any = this.createObjectoFromFormData(req.body);
			newTracking.workingObj.createdBy = (jwt_decode(
				req.headers['authorization']
			) as any).user;
			await this.communicationTrackingSrv
				.Create(newTracking.workingObj as ClientDealTrackingModelInterface, req.files)
				.then((serviceResult: ServiceResultInterface) => {
					if (!serviceResult) {
						res.status(200).send({
							code: 'requestNotProcessed',
							detail: 'Any data was saved',
						});
					} else {
						let statusCode: number = 500;
						if (serviceResult.code !== 'error') {
							statusCode = 200;
						}
						res.status(statusCode).send(serviceResult);
					}
				})
				.catch((reason: any) => {
					res.status(500).send(reason);
				});
		} catch (ex) {
			res.status(500).send(ex);
		}
	}

	@httpPut('/')
	public async Modify(req: Request, res: Response): Promise<void> {
		try {
			const tracking: any = this.createObjectoFromFormData(req.body);
			tracking.workingObj.lastModificationUser = (jwt_decode(
				req.headers['authorization']
			) as any).user;
			const serviceResult = await this.communicationTrackingSrv.Modify(
				tracking.workingObj as ClientDealTrackingModelInterface,
				tracking.peopleToInvite,
				tracking.stakeholdersToRevokeInvitations,
				req.files
			);
			if (!serviceResult) {
				res.status(200).send({
					code: 'requestNotProcessed',
					detail: 'Any data was saved',
				});
			} else {
				let statusCode: number = 500;
				if (serviceResult.code !== 'error') {
					statusCode = 200;
				}
				res.status(statusCode).send(serviceResult);
			}
		} catch (ex) {
			console.log(ex);
			res.status(500).json(ex);
		}
	}

	@httpPut('/attendaction/:trackingId')
	public async AttendAction(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers['authorization']) as any).user;
			console.log(req.body);
			console.log(
				req.params.trakingId,
				req.body.attentionDescription,
				userId,
				this.createObjectoFromFormData(req.body.newDealTrackingObj)
			);
			const serviceResult = await this.communicationTrackingSrv.AttendDealAction(
				req.params.trakingId,
				req.body.attentionDescription,
				userId,
				this.createObjectoFromFormData(req.body.newDealTrackingObj)
			);
			if (!serviceResult) {
				res.status(200).send({
					code: 'requestNotProcessed',
					detail: 'Any data was saved',
				});
			} else {
				let statusCode: number = 500;
				if (serviceResult.code !== 'error') {
					statusCode = 200;
				}
				res.status(statusCode).send(serviceResult);
			}
		} catch (ex) {
			console.log(ex);
			res.status(500).json(ex);
		}
	}

	@httpPut('/archive')
	public async Archive(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers['authorization']) as any).user;
			const serviceResult = await this.communicationTrackingSrv.ArchiveDeal(
				req.body.trackingId,
				userId
			);
			if (!serviceResult) {
				res.status(200).send({
					code: 'requestNotProcessed',
					detail: 'Any data was saved',
				});
			} else {
				let statusCode: number = 500;
				if (serviceResult.code !== 'error') {
					statusCode = 200;
				}
				res.status(statusCode).send(serviceResult);
			}
		} catch (ex) {
			console.log(ex);
			res.status(500).json(ex);
		}
	}

	@httpPut('/unarchive')
	public async Unarchive(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers['authorization']) as any).user;
			const serviceResult = await this.communicationTrackingSrv.UnarchiveDeal(
				req.body.trackingId,
				userId
			);
			if (!serviceResult) {
				res.status(200).send({
					code: 'requestNotProcessed',
					detail: 'Any data was saved',
				});
			} else {
				let statusCode: number = 500;
				if (serviceResult.code !== 'error') {
					statusCode = 200;
				}
				res.status(statusCode).send(serviceResult);
			}
		} catch (ex) {
			console.log(ex);
			res.status(500).json(ex);
		}
	}

	@httpGet('/byid/:id')
	public async GetById(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult = await this.communicationTrackingSrv.GetById(
				req.params.id,
				(jwt_decode(req.headers['authorization']) as any).user
			);
			if (!serviceResult) {
				res.status(200).send({
					code: 'requestNotProcessed',
					detail: 'Any data was found',
				});
			} else {
				let statusCode: number = 500;
				if (serviceResult.code !== 'error') {
					statusCode = 200;
				}
				res.status(statusCode).send(serviceResult);
			}
		} catch (ex) {
			res.status(500).json(ex);
		}
	}

	@httpPost('/search')
	public async Search(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.communicationTrackingSrv.Search(
				req.body
			);
			if (!serviceResult) {
				res.status(200).send({
					code: 'requestNotProcessed',
					detail: 'Any data was found',
				});
			} else {
				let statusCode: number = 500;
				if (serviceResult.code !== 'error') {
					statusCode = 200;
				}
				res.status(statusCode).send(serviceResult);
			}
		} catch (ex) {
			res.status(500).json(ex);
		}
	}

	private createObjectoFromFormData(objToFilter: any): any {
		console.log(objToFilter);
		const mediaUrl = objToFilter.images ? JSON.parse(objToFilter.mediaUrl) : null,
			comments: String = objToFilter.comments.substr(1, objToFilter.comments.length - 2),
			stakeholdersToRevokeInvitations = objToFilter.stakeholdersToRevokeInvitations;
		return {
			workingObj: {
				_id: objToFilter._id
					? objToFilter._id.substr(1, objToFilter._id.length - 2)
					: null,
				deal: objToFilter.client.substr(1, objToFilter.deal.length - 2),
				clientCommunicationWay: objToFilter.clientCommunicationWay.substr(
					1,
					objToFilter.clientCommunicationWay.length - 2
				),
				scheduleDate: objToFilter.clientCommunicationWay.substr(
					1,
					objToFilter.scheduleDate.length - 2
				),
				scheduleHour: objToFilter.clientCommunicationWay.substr(
					1,
					objToFilter.scheduleHour.length - 2
				),
				clientContact: objToFilter.clientContact.substr(
					1,
					objToFilter.clientContact.length - 2
				),
				isArchived:
					Number.parseInt(objToFilter.isArchived.replace('"', '').replace('"', '')) === 1
						? true
						: false,
				comments: comments.replace(/\\r\\n/gim, '\n'),
				stakeholdersToRevokeInvitations: stakeholdersToRevokeInvitations
					? JSON.parse(stakeholdersToRevokeInvitations)
					: null,
				teamMemberInCharge: objToFilter.scheduleDate.substr(
					1,
					objToFilter.teamMemberInCharge.length - 2
				),
				mediaUrl: mediaUrl ? JSON.parse(mediaUrl) : null,
			},
		};
	}
}
