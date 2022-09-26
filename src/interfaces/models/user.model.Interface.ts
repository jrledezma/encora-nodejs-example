export interface UserModelInterface {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  countryCode?: string;
  phoneNumber?: string;
  image?: string;
  about?: string;
  registrationToken?: string;
  recoverAccountToken?: string;
  recoverPasswordToken?: string;
  salt?: string;
  password?: string;
  status?: string;
  isAdmin?: boolean;
  createdDate: Date;
  lastModificationDate: Date;
}
