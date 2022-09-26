import { ServiceResultInterface } from '../service-result.interface';

export interface ConfigValuesServiceInterface {
  UserStatus(): Promise<ServiceResultInterface>;
}
