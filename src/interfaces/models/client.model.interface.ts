import { ClientContactModelInterface } from './client-contact.model.interface';
import { ClientConfigurationModelInterface } from "./client-configuration.model.interface";

export interface ClientModelInterface {
  _id?: string;
  idNumber: string;
  companyName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  wayOfEntry: any;
  dateOfEntry: Date;
  comments?: string;
  contacts?: ClientContactModelInterface[];
  configuration?: ClientConfigurationModelInterface;
  isActive: boolean;
  createdBy: any;
  createdDate: Date;
  lastModificationUser?: any;
  lastModificationDate?: Date;
}
