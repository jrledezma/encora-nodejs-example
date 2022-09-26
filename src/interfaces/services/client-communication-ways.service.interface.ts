import { ServiceResultInterface } from '../service-result.interface';

export interface ClientCommunicationWaysServiceInterface {
  Activate(id: string, modificationUserId: string): Promise<ServiceResultInterface>;
  Inactivate(
    id: string,
    modificationUserId: string
  ): Promise<ServiceResultInterface>;
  GetAll(): Promise<ServiceResultInterface>;
  GetById(id: string): Promise<ServiceResultInterface>;
  Search(params: any): Promise<ServiceResultInterface>;
}
