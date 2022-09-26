import { ServiceResultInterface } from '../service-result.interface';
import { ClientDealTrackingModelInterface } from '../models';

export interface ClientDealsTrackingServiceInterface {
	Create(
		obj: ClientDealTrackingModelInterface,
		peopleToInvite?: any[],
		files?: any
	): Promise<ServiceResultInterface>;
	Modify(
		obj: ClientDealTrackingModelInterface,
		peopleToInvite?: any[],
		stakeholdersToRevokeInvitations?: string[],
		files?: any
	): Promise<ServiceResultInterface>;
	AttendDealAction(
		dealTrackingId: string,
		attentionDescription: string,
		userId: string,
		nextAction: ClientDealTrackingModelInterface,
		files?: any[]
	): Promise<ServiceResultInterface>;
	ArchiveDeal(trackingId: string, ownerId: string): Promise<ServiceResultInterface>;
	UnarchiveDeal(trackingId: string, ownerId: string): Promise<ServiceResultInterface>;
	GetAll(): Promise<ServiceResultInterface>;
	GetById(id: string, sessionUser: string): Promise<ServiceResultInterface>;
	Search(params: any): Promise<ServiceResultInterface>;
	TrackingByDeal(dealId: string, sessionUser: string): Promise<ServiceResultInterface>;
}
