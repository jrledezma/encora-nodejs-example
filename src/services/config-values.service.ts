import { injectable } from "inversify";

import { ServiceResultInterface } from "../interfaces/service-result.interface";
import { ConfigValuesServiceInterface } from "../interfaces/services";
import { UserStatusEnum } from "../enums";

@injectable()
export class ConfigValuesService implements ConfigValuesServiceInterface {
	//#region Public Properties

	public UserStatus = this.userStatus;

	//#endregion

	public constructor() {}

	private userStatus(): any {
		try {
			return { code: "success", detail: UserStatusEnum };
		} catch (ex) {
			throw ex;
		}
	}
}
