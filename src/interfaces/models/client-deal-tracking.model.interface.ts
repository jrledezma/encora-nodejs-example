import { StakeholderConfigurationModelInterface } from './stakeholder-configuration.model.interface';
import { ClientTrackingChangesLogModelInterface } from './client-tracking-changes-log.model.interface';

export interface ClientDealTrackingModelInterface {
	_id?: string;
	deal: any;
	actionToTake: any;
	clientContact?: any;
	scheduleDate: string;
	scheduleHour: string;
	comments: string;
	mediaUrl?: string[];
	teamMemberInCharge?: any[] | string[];
	attentionDescription?: string;
	attentedBy?: any;
	attentionDate?: Date;
	createdBy: any;
	createdDate: Date;
	lastModificationUser?: any;
	lastModificationDate?: Date;
	isArchived?: boolean;
}
