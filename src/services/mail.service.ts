import { injectable, inject } from 'inversify';
import * as fs from 'fs';
import * as path from 'path';

import * as SendGrid from '@sendgrid/mail';

import { ServiceResultInterface } from '../interfaces/service-result.interface';
import { MailServiceInterface } from '../interfaces/services';
import { UserModelInterface } from '../interfaces/models';
import { content as recoveryPasswordTemplate } from '../html-mail-templates/forgot-password-template.html';
import { content as passwordChangeConfirmationTemplate } from '../html-mail-templates/password-change-confirmation-template.html';
import { content as createUserConfirmationTemplate } from '../html-mail-templates/create-user-confirmation-template.html';
import { content as endUserRegistrationTemplate } from '../html-mail-templates/end-user-registration-template.html';
import { content as newClientCommunicationTemplate } from '../html-mail-templates/new-client-communication-mail-template.html';
import { content as ClientCommunicationUpdateTemplate } from '../html-mail-templates/client-communication-updated-mail-template.html';
import { content as ClientCommunicationNewCommentTemplate } from '../html-mail-templates/client-communication-new-comment-mail-template.html';
import { content as CloseUserAccountTemplate } from '../html-mail-templates/close-user-account-template.html';
import { content as RecoverUserAccountTemplate } from '../html-mail-templates/recover-user-account-template.html';
import { content as RecoverPasswordTemplate } from '../html-mail-templates/recover-password-template.html';
import { content as invitationAcceptedNotificationForStakeholder } from '../html-mail-templates/client-tracking-invitation-accepted-stakeholder-mail-template.html';
import { content as invitationAcceptedNotificationForOwner } from '../html-mail-templates/client-tracking-invitation-accepted-owner-mail-template.html';
import { content as invitationAcceptedNotification } from '../html-mail-templates/client-tracking-invitation-accepted-mail-template.html';
import { content as invitationRejectedNotification } from '../html-mail-templates/client-tracking-invitation-rejected-stakeholder-mail-template.html';
import { content as clientTrackingStakeholderLeaves } from '../html-mail-templates/client-tracking-stakeholder-leaves-mail-template.html';
import { content as stakeholderInvitation } from '../html-mail-templates/stakeholder-invitation-mail-template.html';
import { content as stakeholderNoteInvitation } from '../html-mail-templates/stakeholder-note-invitation-mail-template.html';
import { content as signUpMail } from '../html-mail-templates/signup-confirmation-template.html';

import { content as dealActionAttendedTemplate } from '../html-mail-templates/deal-action-attended-mail-template.html';
import mail = require('@sendgrid/mail');

@injectable()
export class MailService implements MailServiceInterface {
	public SendRecoveryPasswordMail = this.sendRecoveryPasswordMail;
	public SendChangePasswordConfirmationMail = this.sendChangePasswordConfirmationMail;
	public SendCreateUserConfirmationMail = this.sendCreateUserConfirmationMail;
	public SendEndUserRegistrationMail = this.sendEndUserRegistrationMail;
	public SendClientCommunicationMail = this.sendClientCommunicationMail;
	public SendClientCommunicationCommentMail = this.sendClientCommunicationCommentMail;
	public SendCloseUserAccountMail = this.sendCloseUserAccountMail;
	public SendRecoverUserAccountMail = this.sendRecoverUserAccountMail;
	public SendRecoverPasswordMail = this.sendRecoverPasswordMail;
	public SendInvitationAcceptedNotificationToStakeholder = this
		.sendInvitationAcceptedNotificationToStakeholder;
	public SendInvitationAcceptedNotificationToOwner = this
		.sendInvitationAcceptedNotificationToOwner;
	public SendInvitationAcceptedNotification = this.sendInvitationAcceptedNotification;
	public SendInvitationRejectedNotification = this.sendInvitationRejectedNotification;
	public SendInvitationNotification = this.sendInvitationNotification;
	public SendSignUpMail = this.sendSignUpMail;
	public SendStakeholderLeavesdNotification = this.sendStakeholderLeavesdNotification;
	public SendDealActionAttendedMail = this.sendDealActionAttendedMail;

	constructor() {}

	private async sendRecoveryPasswordMail(
		userData: UserModelInterface,
		recoveryUrl: string
	): Promise<ServiceResultInterface> {
		try {
			let mailtemplate = await this.createRecoveryPasswordTemplate(userData, recoveryUrl);

			//send mail
			SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
			SendGrid.send(
				{
					isMultiple: false,
					to: userData.email,
					from: process.env.CONTACT_MAIL_FROM,
					subject: `Recuperación de Contaseña`,
					html: mailtemplate,
				},
				false,
				(error: any, result) => {
					if (error) {
						throw error;
					}
					return {
						code: 'success',
						detail: true,
					};
				}
			);
			return { code: '', detail: '' };
		} catch (ex) {
			console.log(ex);
		}
	}

	private async sendChangePasswordConfirmationMail(
		userData: UserModelInterface
	): Promise<ServiceResultInterface> {
		try {
			let mailtemplate = await this.createChangePasswordConfirmationTemplate(userData);

			//send mail
			SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
			SendGrid.send(
				{
					isMultiple: false,
					to: userData.email,
					from: process.env.CONTACT_MAIL_FROM,
					subject: `Cambio de Contaseña`,
					html: mailtemplate,
				},
				false,
				(error: any, result) => {
					if (error) {
						throw error;
					}
					return {
						code: 'success',
						detail: true,
					};
				}
			);
			return { code: '', detail: '' };
		} catch (ex) {
			console.log(ex);
		}
	}

	private async sendCreateUserConfirmationMail(
		userFullName: string,
		userEmail: string,
		registrationToken: string
	): Promise<ServiceResultInterface> {
		try {
			let mailtemplate = await this.createUserConfirmationTemplate(
				userFullName,
				registrationToken
			);
			//send mail
			SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
			SendGrid.send(
				{
					isMultiple: false,
					to: userEmail,
					from: process.env.CONTACT_MAIL_FROM,
					subject: `Has sido invitado a Clifoll`,
					html: mailtemplate,
				},
				false,
				(error: any, result) => {
					if (error) {
						throw error;
					}
					return {
						code: 'success',
						detail: true,
					};
				}
			);
			return { code: '', detail: '' };
		} catch (ex) {
			console.log(ex);
		}
	}

	private async sendSignUpMail(
		userEmail: string,
		registrationToken: string
	): Promise<ServiceResultInterface> {
		try {
			let mailtemplate = await this.createSignUpTemplate(registrationToken);
			//send mail
			SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
			SendGrid.send(
				{
					isMultiple: false,
					to: userEmail,
					from: process.env.CONTACT_MAIL_FROM,
					subject: `Finaliza tu registro en Clifoll`,
					html: mailtemplate,
				},
				false,
				(error: any, result) => {
					if (error) {
						throw error;
					}
					return {
						code: 'success',
						detail: true,
					};
				}
			);
			return { code: '', detail: '' };
		} catch (ex) {
			console.log(ex);
		}
	}

	private async sendEndUserRegistrationMail(
		userFullName: string,
		userEmail: string
	): Promise<ServiceResultInterface> {
		try {
			let mailtemplate = await this.createEndingUserRegistrationTemplate(userFullName);
			//send mail
			SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
			SendGrid.send(
				{
					isMultiple: false,
					to: userEmail,
					from: process.env.CONTACT_MAIL_FROM,
					subject: `Has finalizado el registro de tu cuenta en Clifoll`,
					html: mailtemplate,
				},
				false,
				(error: any, result) => {
					if (error) {
						throw error;
					}
					return {
						code: 'success',
						detail: true,
					};
				}
			);
			return { code: '', detail: '' };
		} catch (ex) {
			console.log(ex);
		}
	}

	private async sendClientCommunicationMail(
		isNew: boolean,
		trackinId: string,
		trackingType: string,
		emailToFirstName: string,
		emailTo: string,
		createdByInfo: string
	): Promise<ServiceResultInterface> {
		try {
			//send mail
			let mailSubject = '';
			switch (trackingType) {
				case '0001':
					mailSubject = isNew
						? `Nueva Comunicación con Cliente`
						: `Actualización en Comunicación con Cliente`;
					break;
				case '0002':
					mailSubject = isNew
						? `Nueva Comunicación con Cliente`
						: `Actualización en Comunicación con Cliente`;
					break;
			}

			let mailtemplate = await this.createNewCommunicationTemplate(
				isNew,
				trackinId,
				trackingType,
				emailToFirstName,
				createdByInfo
			);
			SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
			SendGrid.send(
				{
					isMultiple: false,
					to: emailTo,
					from: process.env.CONTACT_MAIL_FROM,
					subject: mailSubject,
					html: mailtemplate,
				},
				false,
				(error: any, result) => {
					if (error) {
						throw error;
					}
					return {
						code: 'success',
						detail: true,
					};
				}
			);
			return { code: '', detail: '' };
		} catch (ex) {
			console.log(ex);
		}
	}

	private async sendClientCommunicationCommentMail(
		userFirstName: string,
		trackinId: string,
		emailTo: string
	): Promise<ServiceResultInterface> {
		try {
			//send mail
			let mailtemplate = await this.createCommunicationNewCommentTemplate(
				userFirstName,
				trackinId
			);
			SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
			SendGrid.send(
				{
					isMultiple: false,
					to: emailTo,
					from: process.env.CONTACT_MAIL_FROM,
					subject: 'Nuevo Comentario en Seguimiento a Cliente',
					html: mailtemplate,
				},
				false,
				(error: any, result) => {
					if (error) {
						throw error;
					}
					return {
						code: 'success',
						detail: true,
					};
				}
			);
			return { code: '', detail: '' };
		} catch (ex) {
			console.log(ex);
		}
	}

	private async sendCloseUserAccountMail(
		userFullName: string,
		userEmail: string,
		recoverAccountToken: string
	): Promise<ServiceResultInterface> {
		try {
			let mailtemplate = await this.createCloseUserAccountTemplate(
				userFullName,
				recoverAccountToken
			);
			//send mail
			SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
			SendGrid.send(
				{
					isMultiple: false,
					to: userEmail,
					from: process.env.CONTACT_MAIL_FROM,
					subject: `Has cerrado tu cuenta en Clifoll`,
					html: mailtemplate,
				},
				false,
				(error: any, result) => {
					if (error) {
						throw error;
					}
					return {
						code: 'success',
						detail: true,
					};
				}
			);
			return { code: '', detail: '' };
		} catch (ex) {
			console.log(ex);
		}
	}

	private async sendRecoverUserAccountMail(
		userFirstName: string,
		userEmail: string
	): Promise<ServiceResultInterface> {
		try {
			let mailtemplate = await this.createRecoverUserAccountTemplate(userFirstName);
			//send mail
			SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
			SendGrid.send(
				{
					isMultiple: false,
					to: userEmail,
					from: process.env.CONTACT_MAIL_FROM,
					subject: `Has Recuperado tu cuenta en Clifoll`,
					html: mailtemplate,
				},
				false,
				(error: any, result) => {
					if (error) {
						throw error;
					}
					return {
						code: 'success',
						detail: true,
					};
				}
			);
			return { code: '', detail: '' };
		} catch (ex) {
			console.log(ex);
		}
	}

	private async sendRecoverPasswordMail(
		userFirstName: string,
		userEmail: string
	): Promise<ServiceResultInterface> {
		try {
			let mailtemplate = await this.createRecoverPasswordTemplate(userFirstName);
			//send mail
			SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
			SendGrid.send(
				{
					isMultiple: false,
					to: userEmail,
					from: process.env.CONTACT_MAIL_FROM,
					subject: `Has Recuperado tu password en Clifoll`,
					html: mailtemplate,
				},
				false,
				(error: any, result) => {
					if (error) {
						throw error;
					}
					return {
						code: 'success',
						detail: true,
					};
				}
			);
			return { code: '', detail: '' };
		} catch (ex) {
			console.log(ex);
		}
	}

	private async sendInvitationAcceptedNotificationToStakeholder(
		userFirstName: string,
		companyName: string,
		trackinId: string,
		emailTo: string,
		stakeholderFullName: string
	): Promise<ServiceResultInterface> {
		try {
			let mailtemplate = await this.createInvitationAcceptedNotificationForStakholder(
				userFirstName,
				companyName,
				trackinId,
				stakeholderFullName
			);
			//send mail
			SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
			SendGrid.send(
				{
					isMultiple: false,
					to: emailTo,
					from: process.env.CONTACT_MAIL_FROM,
					subject: `Invitación de Interesado Acceptada`,
					html: mailtemplate,
				},
				false,
				(error: any, result) => {
					if (error) {
						throw error;
					}
					return {
						code: 'success',
						detail: true,
					};
				}
			);
			return { code: '', detail: '' };
		} catch (ex) {
			console.log(ex);
		}
	}

	private async sendInvitationNotification(
		invitationType: string,
		userFirstName: string,
		invitedByFullName: string,
		invitationId: string,
		emailTo: string
	): Promise<ServiceResultInterface> {
		try {
			let mailtemplate = await this.createStakeholderInvitation(
				invitationType,
				userFirstName,
				invitedByFullName,
				invitationId
			);
			//send mail
			SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
			SendGrid.send(
				{
					isMultiple: false,
					to: emailTo,
					from: process.env.CONTACT_MAIL_FROM,
					subject: `Nueva Invitación Recibida`,
					html: mailtemplate,
				},
				false,
				(error: any, result) => {
					if (error) {
						throw error;
					}
					return {
						code: 'success',
						detail: true,
					};
				}
			);
			return { code: '', detail: '' };
		} catch (ex) {
			console.log(ex);
		}
	}

	private async sendInvitationAcceptedNotificationToOwner(
		userFirstName: string,
		companyName: string,
		trackinId: string,
		emailTo: string,
		stakeholderFullName: string,
		invitedByFullName: string,
		invitationDate: Date
	): Promise<ServiceResultInterface> {
		try {
			let mailtemplate = await this.createInvitationAcceptedNotificationForOwner(
				userFirstName,
				companyName,
				trackinId,
				stakeholderFullName,
				invitedByFullName,
				invitationDate
			);
			//send mail
			SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
			SendGrid.send(
				{
					isMultiple: false,
					to: emailTo,
					from: process.env.CONTACT_MAIL_FROM,
					subject: `Invitación de Interesado Acceptada`,
					html: mailtemplate,
				},
				false,
				(error: any, result) => {
					if (error) {
						throw error;
					}
					return {
						code: 'success',
						detail: true,
					};
				}
			);
			return { code: '', detail: '' };
		} catch (ex) {
			console.log(ex);
		}
	}

	private async sendInvitationAcceptedNotification(
		userFirstName: string,
		companyName: string,
		trackinId: string,
		emailTo: string
	): Promise<ServiceResultInterface> {
		try {
			let mailtemplate = await this.createInvitationAcceptedNotification(
				userFirstName,
				companyName,
				trackinId
			);
			//send mail
			SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
			SendGrid.send(
				{
					isMultiple: false,
					to: emailTo,
					from: process.env.CONTACT_MAIL_FROM,
					subject: `Invitación de Interesado Acceptada`,
					html: mailtemplate,
				},
				false,
				(error: any, result) => {
					if (error) {
						throw error;
					}
					return {
						code: 'success',
						detail: true,
					};
				}
			);
			return { code: '', detail: '' };
		} catch (ex) {
			console.log(ex);
		}
	}

	private async sendInvitationRejectedNotification(
		userFirstName: string,
		companyName: string,
		trackinId: string,
		stakeholderFullName: string,
		emailTo: string
	): Promise<ServiceResultInterface> {
		try {
			let mailtemplate = await this.createInvitationRejectedNotification(
				userFirstName,
				companyName,
				trackinId,
				stakeholderFullName
			);
			//send mail
			SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
			SendGrid.send(
				{
					isMultiple: false,
					to: emailTo,
					from: process.env.CONTACT_MAIL_FROM,
					subject: `Invitación de Interesado Rechazada`,
					html: mailtemplate,
				},
				false,
				(error: any, result) => {
					if (error) {
						throw error;
					}
					return {
						code: 'success',
						detail: true,
					};
				}
			);
			return { code: '', detail: '' };
		} catch (ex) {
			console.log(ex);
		}
	}

	private async sendStakeholderLeavesdNotification(
		userName: string,
		companyName: string,
		trackinId: string,
		stakeholderFullName: string,
		emailTo: string
	): Promise<ServiceResultInterface> {
		try {
			let mailtemplate = await this.createStakeholderLeavesdNotification(
				userName,
				companyName,
				trackinId,
				stakeholderFullName
			);
			//send mail
			SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
			SendGrid.send(
				{
					isMultiple: false,
					to: emailTo,
					from: process.env.CONTACT_MAIL_FROM,
					subject: `Un Interesado ha Abandonado uno de tus Seguimiento`,
					html: mailtemplate,
				},
				false,
				(error: any, result) => {
					if (error) {
						throw error;
					}
					return {
						code: 'success',
						detail: true,
					};
				}
			);
			return { code: '', detail: '' };
		} catch (ex) {
			console.log(ex);
		}
	}

	private async sendDealActionAttendedMail(
		trackinId: string,
		emailToFirstName: string,
		emailTo: string,
		attendedByInfo: string
	): Promise<ServiceResultInterface> {
		try {
			//send mail
			let mailSubject = `Atención a Acción de un Trato Realizada`;

			let mailtemplate = await this.createDealActionAttendedTemplate(
				trackinId,
				emailToFirstName,
				attendedByInfo
			);
			SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
			SendGrid.send(
				{
					isMultiple: false,
					to: emailTo,
					from: process.env.CONTACT_MAIL_FROM,
					subject: mailSubject,
					html: mailtemplate,
				},
				false,
				(error: any, result) => {
					if (error) {
						throw error;
					}
					return {
						code: 'success',
						detail: true,
					};
				}
			);
			return { code: '', detail: '' };
		} catch (ex) {
			console.log(ex);
		}
	}

	private async createRecoveryPasswordTemplate(
		userData: UserModelInterface,
		recoveryUrl: string
	): Promise<string> {
		let mailtemplate = recoveryPasswordTemplate;
		//set client data
		return mailtemplate
			.replace('{{userFirstName}}', userData.firstName)
			.replace('{{recoveryPasswordURL}}', recoveryUrl);
	}

	private async createChangePasswordConfirmationTemplate(
		userData: UserModelInterface
	): Promise<string> {
		let mailtemplate = passwordChangeConfirmationTemplate;
		//set client data
		return mailtemplate.replace('{{userFirstName}}', userData.firstName);
	}

	private async createUserConfirmationTemplate(
		fullUserName: string,
		registrationToken: string
	): Promise<string> {
		let mailtemplate = createUserConfirmationTemplate;
		//set client data
		return mailtemplate
			.replace('{{fullUserName}}', `${fullUserName}`)
			.replace(
				'{{userConfirmationURL}}',
				`${process.env.REGISTER_USER_URL}/${registrationToken}`
			);
	}

	private async createSignUpTemplate(registrationToken: string): Promise<string> {
		let mailtemplate = signUpMail;
		//set client data
		return mailtemplate.replace(
			'{{userConfirmationURL}}',
			`${process.env.REGISTER_USER_URL}/${registrationToken}`
		);
	}

	private async createEndingUserRegistrationTemplate(
		fullUserName: string
	): Promise<string> {
		let mailtemplate = endUserRegistrationTemplate;
		//set client data
		return mailtemplate.replace('{{userFirstName}}', `${fullUserName}`);
	}

	private async createCloseUserAccountTemplate(
		userFirstName: string,
		recoverAccountToken: string
	): Promise<string> {
		let mailtemplate = CloseUserAccountTemplate;
		//set client data
		return mailtemplate
			.replace('{{userFirstName}}', userFirstName)
			.replace(
				'{{recoverAccountToken}}',
				`${process.env.RECOVER_ACCOUNT_URL}/${recoverAccountToken}`
			);
	}

	private async createRecoverUserAccountTemplate(userFirstName: string): Promise<string> {
		let mailtemplate = RecoverUserAccountTemplate;
		//set client data
		return mailtemplate.replace('{{userFirstName}}', `${userFirstName}`);
	}

	private async createRecoverPasswordTemplate(userFirstName: string): Promise<string> {
		let mailtemplate = RecoverPasswordTemplate;
		//set client data
		return mailtemplate.replace('{{userFirstName}}', `${userFirstName}`);
	}

	private async createNewCommunicationTemplate(
		isNew: boolean,
		trackinId: string,
		trackingType: string,
		userFirstName: string,
		createdByInfo: string
	): Promise<string> {
		let mailBody = '';
		switch (trackingType) {
			case '0001':
				mailBody = isNew
					? `Te informamos que ${createdByInfo} ha creado una Comunicación con un cliente que es de tu intéres`
					: `Te informamos que ${createdByInfo} ha modificado la información acerca de una comunicación con un cliente que es de su intéres`;
				break;
			case '0002':
				mailBody = isNew
					? `Te informamos que ${createdByInfo} ha creado una Nota de un cliente que es de su intéres`
					: `Te informamos que ${createdByInfo} ha modificado la información acerca de una Nota de un cliente que es de su intéres`;
				break;
		}

		let mailtemplate = isNew
			? newClientCommunicationTemplate
			: ClientCommunicationUpdateTemplate;
		//set client data
		return mailtemplate
			.replace('{{userFirstName}}', `${userFirstName}`)
			.replace('{{mailBody}}', mailBody)
			.replace(
				'{{trackingDetailURL}}',
				`${process.env.TRACKING_DETAIL_URL}/${trackinId}`
			);
	}

	private async createCommunicationNewCommentTemplate(
		userFirstName: string,
		trackinId: string
	): Promise<string> {
		let mailBody = '',
			mailtemplate = ClientCommunicationNewCommentTemplate;
		//set client data
		return mailtemplate
			.replace('{{userFirstName}}', userFirstName)
			.replace(
				'{{trackingDetailURL}}',
				`${process.env.TRACKING_DETAIL_URL}/${trackinId}`
			);
	}

	private async createInvitationAcceptedNotificationForStakholder(
		userFirstName: string,
		companyName: string,
		trackinId: string,
		stakeholderFullName: string
	): Promise<string> {
		let mailtemplate = invitationAcceptedNotificationForStakeholder;
		//set client data
		return mailtemplate
			.replace('{{userFirstName}}', userFirstName)
			.replace('{{companyName}}', companyName)
			.replace('{{trackingDetailURL}}', `${process.env.TRACKING_DETAIL_URL}/${trackinId}`)
			.replace('{{stakeholderFullName}}', stakeholderFullName);
	}

	private async createInvitationAcceptedNotificationForOwner(
		userFirstName: string,
		companyName: string,
		trackinId: string,
		stakeholderFullName: string,
		invitedByFullName: string,
		invitationDate: Date
	): Promise<string> {
		let mailtemplate = invitationAcceptedNotificationForOwner;
		//set client data
		return mailtemplate
			.replace('{{userFirstName}}', userFirstName)
			.replace('{{companyName}}', companyName)
			.replace('{{trackingDetailURL}}', `${process.env.TRACKING_DETAIL_URL}/${trackinId}`)
			.replace('{{stakeholderFullName}}', stakeholderFullName)
			.replace('{{invitedByFullName}}', invitedByFullName)
			.replace('{{invitationDate}}', invitationDate.toISOString());
	}

	private async createInvitationAcceptedNotification(
		userFirstName: string,
		companyName: string,
		trackinId: string
	): Promise<string> {
		let mailtemplate = invitationAcceptedNotification;
		//set client data
		return mailtemplate
			.replace('{{userFirstName}}', userFirstName)
			.replace('{{companyName}}', companyName)
			.replace(
				'{{trackingDetailURL}}',
				`${process.env.TRACKING_DETAIL_URL}/${trackinId}`
			);
	}

	private async createInvitationRejectedNotification(
		userFirstName: string,
		companyName: string,
		trackinId: string,
		stakeholderFullName: string
	): Promise<string> {
		let mailtemplate = invitationRejectedNotification;
		//set client data
		return mailtemplate
			.replace('{{userFirstName}}', userFirstName)
			.replace('{{companyName}}', companyName)
			.replace('{{stakeholderFullName}}', stakeholderFullName)
			.replace(
				'{{trackingDetailURL}}',
				`${process.env.TRACKING_DETAIL_URL}/${trackinId}`
			);
	}

	private async createStakeholderLeavesdNotification(
		userFirstName: string,
		companyName: string,
		trackinId: string,
		stakeholderFullName: string
	): Promise<string> {
		let mailtemplate = clientTrackingStakeholderLeaves;
		//set client data
		return mailtemplate
			.replace('{{userFirstName}}', userFirstName)
			.replace('{{companyName}}', companyName)
			.replace('{{stakeholderFullName}}', stakeholderFullName)
			.replace(
				'{{trackingDetailURL}}',
				`${process.env.TRACKING_DETAIL_URL}/${trackinId}`
			);
	}

	private async createStakeholderInvitation(
		invitationType: string,
		userFirstName: string,
		invitedByFullName: string,
		invitationId: string
	): Promise<string> {
		let mailtemplate = '';
		switch (invitationType) {
			case 'note':
				mailtemplate = stakeholderNoteInvitation;
				break;
			case 'note':
				mailtemplate = stakeholderInvitation;
				break;
			default:
				throw new Error('invitationType not implemented');
		}
		//set client data
		return mailtemplate
			.replace('{{userFirstName}}', userFirstName)
			.replace('{{invitedByFullName}}', invitedByFullName)
			.replace(
				'{{invitationDetailURL}}',
				`${process.env.INVITATION_DETAIL_URL}/${invitationId}`
			);
	}

	private async createDealActionAttendedTemplate(
		trackinId: string,
		userFirstName: string,
		attendedBy: string
	): Promise<string> {
		let mailBody = '';
		mailBody = `Te informamos que ${attendedBy} ha atendido una acción relacionada a uno de tus tratos`;

		let mailtemplate = dealActionAttendedTemplate;
		//set client data
		return mailtemplate
			.replace('{{userFirstName}}', `${userFirstName}`)
			.replace('{{mailBody}}', mailBody)
			.replace('{{trackingDetailURL}}', `${process.env.DEAL_DETAIL_URL}/${trackinId}`);
	}
}
