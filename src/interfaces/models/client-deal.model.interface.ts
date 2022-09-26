import { StakeholderConfigurationModelInterface } from './stakeholder-configuration.model.interface';
import { ClientTrackingChangesLogModelInterface } from './client-tracking-changes-log.model.interface';

export interface ClientDealModelInterface {
  _id?: string;
  client: any;
  referenceCode: string;
  title: string;
  comments: string;
  mediaUrls?: string[];
  teamMembers?: any[] | string[];
  createdBy: any;
  createdDate: Date;
  lastModificationUser?: any;
  lastModificationDate?: Date;
  isArchived?: boolean;
}
