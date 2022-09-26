import { ServiceResultInterface } from "../service-result.interface";
import { UserModelInterface } from "../models/user.model.Interface";

export interface UserServiceInterface {
	Create(
		newUserEmail: string,
		createdBy?: string
	): Promise<ServiceResultInterface>;
	CreateForSignUp(newUserEmail: string): Promise<ServiceResultInterface>;
	Modify(obj: UserModelInterface, file: any): Promise<ServiceResultInterface>;
	ValidateUserEmail(email: string): Promise<ServiceResultInterface>;
	GetByID(_id: string): Promise<ServiceResultInterface>;
	Search(filters: string): Promise<ServiceResultInterface>;
}
