export interface ClientWayOfEntryModelInterface {
  _id: string;
  code: string;
  value: string;
  description: string;
  isActive: boolean;
  lastModificationUser?: any;
  lastModificationDate?: Date;
}
