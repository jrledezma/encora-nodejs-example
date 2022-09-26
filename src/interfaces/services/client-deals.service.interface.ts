import { ServiceResultInterface } from '../service-result.interface';
import { ClientDealModelInterface } from '../models';

export interface ClientDealsServiceInterface {
	Create(obj: any, peopleToInvite?: any[], files?: any): Promise<ServiceResultInterface>;
	Modify(
		clientDealObject: any,
		clientDealTrackingObject: any,
		peopleToInvite?: any[],
		files?: any
	): Promise<ServiceResultInterface>;
	LeaveDeal(dealId: string, stakeholderId: string): Promise<ServiceResultInterface>;
	ArchiveDeal(dealId: string, ownerId: string): Promise<ServiceResultInterface>;
	UnarchiveDeal(dealId: string, ownerId: string): Promise<ServiceResultInterface>;
	GetAll(): Promise<ServiceResultInterface>;
	GetById(id: string, sessionUser: string): Promise<ServiceResultInterface>;
	Search(params: any): Promise<ServiceResultInterface>;
	GetClients(sessionUser: string, params?: any): Promise<ServiceResultInterface>;
	DealsByClient(clientId: string, sessionUser: string): Promise<ServiceResultInterface>;
	ValidateReferenceCode(
		referenceCode: string,
		userId: string
	): Promise<ServiceResultInterface>;
}
