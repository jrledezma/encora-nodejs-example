import { ServiceResultInterface } from '../service-result.interface';

export interface ProjectStatusesServiceInterface {
  GetAll(): Promise<ServiceResultInterface>;
  Activate(id: string, modificationUserId: string): Promise<ServiceResultInterface>;
  Inactivate(
    id: string,
    modificationUserId: string
  ): Promise<ServiceResultInterface>;
  GetById(id: string): Promise<ServiceResultInterface>;
  Search(params: any): Promise<ServiceResultInterface>;
}
