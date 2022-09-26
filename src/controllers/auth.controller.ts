import { Express, Request, Response } from "express";
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
import { AuthService } from "../services";
import { ServiceResultInterface } from "../interfaces/service-result.interface";
import { UserModelInterface } from "../interfaces/models";
import { CommonFunctions } from "../common/common-functions";

@controller(ConstantValues.auth)
export class AuthController implements interfaces.Controller {
	private authSrv: AuthService;

	public constructor(@inject(ApiTypes.authService) authSrv: AuthService) {
		this.authSrv = authSrv;
	}

	@httpPost("/signup")
	public async signUp(req: Request, res: Response, next): Promise<void> {
		try {
			res.header("Access-Control-Allow-Origin", "*");
			const result: ServiceResultInterface = await this.authSrv.SignUp (
				req.body.email
			);
			if (result.code !== "success") {
				res.cookie("usr", "");
				res.status(401).send(result);
				return;
			}
			res.status(200).send({ code: "success", detail: result.detail });
		} catch (ex) {
			res.status(500).json({
				code: "error",
				detail: ex.detail || ex.message || ex,
			});
		}
	}

	@httpPost("/login")
	public async login(req: Request, res: Response, next): Promise<void> {
		try {
			res.header("Access-Control-Allow-Origin", "*");
			const result: ServiceResultInterface = await this.authSrv.Login(
				req.body.email,
				req.body.password
			);
			if (result.code !== "success") {
				res.cookie("usr", "");
				res.status(401).send(result);
				return;
			}
			res.status(200).send({ code: "success", detail: result.detail });
		} catch (ex) {
			console.log(ex)
			res.status(500).json({
				code: "error",
				detail: ex.detail || ex.message || ex,
			});
		}
	}

	@httpGet("/isloggedin")
	public async IsLoggedIn(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers["authorization"]) as any).user;
			let serviceResult: ServiceResultInterface = await this.authSrv.GetUserData(
				userId
			);
			if (serviceResult.code !== "success") {
				res.status(400).send(serviceResult);
				return;
			}
			res.status(200).send(true);
		} catch (ex) {
			res.status(500);
		}
	}

	@httpGet("/sessiondata")
	public async GetSessionData(req: Request, res: Response): Promise<void> {
		try {
			const userId = (jwt_decode(req.headers["authorization"]) as any).user;
			let serviceResult: ServiceResultInterface = await this.authSrv.GetUserSessionData(
				userId
			);
			if (serviceResult.code !== "success") {
				res.status(400).send(serviceResult);
				return;
			}
			res.status(200).send(serviceResult);
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
			let serviceResult: ServiceResultInterface = await this.authSrv.GetUserData(
				userId
			);
			if (serviceResult.code !== "success") {
				res.status(400).send(serviceResult);
				return;
			}
			res.status(200).send(serviceResult);
		} catch (ex) {
			res.status(500).send({
				code: "error",
				detail: ex.detail || ex.message || ex,
			});
		}
	}

	@httpGet("/logout")
	public async logout(req: Request, res: Response, next): Promise<void> {
		try {
			if (req.headers["authorization"].toString()) {
				res.header("authorization", null);
			}
			res.status(200).send(true);
		} catch (ex) {
			res.status(500).send({
				code: "error",
				detail: ex.detail || ex.message || ex,
			});
		}
	}

	@httpPost("/forgotpasswordrequest")
	public async forgotPassword(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.authSrv.ForgotPassword(
				req.body.email
			);
			if (serviceResult.code !== "success") {
				res.status(400).send(serviceResult);
				return;
			}
			res.status(200).send(serviceResult);
		} catch (ex) {
			res.status(500).send({
				code: "error",
				detail: ex.detail || ex.message || ex,
			});
		}
	}

	@httpPut("/changepassword")
	public async ChangePassword(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult = await this.authSrv.ChangePassword(
				(jwt_decode(req.headers["authorization"]) as any).user,
				req.body.currentPassword,
				req.body.password
			);

			if (serviceResult.code === "passwordNotMatch") {
				res.status(200).send(serviceResult);
				return;
			}
			let statusCode = 200;
			if (serviceResult.code != "success") {
				statusCode = 500;
			}
			res.status(statusCode).send(serviceResult);
		} catch (ex) {
			res.status(500).send({
				code: "error",
				detail: ex.detail || ex.message || ex,
			});
		}
	}

	@httpPost("/recoverpassword")
	public async RecoverPassword(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.authSrv.RecoverPassword(
				req.body.token,
				req.body.password
			);
			if (serviceResult.code !== "success") {
				res.status(400).send(serviceResult);
				return;
			}
			res.status(200).send(serviceResult);
		} catch (ex) {
			res.status(500).send({
				code: "error",
				detail: ex.detail || ex.message || ex,
			});
		}
	}

	@httpPost("/validaterecoverpasswordtoken")
	public async ValidateRecoverPasswordToken(
		req: Request,
		res: Response
	): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.authSrv.VerifyRecoverPasswordToken(
				req.body.token
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
			res.status(500).send({
				code: "error",
				detail: ex.detail || ex.message || ex,
			});
		}
	}

	@httpPost("/validateconfirmationtoken")
	public async VerifyConfirmUserToken(
		req: Request,
		res: Response
	): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.authSrv.VerifyConfirmUserToken(
				req.body.token
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

	@httpPost("/validaterecoveraccounttoken")
	public async VerifyRecoverUserToken(
		req: Request,
		res: Response
	): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.authSrv.VerifyRecoverUserToken(
				req.body.token
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

	@httpPost("/enduserregistration")
	public async EndUserRegistration(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.authSrv.EndUserRegistration(
				this.createObjectoFromFormData(req.body),
				req.files[0]
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

	@httpPut("/closeaccount")
	public async CloseAccount(req: Request, res: Response): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.authSrv.CloseAccount(
				(jwt_decode(req.headers["authorization"]) as any).user,
				req.body.email,
				req.body.password
			);
			if (serviceResult.code === "error") {
				res.status(500).send(serviceResult);
				return;
			}
			if (serviceResult.code === "notDataFound") {
				res.status(200).send(serviceResult);
				return;
			}
			res.status(200).send(serviceResult);
		} catch (ex) {
			res.status(500).send({
				code: "error",
				detail: ex.detail || ex.message || ex,
			});
		}
	}

	@httpPut("/recoverclosedaccount")
	public async RecoverClosedAccount(
		req: Request,
		res: Response
	): Promise<void> {
		try {
			let serviceResult: ServiceResultInterface = await this.authSrv.RecoverClosedAccount(
				req.body.token,
				req.body.password,
				req.body.confirmPassword
			);
			if (serviceResult.code !== "success") {
				res.status(400).send(serviceResult);
				return;
			}
			res.status(200).send(serviceResult);
		} catch (ex) {
			res.status(500).send({
				code: "error",
				detail: ex.detail || ex.message || ex,
			});
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
