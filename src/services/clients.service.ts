import { injectable } from 'inversify';

import { ClientDocumentInterface, ClientSchema } from '../models/index';
import { ServiceResultInterface } from '../interfaces/service-result.interface';
import { ClientsServiceInterface } from '../interfaces/services';
import { ClientModelInterface, ClientContactModelInterface } from '../interfaces/models';
import { CommonFunctions } from '../common';

let _ = require('lodash');

@injectable()
export class ClientsService implements ClientsServiceInterface {
	//#region Public Properties

	public Create = this.create;
	public Modify = this.modify;
	public AddModifyContact = this.addModifyContact;
	public GetContacts = this.getContacts;
	public Activate = this.activate;
	public Inactivate = this.inactivate;
	public GetAll = this.getAll;
	public GetById = this.getById;
	public Search = this.search;
	public ValidateIdNumber = this.validateIdNumber;

	//#endregion

	private dbDocument: ClientDocumentInterface;
	private selectableFields = [
		'idNumber',
		'companyName',
		'email',
		'phoneNumber',
		'address',
		'wayOfEntry',
		'dateOfEntry',
		'comments',
		'contacts',
		'configuration',
		'isActive',
		'createdBy',
		'createdDate',
		'lastModificationUser',
		'lastModificationDate',
	];

	public constructor() {}

	private async create(
		objToCreate: ClientModelInterface
	): Promise<ServiceResultInterface> {
		try {
			const data: ClientDocumentInterface = await ClientSchema.findOne({
				value: objToCreate.idNumber,
			});
			if (data) {
				return {
					code: 'idNumberAlreadyExists',
					detail: 'The ID Number is already registered in the data base',
				};
			}
			//process contacts
			objToCreate.contacts?.forEach((contact) => {
				contact.createdBy = objToCreate.createdBy;
				contact.createdDate = new Date();
			});
			this.dbDocument = new ClientSchema({
				idNumber: objToCreate.idNumber,
				companyName: objToCreate.companyName,
				email: objToCreate.email,
				phoneNumber: objToCreate.phoneNumber,
				address: objToCreate.address,
				wayOfEntry: objToCreate.wayOfEntry,
				dateOfEntry: new Date(
					CommonFunctions.createZeroHoursUTCDate(objToCreate.dateOfEntry)
				),
				comments: objToCreate.comments,
				contacts: objToCreate.contacts,
				configuration: objToCreate.configuration,
				isActive: objToCreate.isActive,
				createdBy: objToCreate.createdBy,
				createdDate: new Date(),
			});
			const insertResult = await this.dbDocument.save({
				validateBeforeSave: true,
			});
			if (!insertResult) {
				return {
					code: 'error',
					detail: 'any data was creted',
				};
			}
			return {
				code: 'success',
				detail: insertResult,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async modify(
		objToModify: ClientModelInterface
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientDocumentInterface = await ClientSchema.findById(
				objToModify._id
			);
			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'Data not found for update',
				};
			}
			//process contact info
			objToModify.contacts?.forEach((contact) => {
				let contactExists = false;
				dbResult.contacts?.forEach((existingClientContact) => {
					if (!_.isEqual(existingClientContact, contact)) {
						contact.lastModificationUser = objToModify.lastModificationUser;
						contact.lastModificationDate = new Date();
						contactExists = true;
					}
				});
				if (!contactExists) {
					contact.createdBy = objToModify.lastModificationUser;
					contact.createdDate = new Date();
				}
			});

			dbResult.idNumber = objToModify.idNumber;
			dbResult.companyName = objToModify.companyName;
			dbResult.email = objToModify.email;
			dbResult.phoneNumber = objToModify.phoneNumber;
			dbResult.address = objToModify.address;
			dbResult.wayOfEntry = objToModify.wayOfEntry;
			dbResult.dateOfEntry = new Date(
				CommonFunctions.createZeroHoursUTCDate(objToModify.dateOfEntry)
			);
			dbResult.comments = objToModify.comments;
			dbResult.contacts = objToModify.contacts;
			dbResult.configuration = objToModify.configuration;
			dbResult.isActive = objToModify.isActive;
			dbResult.lastModificationUser = objToModify.lastModificationUser;
			dbResult.lastModificationDate = new Date();
			dbResult.markModified('ClientSchema');

			let updateResult = await dbResult.save();
			if (updateResult._id) {
				return Promise.resolve({
					code: 'success',
					detail: 'Data updated successfully',
				});
			} else {
				return Promise.reject({
					code: 'notDataModified',
					detail: 'Data not updated',
				});
			}
		} catch (ex) {
			throw ex;
		}
	}

	private async addModifyContact(
		clientId: string,
		newContact: ClientContactModelInterface,
		userId: string
	): Promise<ServiceResultInterface> {
		try {
			//get client contacts
			const clientInfo: ClientDocumentInterface = await ClientSchema.findById(clientId);
			if (!clientInfo) {
				return {
					code: 'notDataFound',
					detail: 'Client not found',
				};
			}
			let contactFound = false;
			clientInfo.contacts = clientInfo.contacts?.map((clientContact) => {
				if (newContact.idNumber === clientContact.idNumber) {
					clientContact = newContact;
					clientContact.lastModificationUser = userId;
					clientContact.lastModificationDate = new Date();
					contactFound = true;
					return clientContact;
				}
			});
			if (!contactFound) {
				newContact.createdBy = userId;
				newContact.createdDate = new Date();
				if (!clientInfo.contacts) {
					clientInfo.contacts = [];
				}
				clientInfo.contacts.push(newContact);
			}
			const modificationResult = await clientInfo.save();
			if (modificationResult._id) {
				return Promise.resolve({
					code: 'success',
					detail: 'Data updated successfully',
				});
			} else {
				return Promise.reject({
					code: 'notDataModified',
					detail: 'Data not updated',
				});
			}
		} catch (ex) {
			throw ex;
		}
	}

	private async getContacts(clientId: string): Promise<ServiceResultInterface> {
		try {
			const dbResult = await ClientSchema.findOne({
				_id: clientId,
			}).select(['contacts']);
			return {
				code: 'success',
				detail: dbResult ? dbResult.contacts : null,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async activate(_id: string): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientDocumentInterface = await ClientSchema.findById(_id);
			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'Data not found for inactivation',
				};
			}
			dbResult.isActive = true;
			dbResult.markModified('ClientSchema');

			let updateResult = await dbResult.save();
			if (updateResult._id) {
				return {
					code: 'success',
					detail: 'Data inactivated successfully',
				};
			} else {
				return {
					code: 'notDataModified',
					detail: 'Data not inactivated',
				};
			}
		} catch (ex) {
			throw ex;
		}
	}

	private async inactivate(_id: string): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientDocumentInterface = await ClientSchema.findById(_id);
			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'Data not found for inactivation',
				};
			}
			dbResult.isActive = false;
			dbResult.markModified('ClientSchema');

			let updateResult = await dbResult.save();
			if (updateResult._id) {
				return {
					code: 'success',
					detail: 'Data inactivated successfully',
				};
			} else {
				return {
					code: 'notDataModified',
					detail: 'Data not inactivated',
				};
			}
		} catch (ex) {
			throw ex;
		}
	}

	private async getAll(createdBy: string): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientDocumentInterface[] = await ClientSchema.find({
				createdBy,
			})
				.populate({
					path: 'wayOfEntry',
				})
				.select(this.selectableFields)
				.sort({ value: 'asc' });
			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}
			return {
				code: 'success',
				detail: dbResult,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async getById(id: string, createdBy: string): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientDocumentInterface[] = await ClientSchema.find({
				_id: id,
				createdBy,
			}).select(this.selectableFields);
			if (!dbResult.length) {
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}
			return {
				code: 'success',
				detail: dbResult[0],
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async search(params: any, createdBy: string): Promise<ServiceResultInterface> {
		try {
			let paramsResult: any = CommonFunctions.buildQueryParams(params);
			let dbResult: ClientDocumentInterface[];
			paramsResult.createdBy = createdBy;
			if (Object.keys(paramsResult).length > 0) {
				dbResult = await ClientSchema.find(paramsResult)
					.select(this.selectableFields)
					.populate({
						path: 'wayOfEntry',
					});
			} else {
				dbResult = await ClientSchema.find().select(this.selectableFields).populate({
					path: 'wayOfEntry',
				});
			}
			if (!dbResult) {
				return {
					code: 'notDataFound',
					detail: 'Data not found',
				};
			}
			return {
				code: 'success',
				detail: dbResult,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async validateIdNumber(idNumber: string): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientDocumentInterface = await ClientSchema.findOne({
				idNumber: {
					$regex: RegExp(`^${idNumber.trim().toLocaleLowerCase()}$`, 'i'),
				},
			});
			if (!dbResult) {
				return {
					code: 'success',
					detail: 'Data not found',
				};
			}
			return {
				code: 'valueAlreadyCreated',
				detail: dbResult,
			};
		} catch (ex) {
			throw ex;
		}
	}
}
