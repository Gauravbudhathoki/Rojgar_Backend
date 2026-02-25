import mongoose, { Document } from "mongoose";
export interface IAdmin extends Document {
    fullName: string;
    email: string;
    password: string;
    profilePicture?: string;
    role: 'admin';
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AdminModel: mongoose.Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=admin.model.d.ts.map