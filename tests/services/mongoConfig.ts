import * as mongoose from "mongoose";
import * as Chalk from "chalk"
import { MongoError } from "mongodb";

export class MongoTestingConfig {
  public static async ConnectToDB(): Promise<void> {
    try {
      if (mongoose.connection.readyState !== 1) {
        mongoose.connect(process.env.MONGODB_URL, {}, (error: MongoError) => {
          if (error) {
            console.log(Chalk.red("Error connecting to DB ->").concat(error.message));
            return Promise.reject(error);
          }
          console.log(Chalk.green("Connected to " + process.env.MONGODB_URL));
          Promise.resolve();
        });
      }
    } catch (exception) {
      Promise.reject(exception.message)
    }
  }

  public static async CloseDBConnection(): Promise<void> {
    try {
      if (mongoose.connection.readyState === 1) {
        mongoose.connection.close();
        console.log(Chalk.green("DB connection was successfully closed"));
        Promise.resolve();
      }
    } catch (exception) {
      Promise.reject(exception.message)
    }
  }
}