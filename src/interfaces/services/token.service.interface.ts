import { ServiceResultInterface } from '../service-result.interface';

export interface TokenServiceInterface {
  Generate(payload: any, durationTimeIn_ms: number): Promise<ServiceResultInterface>
}
