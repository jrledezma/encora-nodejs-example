export interface ClientContactModelInterface {
  idNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  cellPhone?: string;
  comments?: string;
  createdBy: any;
  createdDate: Date;
  lastModificationUser?: any;
  lastModificationDate?: Date;
}
