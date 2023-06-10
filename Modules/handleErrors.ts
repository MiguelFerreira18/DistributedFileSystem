import { logger } from "./logger";

/**
 * Handles errors based on their name and logs them with their respective messages.
 *
 * @param {string} errorName - The name of the error.
 * @param {*} err - The error object.
 * @param {string} [errorLocation] - The location of the error.
 * @param {string} [filePath] - The path of the file where the error occurred.
 */
const handleErrors = async (
	errorName: string,
	err: any,
	errorLocation?: string,
	filePath?: string
) => {
	switch (errorName) {
		case "read":
			logger.error("Error reading file " + err + " from " + filePath);
			break;
		case "write":
			logger.error("Error writing file " + err + " from " + filePath);
			break;
		case "update":
			logger.error("Error updating file " + err + " from " + filePath);
			break;
		case "delete":
			logger.error("Error deleting file " + err + " from " + filePath);
			break;
		case "init":
			logger.error("Error initializing" + err + " from " + filePath);
			break;
		case "reach":
			logger.error(
				`Error in line ${errorLocation}: Problem reaching the server`
			);
			break;
		case "action":
			logger.error(
				`Error in line ${errorLocation}: doing one of the CRUD actions `
			);
			break;
		case "replicateFromLogs":
			logger.error(`Error in line ${errorLocation}: Problem replicating logs`);
			break;
		case "electLeader":
			logger.error(`Error in line ${errorLocation}: Electing the leader`);
			break;
		case "retreiveLogsAxios":
			logger.error(`Error in line ${errorLocation}: Problem retreiving logs`);
			break;
		case "retreiveLogsfunction":
			logger.error(`Error in line ${errorLocation}: Problem retreiving logs`);
			break;
		case "callSubServer":
			logger.error(
				`Error in line ${errorLocation}: Problem calling the sub server`
			);
			break;
		default:
			logger.error("Error " + err + " from " + filePath);
			break;
	}
};

export { handleErrors };
