import mongoose, { Document } from "mongoose";
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    username?: string;
    email: string;
    password: string;
    profilePicture?: string;
    role?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserModel: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
//# sourceMappingURL=user.model.d.ts.map