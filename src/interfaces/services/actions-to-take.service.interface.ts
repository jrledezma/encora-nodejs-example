import { ServiceResultInterface } from '../service-result.interface';

export interface ActionsToTakeServiceInterface {
  Activate(id: string, modificationUserId: string): Promise<ServiceResultInterface>;
  Inactivate(
    id: string,
    modificationUserId: string
  ): Promise<ServiceResultInterface>;
  GetAll(): Promise<ServiceResultInterface>;
  GetById(id: string): Promise<ServiceResultInterface>;
  Search(params: any): Promise<ServiceResultInterface>;
}
