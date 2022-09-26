import * as jwt_decode from 'jwt-decode';
import {
	controller,
	interfaces,
	httpGet,
	httpPost,
	httpPut,
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { Request, Response } from 'express';

import { ApiTypes } from '../apiTypes';
import { ClientDealModelInterface } from '../interfaces/models';
import { ClientDealsService } from '../services';
import { ConstantValues } from '../constantValues';
import { ServiceResultInterface } from '../interfaces/service-result.interface';

@controller(ConstantValues.clientdeals)
export class ClientDealsController implements interfaces.Controller {
	private clientDealsSrv: ClientDealsService;

	public constructor(
		@inject(ApiTypes.clientDealsService)
		clientDealsSrv: ClientDealsService
	) {
		this.clientDealsSrv = clientDealsSrv;
	}

	@httpPost('/')
	public async Create(req: Request, res: Response): Promise<void> {
		try {
			let workingObj = this.createClientDealObj(req.body);
			//asignating user in session
			workingObj.clientDeal.createdBy = (jwt_decode(
				req.headers['authorization']
			) as any).user;
			await this.clientDealsSrv
				.Create(
					workingObj.clientDeal,
					workingObj.clientDealTracking,
					workingObj.peopleToInvite,
					req.files.length > 0 ? req.files : null
				)
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
					res.status(500).json({ code: 'error', detail: reason });
				});
		} catch (ex) {
			res.status(500).json({ code: 'error', detail: ex });
		}
	}

	@httpPut('/')
	public async Modify(req: Request, res: Response): Promise<void> {
		try {
			req.body.workingObj.lastModificationUser = (jwt_decode(
				req.headers['authorization']
			) as any).user;
			const serviceResult = await this.clientDealsSrv.Modify(
				req.body.workingObj as ClientDealModelInterface,
				req.body.peopleToInvite,
				req.body.teamMembersToRevokeInvitations
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
			res.status(500).json(ex);
		}
	}

	@httpPut('/archive')
	public async Archive(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers['authorization']) as any).user;
			const serviceResult = await this.clientDealsSrv.ArchiveDeal(
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
			res.status(500).json(ex);
		}
	}

	@httpPut('/unarchive')
	public async Unarchive(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers['authorization']) as any).user;
			const serviceResult = await this.clientDealsSrv.UnarchiveDeal(
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
			res.status(500).json(ex);
		}
	}

	@httpPut('/leave')
	public async LeaveTracking(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers['authorization']) as any).user;
			const serviceResult = await this.clientDealsSrv.LeaveDeal(
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
			res.status(500).json(ex);
		}
	}

	@httpGet('/byid/:id')
	public async GetById(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult = await this.clientDealsSrv.GetById(
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
			let serviceResult: ServiceResultInterface = await this.clientDealsSrv.Search(
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

	@httpPost('/getclients')
	public async GetComunicationClients(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.clientDealsSrv.GetClients(
				(jwt_decode(req.headers['authorization']) as any).user,
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

	@httpGet('/getdealsbyclient/:clientId')
	public async dealsByClient(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.clientDealsSrv.DealsByClient(
				req.params.clientId,
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

	@httpPost('/validaterefcode')
	public async validateReferenceCode(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.clientDealsSrv.ValidateReferenceCode(
				req.body.referenceCode,
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

	private createClientDealObj(objToFilter: any): any {
		try {
			if (!objToFilter.clientDeal) {
				throw 'clientDeal is required';
			}
			if (!objToFilter.clientDealTracking) {
				throw 'clientDealTracking is required';
			}
			let clientDeal: any, clientDealTracking: any;

			//parsing clientDeal and clientDealTracking
			for (let i = 0; i <= 1; i++) {
				clientDeal = !clientDeal
					? JSON.parse(objToFilter.clientDeal)
					: JSON.parse(clientDeal);
				clientDealTracking = !clientDealTracking
					? JSON.parse(objToFilter.clientDealTracking)
					: JSON.parse(clientDealTracking);
			}

			const peopleToInvite = objToFilter.peopleToInvite
					? JSON.parse(objToFilter.peopleToInvite)
					: null,
				teamMembersToRevokeInvitations = objToFilter.teamMembersToRevokeInvitations
					? JSON.parse(objToFilter.teamMembersToRevokeInvitations)
					: null;
			return {
				clientDeal,
				clientDealTracking,
				peopleToInvite,
				teamMembersToRevokeInvitations,
			};
			/*return {
				dealObj: {
					_id: clientDeal._id
						? clientDeal._id.substr(1, clientDeal._id.length - 1)
						: null,
					client: clientDeal.client, //clientDeal.client.substr(1, clientDeal.client.length - 1),
					referenceCode: clientDeal.referenceCode.substr(
						1,
						clientDeal.referenceCode.length - 1
					),
					title: clientDeal.title
						? clientDeal.title.substr(1, clientDeal.title.length - 1)
						: null,
					teamMembersToRevokeInvitations: teamMembersToRevokeInvitations
						? JSON.parse(teamMembersToRevokeInvitations)
						: null,
				},
				peopleToInvite: JSON.parse(peopleToInvite),
			};*/
		} catch (ex) {
			throw ex;
		}
	}
}
