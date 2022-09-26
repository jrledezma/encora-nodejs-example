import { injectable, inject } from "inversify";
import * as bcrypt from "bcryptjs";

import { CommonFunctions } from "../common";
import { UserDocumentInterface, UserSchema } from "../models/index";
import { ServiceResultInterface } from "../interfaces/service-result.interface";
import { UserModelInterface } from "../interfaces/models";
import { UserServiceInterface } from "../interfaces/services";
import { ApiTypes } from "../apiTypes";
import { MailService } from ".";
import { UserStatusEnum } from "../enums/user-status-enum";

var randomString = require("randomstring");
var md5 = require("md5");

@injectable()
export class UserService implements UserServiceInterface {
	//#region Public Properties

	public Create = this.create;
	public CreateForSignUp = this.createForSignUp;
	public Modify = this.modify;
	public ChangePassword = this.changePassword;
	public ValidateUserEmail = this.validateUserEmail;
	public GetByID = this.getByID;
	public GetByEmail = this.getByEmail;
	public Search = this.search;

	//#endregion

	private dbDocument: UserDocumentInterface;
	private mailSrv: MailService;
	private selectableFields = [
		"firstName",
		"lastName",
		"email",
		"countryCode",
		"phoneNumber",
		"image",
		"about",
		"status",
	];

	public constructor(@inject(ApiTypes.mailService) mailSrv: MailService) {
		this.mailSrv = mailSrv;
	}

	//#region Private Functions

	private async create(
		newUserEmail: string,
		createdBy: string
	): Promise<ServiceResultInterface> {
		try {
			const user: UserDocumentInterface = await UserSchema.findOne({
				email: newUserEmail.toLocaleLowerCase(),
			});
			if (user) {
				return {
					code: "emailAlreadyExists",
					detail: "The Email is already registered in the data base",
				};
			}
			const registrationToken = randomString.generate();
			this.dbDocument = new UserSchema({
				email: newUserEmail.toLowerCase(),
				registrationToken: registrationToken,
				status: "created",
			});
			const insertResult = await this.dbDocument.save({
				validateBeforeSave: true,
			});
			if (!insertResult) {
				return {
					code: "error",
					detail: "any data was creted",
				};
			}
			//get created by user data
			const userCreation = await UserSchema.findById(createdBy).select([
				"firstName",
				"lastName",
			]);
			this.mailSrv.SendCreateUserConfirmationMail(
				`${userCreation.firstName} ${userCreation.lastName}`,
				newUserEmail,
				`${registrationToken}cl17011${md5(newUserEmail)}`
			);
			return {
				code: "success",
				detail: insertResult,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async createForSignUp(
		newUserEmail: string
	): Promise<ServiceResultInterface> {
		try {
			const user: UserDocumentInterface = await UserSchema.findOne({
				email: newUserEmail.toLocaleLowerCase(),
			});

			if (user) {
				if (user.status !== UserStatusEnum.created) {
					return {
						code: "emailAlreadyExists",
						detail: "The Email is already registered in the data base",
					};
				} else {
					this.mailSrv.SendSignUpMail(
						newUserEmail,
						`${user.registrationToken}cl17011${md5(newUserEmail)}`
					);
					return {
						code: "success"
					};
				}
			} 

			const registrationToken = randomString.generate();
			this.dbDocument = new UserSchema({
				email: newUserEmail.toLowerCase(),
				registrationToken: registrationToken,
				status: "created",
			});
			const insertResult = await this.dbDocument.save({
				validateBeforeSave: true,
			});
			if (!insertResult) {
				return {
					code: "error",
					detail: "any data was creted",
				};
			}
			// send email for signup
			this.mailSrv.SendSignUpMail(
				newUserEmail,
				`${registrationToken}cl17011${md5(newUserEmail)}`
			);
			return {
				code: "success",
				detail: insertResult,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async modify(
		objToModify: UserModelInterface,
		file: any
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: UserDocumentInterface = await UserSchema.findById(
				objToModify._id
			);
			if (!dbResult) {
				return {
					code: "notDataFound",
					detail: "Data not found for update",
				};
			}
			dbResult.lastName = objToModify.lastName;
			dbResult.firstName = objToModify.firstName;
			dbResult.image = file
				? await CommonFunctions.fileUploader(file, "users")
				: dbResult.image;
			dbResult.about = objToModify.about;
			dbResult.countryCode = objToModify.countryCode;
			dbResult.phoneNumber = objToModify.phoneNumber;
			dbResult.markModified("UserSchema");

			let updateResult = await dbResult.save();
			if (updateResult._id) {
				return Promise.resolve({
					code: "success",
					detail: "Data updated successfully",
				});
			} else {
				return Promise.reject({
					code: "notDataModified",
					detail: "Data not updated",
				});
			}
		} catch (ex) {
			throw ex;
		}
	}

	private async changePassword(
		userId: string,
		password: string
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: UserDocumentInterface = await UserSchema.findById(userId);
			if (!dbResult) {
				return {
					code: "notDataFound",
					detail: "Data not found for update",
				};
			}
			dbResult.salt = bcrypt.genSaltSync();
			dbResult.password = `${md5(password)}${dbResult.salt}`;
			dbResult.markModified("UserSchema");

			let updateResult = await dbResult.save();
			if (updateResult._id) {
				this.mailSrv.SendChangePasswordConfirmationMail(dbResult);
				return {
					code: "success",
					detail: "Password changed successfully",
				};
			} else {
				return {
					code: "notDataModified",
					detail: "Password not updated",
				};
			}
		} catch (ex) {
			throw ex;
		}
	}

	private async validateUserEmail(
		email: string
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: UserDocumentInterface = await UserSchema.findOne({
				email: { $regex: RegExp(`^${email.trim().toLocaleLowerCase()}$`, "i") },
			});
			if (!dbResult) {
				return {
					code: "success",
					detail: "Data not found",
				};
			}
			return {
				code: "valueAlreadyCreated",
				detail: dbResult,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async getByID(id: string): Promise<ServiceResultInterface> {
		try {
			let dbResult: UserDocumentInterface = await UserSchema.findById(
				id
			).select(this.selectableFields);
			if (!dbResult) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			return {
				code: "success",
				detail: {
					_id: dbResult._id,
					firstName: dbResult.firstName,
					lastName: dbResult.lastName,
					email: dbResult.email,
					countryCode: dbResult.countryCode,
					phoneNumber: dbResult.phoneNumber,
					image: dbResult.image,
					about: dbResult.about,
					status: dbResult.status,
				},
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async getByEmail(userEmail: string): Promise<ServiceResultInterface> {
		try {
			let dbResult: UserDocumentInterface = await UserSchema.findOne({
				email: userEmail,
			}).select(this.selectableFields);
			if (!dbResult) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			return {
				code: "success",
				detail: {
					_id: dbResult._id,
					lastName: dbResult.lastName,
					firstName: dbResult.firstName,
					email: dbResult.email,
					status: dbResult.status,
					createdDate: dbResult.createdDate,
				},
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async search(params: string): Promise<ServiceResultInterface> {
		try {
			let paramsResult: any = CommonFunctions.buildQueryParams(params);
			paramsResult.isAdmin = false;
			let dbResult: UserDocumentInterface[];
			if (Object.keys(paramsResult).length > 0) {
				dbResult = await UserSchema.find(paramsResult).select(
					this.selectableFields
				);
			} else {
				dbResult = await UserSchema.find().select(this.selectableFields);
			}
			if (!dbResult) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			let objectsCollection = new Array<UserModelInterface>();
			dbResult.forEach((obj: UserModelInterface) => {
				objectsCollection.push(<UserModelInterface>{
					_id: obj._id,
					firstName: obj.firstName || "Usuario",
					lastName: obj.lastName || "No Confirmado",
					email: obj.email,
					countryCode: obj.countryCode,
					phoneNumber: obj.phoneNumber,
					image: obj.image,
					status: obj.status,
					about: obj.about,
				});
			});
			return {
				code: "success",
				detail: objectsCollection,
			};
		} catch (ex) {
			throw ex;
		}
	}
}
