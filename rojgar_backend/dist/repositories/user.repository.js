"use strict";
// FILE: src/repositories/user/user.repository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const user_model_1 = require("../models/user.model");
class UserRepository {
    async createUser(data) {
        const user = new user_model_1.UserModel(data);
        return await user.save();
    }
    async getUserbyEmail(email) {
        const user = await user_model_1.UserModel.findOne({ email: email });
        return user;
    }
    async getUserbyUsername(username) {
        const user = await user_model_1.UserModel.findOne({ username: username });
        return user;
    }
    async getUserById(id) {
        const user = await user_model_1.UserModel.findById(id);
        return user;
    }
    async getAllUsers() {
        const users = await user_model_1.UserModel.find();
        return users;
    }
    async updateUser(id, data) {
        const updatedUser = await user_model_1.UserModel.findByIdAndUpdate(id, data, { new: true });
        return updatedUser;
    }
    async deleteUser(id) {
        const result = await user_model_1.UserModel.findByIdAndDelete(id);
        return result ? true : null;
    }
    async getUsersByRole(role) {
        const users = await user_model_1.UserModel.find({ role: role });
        return users;
    }
    async verifyUser(id) {
        const verifiedUser = await user_model_1.UserModel.findByIdAndUpdate(id, { isVerified: true }, { new: true });
        return verifiedUser;
    }
    async getUserByPhone(phone) {
        const user = await user_model_1.UserModel.findOne({ phone: phone });
        return user;
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map