import { ServiceResultInterface } from "../service-result.interface";
import { UserModelInterface } from "../models/user.model.Interface";

export interface AuthServiceInterface {
	SignUp(email: string): Promise<ServiceResultInterface>;
	Login(email: string, password: string): Promise<ServiceResultInterface>;
	GetUserSessionData(userId: string): Promise<ServiceResultInterface>;
	ChangePassword(
		userId: string,
		currentPassword: string,
		newPassword: string
	): Promise<ServiceResultInterface>;
	ForgotPassword(userEmail: string): Promise<ServiceResultInterface>;
	RecoverPassword(
		userEmail: string,
		newPassword: string
	): Promise<ServiceResultInterface>;
	VerifyRecoverPasswordToken(
		token: string
	): Promise<ServiceResultInterface>
	VerifyConfirmUserToken(token: string): Promise<ServiceResultInterface>;
	VerifyRecoverUserToken(token: string): Promise<ServiceResultInterface>;
	EndUserRegistration(
		userData: any,
		file: any
	): Promise<ServiceResultInterface>;
	CloseAccount(
		userId: string,
		email: string,
		password: string
	): Promise<ServiceResultInterface>;
	RecoverClosedAccount(
		recoverAccountToken: string,
		password: string,
		passwordConfirmation: string
	);
}
