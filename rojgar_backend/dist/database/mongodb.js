"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
//yo folder ma chahi database configure garney after adding dotenv in the index.ts inside the config folder this is second step 
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
async function connectDatabase() {
    try {
        await mongoose_1.default.connect(env_1.MONGODB_URI); //connection yesle build garney bhayo 
        console.log("Database connected successfully"); //successful message 
    }
    catch (error) {
        console.error("Database error", error);
        process.exit(1); //exit application on exception 
    }
}
//# sourceMappingURL=mongodb.js.map