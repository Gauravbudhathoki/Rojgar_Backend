"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const mongodb_1 = require("./database/mongodb");
async function startServer() {
    try {
        await (0, mongodb_1.connectDatabase)();
        app_1.default.listen(env_1.PORT, () => {
            console.log(`Server running on http://localhost:${env_1.PORT}`);
            console.log(`MongoDB connected at: ${env_1.MONGODB_URI}`);
        });
    }
    catch (error) {
        console.error('Server start error:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map