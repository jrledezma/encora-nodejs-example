import { StakeholderConfigurationModelInterface } from './stakeholder-configuration.model.interface';
import { ClientTrackingChangesLogModelInterface } from './client-tracking-changes-log.model.interface';

export interface ClientNoteModelInterface {
  _id?: string;
  noteType: any;
  client: any;
  title: string;
  voiceMediaUrl?: string;
  images?: string[];
  comments?: string;
  stakeHolders?: any[] | string[];
  stakeholdersConfiguration: StakeholderConfigurationModelInterface;
  createdBy: any;
  createdDate: Date;
  lastModificationUser?: any;
  lastModificationDate?: Date;
  changesLog?: ClientTrackingChangesLogModelInterface[];
  isArchived?: boolean;
}
