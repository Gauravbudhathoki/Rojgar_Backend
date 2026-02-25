"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const admin_model_1 = require("../../models/admin/admin.model");
class AdminRepository {
    async createUser(data) {
        const admin = new admin_model_1.AdminModel(data);
        return await admin.save();
    }
    async getUserbyEmail(email) {
        const admin = await admin_model_1.AdminModel.findOne({ email: email });
        return admin;
    }
    async getUserById(id) {
        const admin = await admin_model_1.AdminModel.findById(id);
        return admin;
    }
    async getAllAdmins() {
        const admins = await admin_model_1.AdminModel.find();
        return admins;
    }
    async updateOneAdmin(id, data) {
        const updatedAdmin = await admin_model_1.AdminModel.findByIdAndUpdate(id, data, { new: true });
        return updatedAdmin;
    }
    async deleteOneAdmin(id) {
        const result = await admin_model_1.AdminModel.findByIdAndDelete(id);
        return result ? true : null;
    }
}
exports.AdminRepository = AdminRepository;
//# sourceMappingURL=admin.repository.js.map