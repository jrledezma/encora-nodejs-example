import { ServiceResultInterface } from "../service-result.interface";

export interface ClientCommunicationTrackingInvitationsServiceInterface {
	GetNewInvitationsByUser(userId: string): Promise<ServiceResultInterface>;
	GetByTracking(trackingId: string): Promise<ServiceResultInterface>;
	GetById(id: string): Promise<ServiceResultInterface>;
	GetStakeholderInvitation(
		invitationId: string,
		stakeholderId: string
	): Promise<ServiceResultInterface>;
	GetAllInvitationsByUser(userId: string): Promise<ServiceResultInterface>;
	GetInvitationsByInvitedBy(invitedBy: string): Promise<ServiceResultInterface>;
	GetInvitationsByStakeholder(
		stakehoder: string
	): Promise<ServiceResultInterface>;
	AcceptInvitation(
		invitationId: string,
		stakeholderId
	): Promise<ServiceResultInterface>;
	RejectInvitation(
		invitationId: string,
		stakeholderId
	): Promise<ServiceResultInterface>;
	StakeholdersLeave(
		invitationId: string,
		invitedby: string
	): Promise<ServiceResultInterface>;
}
