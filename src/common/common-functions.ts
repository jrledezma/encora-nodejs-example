import * as Axios from 'axios';
import * as FormData from 'form-data';
import * as moment from 'moment';
import { Translations } from './translations';
import { DefaultConfigurationInterface } from '../interfaces/defaultConfigurationInterface';
import { PrintColorType } from '../enums/print-color-type.enum';
import mongodb = require('mongodb');

const ObjectID = mongodb.ObjectID;

import * as Chalk from 'chalk';
import { ServiceResultInterface } from '../interfaces/service-result.interface';

export class CommonFunctions {
	public constructor() {}

	public static PrintConsoleColor(
		message: any,
		messageType: PrintColorType = null,
		setEmptyLineAfter: boolean = false
	): void {
		if (messageType !== null) {
			switch (messageType) {
				case PrintColorType.info:
					console.log(Chalk.blueBright(message));
					break;
				case PrintColorType.error:
					console.log(Chalk.redBright(message));
					break;
				case PrintColorType.success:
					console.log(Chalk.green(message));
					break;
				case PrintColorType.warning:
					console.log(Chalk.cyan(message));
					break;
				case PrintColorType.white:
					console.log(Chalk.white(message));
					break;
				case PrintColorType.grey:
					console.log(Chalk.grey(message));
					break;
				case PrintColorType.yellow:
					console.log(Chalk.yellow(message));
					break;
				default:
					console.log(Chalk.grey(message));
					break;
			}
		} else {
			console.log(message);
		}
		if (setEmptyLineAfter) {
			console.log();
		}
	}

	// create the params list to make a search by proximity
	// params:
	//  - params: array of paramaters to use
	// returns:
	// - json params list
	public static buildQueryParams(params: any): {} {
		try {
			let paramObject: {} = new Object();
			if (params) {
				let keys = Object.keys(params);
				for (let i in keys) {
					if (ObjectID.isValid(params[keys[i]])) {
						paramObject[keys[i]] = params[keys[i]];
					} else {
						switch (typeof params[keys[i]]) {
							case 'boolean':
								paramObject[keys[i]] = Boolean(params[keys[i]]);
								break;
							case 'number': {
								paramObject[keys[i]] = Number(new RegExp(params[keys[i]]));
								break;
							}
							case 'string': {
								if (
									params[keys[i]].length === 10 &&
									Date.parse(params[keys[i]]) !== NaN
								) {
									paramObject[keys[i]] = CommonFunctions.createZeroHoursUTCDate(
										params[keys[i]]
									);
								} else {
									paramObject[keys[i]] = { $regex: params[keys[i]], $options: 'i' };
								}
								break;
							}
							case 'object': {
								let filters: Array<any> = [];
								for (let index: number = 0; index < params[keys[i]].length; index++) {
									filters.push(params[keys[i]][index]);
								}
								paramObject[keys[i]] = { $in: filters };
								break;
							}
							default: {
								if (params[keys[i]] instanceof Date) {
									paramObject[keys[i]] = new Date(new RegExp(params[keys[i]]).toString());
									break;
								}
								paramObject[keys[i]] = new RegExp(params[keys[i]]);
								break;
							}
						}
					}
				}
			}
			return paramObject;
		} catch (ex) {
			throw Error(ex.message);
		}
	}

	// generate a UUID (universally unique identifier)
	// params:
	//  - useDash: boolean value to indicate if must use a dash ("-") inside the UUID
	// returns:
	// - UUID string
	public static generateUUID(useDash: boolean): string {
		var date = new Date().getTime();
		var uuid = useDash
			? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
			: 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
					var r = (date + Math.random() * 16) % 16 | 0;
					date = Math.floor(date / 16);
					return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
			  });
		return uuid;
	}

	// transforms a word"s first letter into a uppercase letter
	// params:
	//  - word: string to transform
	// returns:
	// - string
	public static setCapitalLetter(word: string): string {
		return word[0].toUpperCase() + word.substring(1, word.length);
	}

	// converts a date/time string into milisecods using moment js
	// params:
	//  - dateTimeString: date/time string
	//	-	dateTimeType: type of data string
	//		*	date
	//		* time
	//		*	dateTime
	// returns:
	// - number
	public static convertTimeToMilliseconds(
		dateTimeString: string,
		dateTimeType: string
	): number {
		let momentObj: any;
		switch (dateTimeType) {
			case 'date':
				momentObj = moment(dateTimeString, 'YYYY-MM-DD');
				break;
			case 'time':
				if (dateTimeString.length === 5) {
					dateTimeString += ':00';
				}
				momentObj = moment(dateTimeString, 'HH:mm:ss');
				break;
			case 'dateTime':
				momentObj = moment(dateTimeString, 'YYYY-MM-DD HH-mm Z');
				break;
		}
		return Number(momentObj.format('x'));
	}

	// converts a millisecods into date/time object using moment js
	// params:
	//  - mls: milliseconds number
	//	-	dateFormat: type of data string
	// returns:
	// - string
	public static convertMillisecondsToTime(mls: number, dateFormat: string) {
		return moment(mls).format(dateFormat);
	}

	public static async fileUploader(file: any, directoryName: string): Promise<string> {
		try {
			let completeFileName = file.originalname;
			let formData = new FormData();
			formData.append('bucket', process.env.BUCKET_NAME);
			formData.append('files', file.buffer, completeFileName);
			formData.append('directoryName', directoryName);

			let s3Response = (await Axios.default({
				method: 'post',
				url: `${process.env.S3_SERVICE}upload`,
				data: formData,
				headers: {
					'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
					authorization: process.env.S3_FILE_UPLOADER_AUTH_CODE,
				},
				maxContentLength: Infinity,
			})) as any;
			s3Response = s3Response.data as ServiceResultInterface;
			if (s3Response.code !== 'success') {
				throw new Error(s3Response);
			}
			return (s3Response.detail as any).location;
		} catch (ex) {
			throw ex;
		}
	}

	public static async filesUploader(
		files: any[],
		directoryName: string
	): Promise<string[]> {
		try {
			let formData = new FormData();
			formData.append('bucket', process.env.BUCKET_NAME);
			files.forEach((file) => {
				formData.append('files', file.buffer, file.originalname);
			});
			formData.append('directoryName', directoryName);

			let s3Response = (await Axios.default({
				method: 'post',
				url: `${process.env.S3_SERVICE}uploadmulti`,
				data: formData,
				headers: {
					'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
					authorization: process.env.S3_FILE_UPLOADER_AUTH_CODE,
				},
				maxContentLength: Infinity,
			})) as any;

			s3Response = s3Response.data as ServiceResultInterface;
			if (s3Response.code !== 'success') {
				throw new Error(s3Response);
			}
			return (s3Response.detail as any).filesLocation as any[];
		} catch (ex) {
			throw ex;
		}
	}

	public static createZeroHoursUTCDate(date: Date | string): Date {
		try {
			return moment(
				moment(date as Date)
					.utcOffset(0)
					.set({ hour: 6, minute: 0, second: 0, millisecond: 0 })
					.toISOString()
			).toDate();
		} catch (ex) {
			throw ex;
		}
	}
}
