import { injectable, inject } from 'inversify';

import * as bcrypt from 'bcryptjs';

import { UserDocumentInterface, UserSchema } from '../models/';
import { ServiceResultInterface } from '../interfaces/service-result.interface';
import { UserModelInterface } from '../interfaces/models';
import { AuthServiceInterface } from '../interfaces/services';
import { UserService } from './user.service';
import { TokenService } from './token.service';
import { MailService } from './mail.service';
import { ApiTypes } from '../apiTypes';
import { CommonFunctions } from '../common';
import { UserStatusEnum } from '../enums';
import ClientCommunicationTrackingInvitationSchema from '../models/client-communication-tracking-invitation.model';
import { TrackingInvitationStatusEnum } from '../enums/tracking-invitation-status-enum';

var md5 = require('md5');
var randomString = require('randomstring');

@injectable()
export class AuthService implements AuthServiceInterface {
	public Login = this.login;
	public GetUserSessionData = this.getUserSessionData;
	public GetUserData = this.getUserData;
	public ChangePassword = this.changePassword;
	public ForgotPassword = this.forgotPassword;
	public RecoverPassword = this.recoverPassword;
	public VerifyRecoverPasswordToken = this.verifyRecoverPasswordToken;
	public VerifyConfirmUserToken = this.verifyConfirmUserToken;
	public VerifyRecoverUserToken = this.verifyRecoverUserToken;
	public EndUserRegistration = this.endUserRegistration;
	public CloseAccount = this.closeAccount;
	public RecoverClosedAccount = this.recoverClosedAccount;
	public SignUp = this.signUp;

	protected userSrv: UserService;
	protected tokenSrv: TokenService;
	protected mailSrv: MailService;

	constructor(
		@inject(ApiTypes.userService) userSrv: UserService,
		@inject(ApiTypes.tokenService) tokenSrv: TokenService,
		@inject(ApiTypes.mailService) mailSrv: MailService
	) {
		this.userSrv = userSrv;
		this.tokenSrv = tokenSrv;
		this.mailSrv = mailSrv;
	}

	private async signUp(email: string): Promise<ServiceResultInterface> {
		try {
			return await this.userSrv.CreateForSignUp(email);
		} catch (ex) {
			throw ex;
		}
	}

	/**
	 * POST /login
	 * Sign in using email and password.
	 */
	private async login(email: string, password: string): Promise<ServiceResultInterface> {
		try {
			const sessionData: UserModelInterface = await UserSchema.findOne({
				email: email,
			});
			if (!sessionData) {
				return {
					code: 'credentialsError',
					detail: 'user data not found1',
				};
			}
			if (sessionData.password !== `${md5(password)}${sessionData.salt}`) {
				return {
					code: 'credentialsError',
					detail: 'user data not found2',
				};
			}

			if (sessionData.status === 'closed') {
				return {
					code: 'error',
					detail: 'User account is closed',
				};
			}

			//const token = await this.tokenSrv.Generate({ user: sessionData._id }, Number.parseInt(process.env.SESSION_TIMEOUT) * 1000);
			const token = await this.tokenSrv.Generate(
				{ user: sessionData._id },
				Number.parseFloat(process.env.SESSION_TIMEOUT) * 60000
			);
			return {
				code: 'success',
				detail: token,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async getUserSessionData(userId: string): Promise<ServiceResultInterface> {
		try {
			const dbResponse = await this.userSrv.GetByID(userId);
			if (dbResponse.code !== 'success') {
				return dbResponse;
			}
			//getting new invitations
			const invitations = await ClientCommunicationTrackingInvitationSchema.find({
				stakeholder: userId,
				invitationStatus: TrackingInvitationStatusEnum.requested,
			});
			//find user
			const sessionData = dbResponse.detail as UserModelInterface;
			return {
				code: 'success',
				detail: {
					fullName: `${sessionData.firstName} ${sessionData.lastName}`,
					image: sessionData.image,
					status: sessionData.status,
					invitationsQtt: invitations ? invitations.length : 0,
				},
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async getUserData(userId: string): Promise<ServiceResultInterface> {
		try {
			const dbResponse = await this.userSrv.GetByID(userId);
			if (dbResponse.code !== 'success') {
				return dbResponse;
			}
			//find user pymes
			const sessionData = dbResponse.detail as UserModelInterface;
			return {
				code: 'success',
				detail: {
					firstName: sessionData.firstName,
					lastName: sessionData.lastName,
					email: sessionData.email,
				},
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async changePassword(
		userId: string,
		currentPassword: string,
		newPassword: string
	): Promise<ServiceResultInterface> {
		try {
			const salt = bcrypt.genSaltSync();

			const userData = await UserSchema.findOne({
				_id: userId,
			}).select(['password', 'salt']);
			if (userData.password !== `${md5(currentPassword)}${userData.salt}`) {
				return {
					code: 'passwordNotMatch',
					detail: 'Current password not valid',
				};
			} else {
				return await this.userSrv
					.ChangePassword(userId, newPassword)
					.then((srvResult: ServiceResultInterface) => {
						return srvResult;
					});
			}
		} catch (ex) {
			throw ex;
		}
	}

	private async forgotPassword(userEmail: string): Promise<ServiceResultInterface> {
		try {
			const userResponse: UserDocumentInterface = await UserSchema.findOne({
				email: userEmail,
			});
			if (!userResponse) {
				return {
					code: 'dataNoFound',
					detail: 'user data not found',
				};
			}
			if (userResponse.status !== UserStatusEnum.created) {
				const token = randomString.generate();
				userResponse.recoverPasswordToken = token;
				userResponse.markModified('UserSchema');

				const saveResult = await userResponse.save();
				if (saveResult._id) {
					this.mailSrv.SendRecoveryPasswordMail(
						userResponse,
						`${process.env.RECOVER_PASSWORD_URL}/${token}cl17011${md5(
							userResponse.email
						)}`
					);
					return {
						code: 'success',
						detail: 'Password changed successfully',
					};
				} else {
					return {
						code: 'notDataModified',
						detail: 'Password not updated',
					};
				}
			}
			return {
				code: 'userBanned',
				detail: 'User is banned',
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async recoverPassword(
		token: string,
		password: string
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: UserDocumentInterface = await UserSchema.findOne({
				recoverPasswordToken: token.split('cl17011')[0],
			}).select(['firstName', 'lastName', 'email']);
			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}
			if (md5(dbResult.email) !== token.split('cl17011')[1]) {
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}

			dbResult.salt = bcrypt.genSaltSync();
			dbResult.password = `${md5(password)}${dbResult.salt}`;
			dbResult.recoverPasswordToken = null;
			dbResult.markModified('UserSchema');

			let updateResult = await dbResult.save();
			if (updateResult._id) {
				//send user mail confirmation
				this.mailSrv.SendRecoverPasswordMail(dbResult.firstName, dbResult.email);
				return Promise.resolve({
					code: 'success',
					detail: 'User password was successfully',
				});
			} else {
				return Promise.reject({
					code: 'notDataModified',
					detail: 'Data not updated',
				});
			}
		} catch (ex) {
			throw ex;
		}
	}

	private async verifyConfirmUserToken(token: string): Promise<ServiceResultInterface> {
		try {
			let dbResult: UserDocumentInterface = await UserSchema.findOne({
				registrationToken: token.split('cl17011')[0],
			}).select('email');
			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}
			//`${registrationToken}cl17011${md5(newUserEmail)}`
			if (md5(dbResult.email.toLocaleLowerCase()) === token.split('cl17011')[1]) {
				return {
					code: 'success',
				};
			}
			return {
				code: 'notDataFound2',
				detail: 'Data not found2',
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async verifyRecoverPasswordToken(
		token: string
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: UserDocumentInterface = await UserSchema.findOne({
				recoverPasswordToken: token.split('cl17011')[0],
			}).select('email');
			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}
			if (md5(dbResult.email) === token.split('cl17011')[1]) {
				return {
					code: 'success',
				};
			}
			return {
				code: 'notDataFound',
				detail: 'Data not found',
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async verifyRecoverUserToken(token: string): Promise<ServiceResultInterface> {
		try {
			console.log(token.split('cl17011')[0]);
			let dbResult: UserDocumentInterface = await UserSchema.findOne({
				recoverPasswordToken: token.split('cl17011')[0],
			}).select([
				'firstName',
				'lastName',
				'email',
				'countryCode',
				'phoneNumber',
				'image',
				'about',
				'status',
			]);
			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}
			if (md5(dbResult.email) === token.split('cl17011')[1]) {
				return {
					code: 'success',
					detail: dbResult,
				};
			}
			return {
				code: 'notDataFound',
				detail: 'Data not found',
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async endUserRegistration(
		userData: any,
		file: any
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: UserDocumentInterface = await UserSchema.findOne({
				registrationToken: userData.registrationToken.split('cl17011')[0],
			});
			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'User not found for registration',
				};
			}
			if (userData.password.trim() !== userData.confirmPassword.trim()) {
				return {
					code: 'error',
					detail: 'password do not match',
				};
			}
			//modify user data
			dbResult.firstName = userData.firstName;
			dbResult.lastName = userData.lastName;
			dbResult.image = file
				? await CommonFunctions.fileUploader(file, 'users')
				: userData.image;
			dbResult.about = userData.about;
			dbResult.countryCode = userData.countryCode;
			dbResult.phoneNumber = userData.phoneNumber;
			dbResult.status = UserStatusEnum.confirmed;
			dbResult.registrationToken = null;
			dbResult.salt = bcrypt.genSaltSync();
			dbResult.password = `${md5(userData.password)}${dbResult.salt}`;
			dbResult.markModified('UserSchema');

			let updateResult = await dbResult.save();
			if (updateResult._id) {
				//send user mail confirmation
				this.mailSrv.SendEndUserRegistrationMail(
					`${userData.firstName} ${userData.lastName}`,
					dbResult.email
				);
				return Promise.resolve({
					code: 'success',
					detail: 'User registration ended successfully',
				});
			} else {
				return Promise.reject({
					code: 'notDataModified',
					detail: 'Data not updated',
				});
			}
		} catch (ex) {
			throw ex;
		}
	}

	private async closeAccount(
		userId: string,
		email: string,
		password: string
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: UserDocumentInterface = await UserSchema.findById(userId);
			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'user data not found',
				};
			}
			//check email
			if (email !== dbResult.email) {
				return {
					code: 'notDataFound',
					detail: 'user data not found',
				};
			}
			//check password
			if (dbResult.password !== `${md5(password)}${dbResult.salt}`) {
				return {
					code: 'notDataFound',
					detail: 'user data not found',
				};
			}
			const recoverAccountToken = randomString.generate();
			//modify user data
			dbResult.status = 'closed';
			dbResult.recoverAccountToken = recoverAccountToken;
			dbResult.salt = null;
			dbResult.password = null;
			dbResult.markModified('UserSchema');

			let updateResult = await dbResult.save();
			if (updateResult._id) {
				//send user mail confirmation
				this.mailSrv.SendCloseUserAccountMail(
					`${dbResult.firstName}`,
					dbResult.email,
					`${recoverAccountToken}cl17011${md5(dbResult.email)}`
				);

				return Promise.resolve({
					code: 'success',
					detail: 'User account closed successfully',
				});
			} else {
				return Promise.reject({
					code: 'notDataModified',
					detail: 'Data not updated',
				});
			}
		} catch (ex) {
			throw ex;
		}
	}

	private async recoverClosedAccount(
		recoverAccountToken: string,
		password: string,
		passwordConfirmation: string
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: UserDocumentInterface = await UserSchema.findOne({
				recoverAccountToken: recoverAccountToken.split('cl17011')[0],
			});
			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'User not found for registration',
				};
			}
			if (password.trim() !== passwordConfirmation.trim()) {
				return {
					code: 'error',
					detail: 'password do not match',
				};
			}
			//modify user data
			const salt = bcrypt.genSaltSync();
			dbResult.status = UserStatusEnum.confirmed;
			dbResult.recoverAccountToken = null;
			dbResult.salt = salt;
			dbResult.password = `${md5(password)}${salt}`;
			dbResult.markModified('UserSchema');

			let updateResult = await dbResult.save();
			if (updateResult._id) {
				//send user mail confirmation
				this.mailSrv.SendRecoverUserAccountMail(`${dbResult.firstName}`, dbResult.email);

				return Promise.resolve({
					code: 'success',
					detail: 'User account closed successfully',
				});
			} else {
				return Promise.reject({
					code: 'notDataModified',
					detail: 'Data not updated',
				});
			}
		} catch (error) {
			throw error;
		}
	}
}
