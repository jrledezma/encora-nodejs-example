import { ServiceResultInterface } from '../service-result.interface';
import { ClientCommunicationTrackingCommentModelInterface } from '../models';

export interface ClientCommunicationTrackingCommentsServiceInterface {
  Create(obj: ClientCommunicationTrackingCommentModelInterface): Promise<ServiceResultInterface>;
  Activate(id: string): Promise<ServiceResultInterface>;
  Inactivate(id: string): Promise<ServiceResultInterface>;
  GetByCommunicationTracking(trackingId: string): Promise<ServiceResultInterface>;
  GetByUser(userId: string): Promise<ServiceResultInterface>;
  GetById(id: string): Promise<ServiceResultInterface>;
}
