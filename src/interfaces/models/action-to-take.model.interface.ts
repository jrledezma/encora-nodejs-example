export interface ActionToTakeModelInterface {
  _id: string;
  value: string;
  description: string;
  isActive: boolean;
  lastModificationUser?: any;
  lastModificationDate?: Date;
}
