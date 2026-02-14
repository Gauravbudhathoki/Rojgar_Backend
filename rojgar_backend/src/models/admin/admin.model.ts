// FILE: src/models/admin/admin.model.ts

import mongoose, { Document, Schema } from "mongoose"; 

const AdminSchema: Schema = new Schema({
    fullName: { 
        type: String, 
        required: false, 
        trim: true 
    }, 
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    }, 
    password: { 
        type: String, 
        required: true, 
        minLength: 6 
    },
    profilePicture: {
        type: String,
        required: false,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin'],
        default: 'admin',
    }
}, {
    timestamps: true,
});

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

export const AdminModel = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);