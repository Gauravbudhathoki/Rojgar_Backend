import { IAdmin } from "../../models/admin/admin.model";
export declare class AdminService {
    registerAdmin(data: any): Promise<IAdmin>;
    loginAdmin(data: any): Promise<{
        token: string;
        admin: IAdmin;
    }>;
    updateAdminProfile(adminId: string, updateData: any): Promise<IAdmin | null>;
    getAdminById(adminId: string): Promise<IAdmin>;
    getAllAdmins(): Promise<IAdmin[]>;
    deleteAdmin(adminId: string): Promise<boolean | null>;
}
//# sourceMappingURL=admin.type.d.ts.map