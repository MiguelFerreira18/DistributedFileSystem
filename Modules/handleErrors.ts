import { logger } from "../config/logger";

const handleErrors = async (
	errorName: string,
	err: unknown,
	filePath: string
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
		default:
			logger.error("Error " + err + " from " + filePath);
			break;
	}
};

export {handleErrors}