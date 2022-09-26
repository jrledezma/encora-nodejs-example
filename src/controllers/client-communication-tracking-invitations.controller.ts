import { Request, Response } from "express";
import { inject } from "inversify";
import {
	controller,
	interfaces,
	httpGet,
	httpPut,
	httpPost,
} from "inversify-express-utils";
import * as jwt_decode from "jwt-decode";

import { ApiTypes } from "../apiTypes";
import { ConstantValues } from "../constantValues";
import { ClientCommunicationTrackingInvitationsService } from "../services";
import { ServiceResultInterface } from "../interfaces/service-result.interface";

@controller(ConstantValues.trackinginvitations)
export class ClientCommunicatioTrackingInvitationsController
	implements interfaces.Controller {
	private dataSrv: ClientCommunicationTrackingInvitationsService;

	public constructor(
		@inject(ApiTypes.trackingInvitationsService)
		dataSrv: ClientCommunicationTrackingInvitationsService
	) {
		this.dataSrv = dataSrv;
	}

	@httpGet("/")
	public async GetAllInvitationsByUser(req: Request, res: Response): Promise<void> {
		try {
      const userId = (jwt_decode(req.headers["authorization"]) as any).user;
			if (!userId) {
				res.status(403).send("unauthorized");
				return;
			}
			let serviceResult: ServiceResultInterface = await this.dataSrv.GetAllInvitationsByUser(
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
			res.status(500).send({
				code: "error",
				detail: ex.detail || ex.message || ex,
			});
		}
	}

	@httpGet("/byuser")
	public async GetNewInvitationsByUser(
		req: Request,
		res: Response
	): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers["authorization"]) as any).user;
			if (!userId) {
				res.status(403).send("unauthorized");
				return;
			}
			let serviceResult: ServiceResultInterface = await this.dataSrv.GetNewInvitationsByUser(
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
			res.status(500).send({
				code: "error",
				detail: ex.detail || ex.message || ex,
			});
		}
	}

	@httpGet("/asstakeholder")
	public async GetInvitationsByStakeholder(req: Request, res: Response): Promise<void> {
		try {
      const userId = (jwt_decode(req.headers["authorization"]) as any).user;
			if (!userId) {
				res.status(403).send("unauthorized");
				return;
			}
			let serviceResult: ServiceResultInterface = await this.dataSrv.GetInvitationsByStakeholder(
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
			res.status(500).send({
				code: "error",
				detail: ex.detail || ex.message || ex,
			});
		}
	}

	@httpGet("/asinvitedby")
	public async GetInvitationsByInvitedBy(req: Request, res: Response): Promise<void> {
		try {
      const userId = (jwt_decode(req.headers["authorization"]) as any).user;
			if (!userId) {
				res.status(403).send("unauthorized");
				return;
			}
			let serviceResult: ServiceResultInterface = await this.dataSrv.GetInvitationsByInvitedBy(
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
			res.status(500).send({
				code: "error",
				detail: ex.detail || ex.message || ex,
			});
		}
	}

	@httpGet("/bytracking/:trackingId")
	public async GetByTracking(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.dataSrv.GetByTracking(
				req.params.trackingId
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
			res.status(500).send({
				code: "error",
				detail: ex.detail || ex.message || ex,
			});
		}
	}

	@httpGet("/getstakeholderinvitation/:id")
	public async GetById(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers["authorization"]) as any).user;
			if (!userId) {
				res.status(403).send("unauthorized");
				return;
			}
			let serviceResult = await this.dataSrv.GetStakeholderInvitation(
				req.params.id,
				userId
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

	@httpPut("/accept")
	public async AcceptInvitation(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers["authorization"]) as any).user;
			if (!userId) {
				res.status(403).send("unauthorized");
				return;
			}
			let serviceResult: ServiceResultInterface = await this.dataSrv.AcceptInvitation(
				req.body.invitationId,
				userId
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

	@httpPut("/reject")
	public async RejectInvitation(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers["authorization"]) as any).user;
			if (!userId) {
				res.status(403).send("unauthorized");
				return;
			}
			let serviceResult: ServiceResultInterface = await this.dataSrv.RejectInvitation(
				req.body.invitationId,
				userId
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

	@httpPut("/revoke")
	public async RevokeInvitation(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers["authorization"]) as any).user;
			if (!userId) {
				res.status(403).send("unauthorized");
				return;
			}
			let serviceResult: ServiceResultInterface = await this.dataSrv.RevokeInvitation(
				req.body.invitationId,
				userId
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

	@httpPut("/leave")
	public async StakeholdersLeave(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers["authorization"]) as any).user;
			if (!userId) {
				res.status(403).send("unauthorized");
				return;
			}
			let serviceResult: ServiceResultInterface = await this.dataSrv.StakeholdersLeave(
				req.body.invitationId,
				userId
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
}
