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
import { ClientsService } from '../services';
import { ServiceResultInterface } from '../interfaces/service-result.interface';
import { ClientModelInterface, ClientContactModelInterface } from '../interfaces/models';

@controller(ConstantValues.clients)
export class ClientsController implements interfaces.Controller {
	private productTypesSrv: ClientsService;

	public constructor(
		@inject(ApiTypes.clientsService)
		productTypesSrv: ClientsService
	) {
		this.productTypesSrv = productTypesSrv;
	}

	@httpPost('/')
	public async Create(req: Request, res: Response): Promise<void> {
		try {
			req.body.product = '';
			req.body.createdBy = (jwt_decode(req.headers['authorization']) as any).user;
			await this.productTypesSrv
				.Create(req.body as ClientModelInterface)
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
			res.status(500).json(ex);
		}
	}

	@httpPut('/')
	public async Modify(req: Request, res: Response): Promise<void> {
		try {
			req.body.lastModificationUser = (jwt_decode(
				req.headers['authorization']
			) as any).user;
			await this.productTypesSrv
				.Modify(req.body as ClientModelInterface)
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
			res.status(500).json(ex);
		}
	}

	@httpPut('/contacts')
	public async AddModifyContacts(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers['authorization']) as any).user;
			await this.productTypesSrv
				.AddModifyContact(
					req.body.clientId,
					req.body.contact as ClientContactModelInterface,
					userId
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
					res.status(500).send(reason);
				});
		} catch (ex) {
			res.status(500).json(ex);
		}
	}

	@httpGet('/contacts/:clientId')
	public async getContacts(req: Request, res: Response): Promise<void> {
		try {
			await this.productTypesSrv
				.GetContacts(req.params.clientId)
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
			res.status(500).json(ex);
		}
	}

	@httpPut('/activate')
	public async Activate(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.productTypesSrv.Activate(
				req.body.id
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
			res.status(500).send({
				code: 'error',
				detail: ex.detail || ex.message || ex,
			});
		}
	}

	@httpPut('/inactivate')
	public async Inactivate(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.productTypesSrv.Inactivate(
				req.body.id
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
			res.status(500).send({
				code: 'error',
				detail: ex.detail || ex.message || ex,
			});
		}
	}

	@httpGet('/')
	public async GetAll(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult = await this.productTypesSrv.GetAll(
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

	@httpGet('/:id')
	public async GetById(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult = await this.productTypesSrv.GetById(
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
			let serviceResult: ServiceResultInterface = await this.productTypesSrv.Search(
				req.body,
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

	@httpPost('/validateidnumber')
	public async ValidateValue(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.productTypesSrv.ValidateIdNumber(
				req.body.idNumber
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
			res.status(500).send({
				code: 'error',
				detail: ex.detail || ex.message || ex,
			});
		}
	}
}
