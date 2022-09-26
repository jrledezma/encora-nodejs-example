import { Request, Response } from "express";
import { inject } from "inversify";
import {
	controller,
	interfaces,
	httpGet,
	httpPost,
	httpPut,
} from "inversify-express-utils";
import * as jwt_decode from "jwt-decode";

import { ApiTypes } from "../apiTypes";
import { ConstantValues } from "../constantValues";
import { ClientNotesService } from "../services";
import { ServiceResultInterface } from "../interfaces/service-result.interface";
import { ClientNoteModelInterface } from "../interfaces/models";
import { json } from "body-parser";
import { rest } from "lodash";

@controller(ConstantValues.clientnotes)
export class ClientNotesController
	implements interfaces.Controller {
	private clientNotesSrv: ClientNotesService;

	public constructor(
		@inject(ApiTypes.clientNotesService)
		clientNotesSrv: ClientNotesService
	) {
		this.clientNotesSrv = clientNotesSrv;
	}

	@httpPost("/")
	public async Create(req: Request, res: Response): Promise<void> {
		try {
			const newTracking: any = this.createObjectoFromFormData(req.body);
			newTracking.workingObj.createdBy = (jwt_decode(
				req.headers["authorization"]
			) as any).user;
			await this.clientNotesSrv
				.Create(
					newTracking.workingObj as ClientNoteModelInterface,
					newTracking.peopleToInvite,
					req.files
				)
				.then((serviceResult: ServiceResultInterface) => {
					if (!serviceResult) {
						res.status(200).send({
							code: "requestNotProcessed",
							detail: "Any data was saved",
						});
					} else {
						let statusCode: number = 500;
						if (serviceResult.code !== "error") {
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

	@httpPut("/")
	public async Modify(req: Request, res: Response): Promise<void> {
		try {
			const tracking: any = this.createObjectoFromFormData(req.body);
			tracking.workingObj.lastModificationUser = (jwt_decode(
				req.headers["authorization"]
			) as any).user;
			const serviceResult = await this.clientNotesSrv.Modify(
				tracking.workingObj as ClientNoteModelInterface,
				tracking.peopleToInvite,
				tracking.stakeholdersToRevokeInvitations,
				req.files
			);
			if (!serviceResult) {
				res.status(200).send({
					code: "requestNotProcessed",
					detail: "Any data was saved",
				});
			} else {
				let statusCode: number = 500;
				if (serviceResult.code !== "error") {
					statusCode = 200;
				}
				res.status(statusCode).send(serviceResult);
			}
		} catch (ex) {
			console.log(ex);
			res.status(500).json(ex);
		}
	}

	@httpPut("/archive")
	public async Archive(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers["authorization"]) as any).user;
			const serviceResult = await this.clientNotesSrv.ArchiveNote(
				req.body.trackingId,
				userId
			);
			if (!serviceResult) {
				res.status(200).send({
					code: "requestNotProcessed",
					detail: "Any data was saved",
				});
			} else {
				let statusCode: number = 500;
				if (serviceResult.code !== "error") {
					statusCode = 200;
				}
				res.status(statusCode).send(serviceResult);
			}
		} catch (ex) {
			console.log(ex);
			res.status(500).json(ex);
		}
	}

	@httpPut("/unarchive")
	public async Unarchive(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers["authorization"]) as any).user;
			const serviceResult = await this.clientNotesSrv.UnarchiveNote(
				req.body.trackingId,
				userId
			);
			if (!serviceResult) {
				res.status(200).send({
					code: "requestNotProcessed",
					detail: "Any data was saved",
				});
			} else {
				let statusCode: number = 500;
				if (serviceResult.code !== "error") {
					statusCode = 200;
				}
				res.status(statusCode).send(serviceResult);
			}
		} catch (ex) {
			console.log(ex);
			res.status(500).json(ex);
		}
	}

	@httpPut("/leavetracking")
	public async LeaveTracking(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers["authorization"]) as any).user;
			const serviceResult = await this.clientNotesSrv.LeaveNote(
				req.body.trackingId,
				userId
			);
			if (!serviceResult) {
				res.status(200).send({
					code: "requestNotProcessed",
					detail: "Any data was saved",
				});
			} else {
				let statusCode: number = 500;
				if (serviceResult.code !== "error") {
					statusCode = 200;
				}
				res.status(statusCode).send(serviceResult);
			}
		} catch (ex) {
			console.log(ex);
			res.status(500).json(ex);
		}
	}

	@httpGet("/byid/:id")
	public async GetById(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult = await this.clientNotesSrv.GetById(
				req.params.id,
				(jwt_decode(req.headers["authorization"]) as any).user
			);
			if (!serviceResult) {
				res.status(200).send({
					code: "requestNotProcessed",
					detail: "Any data was found",
				});
			} else {
				let statusCode: number = 500;
				if (serviceResult.code !== "error") {
					statusCode = 200;
				}
				res.status(statusCode).send(serviceResult);
			}
		} catch (ex) {
			res.status(500).json(ex);
		}
	}

	@httpPost("/search")
	public async Search(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.clientNotesSrv.Search(
				req.body
			);
			if (!serviceResult) {
				res.status(200).send({
					code: "requestNotProcessed",
					detail: "Any data was found",
				});
			} else {
				let statusCode: number = 500;
				if (serviceResult.code !== "error") {
					statusCode = 200;
				}
				res.status(statusCode).send(serviceResult);
			}
		} catch (ex) {
			res.status(500).json(ex);
		}
	}

	@httpPost("/getclients")
	public async GetComunicationClients(
		req: Request,
		res: Response
	): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.clientNotesSrv.GetClients(
				(jwt_decode(req.headers["authorization"]) as any).user,
				req.body
			);
			if (!serviceResult) {
				res.status(200).send({
					code: "requestNotProcessed",
					detail: "Any data was found",
				});
			} else {
				let statusCode: number = 500;
				if (serviceResult.code !== "error") {
					statusCode = 200;
				}
				res.status(statusCode).send(serviceResult);
			}
		} catch (ex) {
			res.status(500).json(ex);
		}
	}

	@httpGet("/gettrackingbyclient/:clientId")
	public async CommunicationTrackingByClient(
		req: Request,
		res: Response
	): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.clientNotesSrv.NotesByClient(
				req.params.clientId,
				(jwt_decode(req.headers["authorization"]) as any).user
			);
			if (!serviceResult) {
				res.status(200).send({
					code: "requestNotProcessed",
					detail: "Any data was found",
				});
			} else {
				let statusCode: number = 500;
				if (serviceResult.code !== "error") {
					statusCode = 200;
				}
				res.status(statusCode).send(serviceResult);
			}
		} catch (ex) {
			res.status(500).json(ex);
		}
	}

	private createObjectoFromFormData(objToFilter: any): any {
		const stakeholderConfiguration = JSON.parse(
				objToFilter.stakeholdersConfiguration
			),
			peopleToInvite = JSON.parse(objToFilter.peopleToInvite),
			stakeholdersToRevokeInvitations = objToFilter.stakeholdersToRevokeInvitations
				? JSON.parse(objToFilter.stakeholdersToRevokeInvitations)
				: null,
			images = objToFilter.images ? JSON.parse(objToFilter.images) : null;

		const comments: String = objToFilter.comments.substr(
			1,
			objToFilter.comments.length - 2
		);
		return {
			workingObj: {
				_id: objToFilter._id
					? objToFilter._id.substr(1, objToFilter._id.length - 2)
					: null,
				noteType: objToFilter.trackingType.substr(
					1,
					objToFilter.trackingType.length - 2
				),
				client: objToFilter.client.substr(1, objToFilter.client.length - 2),
				isArchived:
					Number.parseInt(objToFilter.isArchived.replace('"',"").replace('"',"")) === 1
						? true
						: false,
				title: objToFilter.title
					? objToFilter.title.substr(1, objToFilter.title.length - 2)
					: null,
				comments: comments.replace(/\\r\\n/gim, "\n"),
				communicationDate: objToFilter.communicationDate.substr(
					1,
					objToFilter.communicationDate.length - 2
				),
				stakeholdersConfiguration: JSON.parse(stakeholderConfiguration),
				stakeholdersToRevokeInvitations: stakeholdersToRevokeInvitations
					? JSON.parse(stakeholdersToRevokeInvitations)
					: null,
				voiceMediaUrl: objToFilter.voiceMediaUrl
					? objToFilter.voiceMediaUrl.substr(
							1,
							objToFilter.communicationDate.length - 2
					  )
					: null,
				images: images ? JSON.parse(images) : null,
			},
			peopleToInvite: JSON.parse(peopleToInvite),
		};
	}
}
