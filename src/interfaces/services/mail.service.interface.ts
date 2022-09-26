import { ServiceResultInterface } from '../service-result.interface';
import { UserModelInterface } from '../models/user.model.Interface';

export interface MailServiceInterface {
	SendRecoveryPasswordMail(
		userData: UserModelInterface,
		recoveryUrl: string
	): Promise<ServiceResultInterface>;
	SendChangePasswordConfirmationMail(
		userData: UserModelInterface
	): Promise<ServiceResultInterface>;
	SendCreateUserConfirmationMail(
		userFullName: string,
		userEmail: string,
		registrationToken: string
	): Promise<ServiceResultInterface>;
	SendEndUserRegistrationMail(
		userFullName: string,
		userEmail: string
	): Promise<ServiceResultInterface>;
	SendClientCommunicationMail(
		isNew: boolean,
		trackinId: string,
		trackingType: string,
		emailToFirstName: string,
		emailTo: string,
		createdByInfo: any
	): Promise<ServiceResultInterface>;
	SendClientCommunicationCommentMail(
		userFirstName: string,
		trackinId: string,
		emailTo: string
	): Promise<ServiceResultInterface>;
	SendCloseUserAccountMail(
		userFirstName: string,
		userEmail: string,
		recoverAccountToken: string
	): Promise<ServiceResultInterface>;
	SendRecoverUserAccountMail(
		userFirstName: string,
		userEmail: string
	): Promise<ServiceResultInterface>;
	SendRecoverPasswordMail(
		userFirstName: string,
		userEmail: string
	): Promise<ServiceResultInterface>;
	SendInvitationAcceptedNotificationToStakeholder(
		userFirstName: string,
		companyName: string,
		trackinId: string,
		emailTo: string,
		stackeholderFullName: string
	): Promise<ServiceResultInterface>;
	SendInvitationAcceptedNotificationToOwner(
		userFirstName: string,
		companyName: string,
		trackinId: string,
		emailTo: string,
		stackeholderFullName: string,
		invitedByFullName: string,
		invitationDate: Date
	): Promise<ServiceResultInterface>;
	SendInvitationAcceptedNotification(
		userFirstName: string,
		companyName: string,
		trackinId: string,
		emailTo: string
	): Promise<ServiceResultInterface>;
	SendInvitationRejectedNotification(
		userFirstName: string,
		companyName: string,
		trackinId: string,
		stackeholderFullName: string,
		emailTo: string
	): Promise<ServiceResultInterface>;
	SendInvitationNotification(
		invitationType: string,
		userFirstName: string,
		invitedByFullName: string,
		invitationId: string,
		emailTo: string
	): Promise<ServiceResultInterface>;
	SendSignUpMail(
		userEmail: string,
		registrationToken: string
	): Promise<ServiceResultInterface>;
	SendStakeholderLeavesdNotification(
		userName: string,
		companyName: string,
		trackinId: string,
		stackeholderFullName: string,
		emailTo: string
	): Promise<ServiceResultInterface>;
	SendDealActionAttendedMail(
		trackinId: string,
		emailToFirstName: string,
		emailTo: string,
		attendedByInfo: string
	): Promise<ServiceResultInterface>;
}
