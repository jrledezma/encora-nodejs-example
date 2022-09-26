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
import { ServiceResultInterface } from "../interfaces/service-result.interface";
import { UserModelInterface } from "../interfaces/models";
import { UserService } from "../services/user.service";

@controller(ConstantValues.user)
export class UserController implements interfaces.Controller {
	private userSrv: UserService;

	public constructor(@inject(ApiTypes.userService) userSrv: UserService) {
		this.userSrv = userSrv;
	}

	@httpPut("/")
	public async Modify(req: Request, res: Response): Promise<void> {
		try {
			let userData = this.createObjectoFromFormData(req.body);
			userData._id = (jwt_decode(req.headers["authorization"]) as any).user;
			let serviceResult: ServiceResultInterface = await this.userSrv.Modify(
				userData,
				req.files[0]
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

	@httpPost("/validateuseremail")
	public async ValidateUserEmail(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.userSrv.ValidateUserEmail(
				req.body.email
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

	@httpGet("/myinfo")
	public async GetMyInfo(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers["authorization"]) as any).user;
			let serviceResult: ServiceResultInterface = await this.userSrv.GetByID(
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

	@httpGet("/:id")
	public async GetById(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.userSrv.GetByID(
				req.params.id
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

	@httpGet("/userdata")
	public async GetUserData(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers["authorization"]) as any).user;
			let serviceResult: ServiceResultInterface = await this.userSrv.GetByID(
				userId
			);
			if (!serviceResult) {
				res.status(500).send({
					code: "error",
					detail: serviceResult.detail,
				});
			} else {
				if (serviceResult.code !== "success") {
					res.status(500).send(serviceResult);
				}
				res.status(200).send(serviceResult);
			}
		} catch (ex) {
			res.status(500).send({
				code: "error",
				detail: ex.detail || ex.message || ex,
			});
		}
	}

	@httpPost("/search")
	public async Search(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.userSrv.Search(
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

	private createObjectoFromFormData(objToFilter: any): any {
		return {
			firstName: objToFilter.firstName.substr(
				1,
				objToFilter.firstName.length - 2
			),
			lastName: objToFilter.lastName.substr(1, objToFilter.lastName.length - 2),
			countryCode: objToFilter.countryCode.substr(
				1,
				objToFilter.countryCode.length - 2
			),
			phoneNumber: objToFilter.phoneNumber.substr(
				1,
				objToFilter.phoneNumber.length - 2
			),
			about: objToFilter.about.substr(1, objToFilter.about.length - 2),
			password: objToFilter.password
				? objToFilter.password.substr(1, objToFilter.password.length - 2)
				: null,
			confirmPassword: objToFilter.confirmPassword
				? objToFilter.confirmPassword.substr(
						1,
						objToFilter.confirmPassword.length - 2
				  )
				: null,
			registrationToken: objToFilter.registrationToken
				? objToFilter.registrationToken.substr(
						1,
						objToFilter.registrationToken.length - 2
				  )
				: null,
		};
	}
}
