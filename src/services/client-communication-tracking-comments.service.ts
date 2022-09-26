import { inject, injectable } from "inversify";

import {
	ClientCommunicationTrackingCommentDocumentInterface,
	ClientCommunicationTrackingCommentSchema,
} from "../models/index";
import { ServiceResultInterface } from "../interfaces/service-result.interface";
import { ClientCommunicationTrackingCommentsServiceInterface } from "../interfaces/services";
import { ClientCommunicationTrackingCommentModelInterface } from "../interfaces/models";
import ClientDealTrackingSchema from "../models/client-deal-tracking.model";
import UserSchema from "../models/user.model";
import { MailService } from "./mail.service";
import { ApiTypes } from "../apiTypes";

let _ = require("lodash");

@injectable()
export class ClientCommunicationTrackingCommentsService
	implements ClientCommunicationTrackingCommentsServiceInterface {
	//#region Public Properties

	public Create = this.create;
	public Activate = this.activate;
	public Inactivate = this.inactivate;
	public GetByCommunicationTracking = this.getByCommunicationTracking;
	public GetByUser = this.getByUser;
	public GetById = this.getById;

	//#endregion

	private mailSrv: MailService;
	private dbDocument: ClientCommunicationTrackingCommentDocumentInterface;
	private selectableFields = [
		"communicationTracking",
		"comments",
		"user",
		"createdDate",
		"isActive",
	];

	public constructor(@inject(ApiTypes.mailService) mailSrv: MailService) {
		this.mailSrv = mailSrv;
	}

	private async create(
		objToCreate: ClientCommunicationTrackingCommentModelInterface
	): Promise<ServiceResultInterface> {
		try {
			this.dbDocument = new ClientCommunicationTrackingCommentSchema({
				communicationTracking: objToCreate.communicationTracking,
				comments: objToCreate.comments,
				user: objToCreate.user,
				creationDate: new Date(),
				isActive: objToCreate.isActive,
			});
			const insertResult = await this.dbDocument.save({
				validateBeforeSave: true,
			});
			//getting stakholders
			const communicationTracking = await ClientDealTrackingSchema.findById(
				objToCreate.communicationTracking
			).select(["stakeHolders", "createdBy"]);
			//Sending email to stake holders
			//get ClientCommunicationTracking data

			//send email to stakholders

			if (!insertResult) {
				return {
					code: "error",
					detail: "any data was creted",
				};
			}
			return {
				code: "success",
				detail: insertResult,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async activate(_id: string): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientCommunicationTrackingCommentDocumentInterface = await ClientCommunicationTrackingCommentSchema.findById(
				_id
			);
			if (!dbResult) {
				return {
					code: "notDataFound",
					detail: "Data not found for inactivation",
				};
			}
			dbResult.isActive = true;
			dbResult.markModified("ClientCommunicationTrackingCommentSchema");

			let updateResult = await dbResult.save();
			if (updateResult._id) {
				return {
					code: "success",
					detail: "Data inactivated successfully",
				};
			} else {
				return {
					code: "notDataModified",
					detail: "Data not inactivated",
				};
			}
		} catch (ex) {
			throw ex;
		}
	}

	private async inactivate(_id: string): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientCommunicationTrackingCommentDocumentInterface = await ClientCommunicationTrackingCommentSchema.findById(
				_id
			);
			if (!dbResult) {
				return {
					code: "notDataFound",
					detail: "Data not found for inactivation",
				};
			}
			dbResult.isActive = false;
			dbResult.markModified("ClientCommunicationTrackingCommentSchema");

			let updateResult = await dbResult.save();
			if (updateResult._id) {
				return {
					code: "success",
					detail: "Data inactivated successfully",
				};
			} else {
				return {
					code: "notDataModified",
					detail: "Data not inactivated",
				};
			}
		} catch (ex) {
			throw ex;
		}
	}

	private async getByCommunicationTracking(
		trackingId: string
	): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientCommunicationTrackingCommentDocumentInterface[] = await ClientCommunicationTrackingCommentSchema.find(
				{ communicationTracking: trackingId }
			)
				.select(this.selectableFields)
				.populate({
					path: "communicationTracking",
				})
				.populate({
					path: "user",
					select: [
						"_id",
						"firstName",
						"lastName",
						"email",
						"countryCode",
						"phoneNumber",
						"image",
						"about",
						"status",
					],
				})
				.sort({ value: "asc" });
			if (!dbResult) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			//format user name
			const returnData = dbResult.map((item) => ({
				_id: item._id,
				communicationTracking: item.communicationTracking,
				comments: item.comments,
				createdDate: item.createdDate,
				user: {
					_id: item.user._id,
					fullName: `${item.user.firstName} ${item.user.lastName}`,
					email: item.user.email,
					countryCode: item.user.countryCode,
					phoneNumber: item.user.phoneNumber,
					about: item.user.about,
					status: item.user.status,
				},
			}));
			return {
				code: "success",
				detail: returnData,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async getByUser(userId: string): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientCommunicationTrackingCommentDocumentInterface[] = await ClientCommunicationTrackingCommentSchema.find(
				{
					user: userId,
				}
			).select(this.selectableFields.length);
			if (!dbResult) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			return {
				code: "success",
				detail: dbResult,
			};
		} catch (ex) {
			throw ex;
		}
	}

	private async getById(id: string): Promise<ServiceResultInterface> {
		try {
			let dbResult: ClientCommunicationTrackingCommentDocumentInterface = await ClientCommunicationTrackingCommentSchema.findById(
				id
			).select(this.selectableFields);
			if (!dbResult) {
				return {
					code: "notDataFound",
					detail: "Data not found",
				};
			}
			return {
				code: "success",
				detail: dbResult,
			};
		} catch (ex) {
			throw ex;
		}
	}
}
