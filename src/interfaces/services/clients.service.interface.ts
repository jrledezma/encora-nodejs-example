import { ServiceResultInterface } from '../service-result.interface';
import { ClientModelInterface, ClientContactModelInterface } from '../models/';

export interface ClientsServiceInterface {
	Create(obj: ClientModelInterface): Promise<ServiceResultInterface>;
	Modify(obj: ClientModelInterface): Promise<ServiceResultInterface>;
	AddModifyContact(
		clientId: string,
		contact: ClientContactModelInterface,
		userId: string
	): Promise<ServiceResultInterface>;
	Activate(id: string): Promise<ServiceResultInterface>;
	Inactivate(id: string): Promise<ServiceResultInterface>;
	GetAll(createdBy: string): Promise<ServiceResultInterface>;
	GetById(id: string, createdBy: string): Promise<ServiceResultInterface>;
	GetContacts(customerId: string): Promise<ServiceResultInterface>;
	Search(params: any, createdBy: string): Promise<ServiceResultInterface>;
	ValidateIdNumber(idNumber: string): Promise<ServiceResultInterface>;
}
