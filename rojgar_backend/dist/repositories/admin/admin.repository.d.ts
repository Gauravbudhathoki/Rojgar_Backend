import { IAdmin } from "../../models/admin/admin.model";
export interface IAdminRepository {
    getUserbyEmail(email: string): Promise<IAdmin | null>;
    createUser(data: Partial<IAdmin>): Promise<IAdmin>;
    getUserById(id: string): Promise<IAdmin | null>;
    getAllAdmins(): Promise<IAdmin[]>;
    updateOneAdmin(id: string, data: Partial<IAdmin>): Promise<IAdmin | null>;
    deleteOneAdmin(id: string): Promise<boolean | null>;
}
export declare class AdminRepository implements IAdminRepository {
    createUser(data: Partial<IAdmin>): Promise<IAdmin>;
    getUserbyEmail(email: string): Promise<IAdmin | null>;
    getUserById(id: string): Promise<IAdmin | null>;
    getAllAdmins(): Promise<IAdmin[]>;
    updateOneAdmin(id: string, data: Partial<IAdmin>): Promise<IAdmin | null>;
    deleteOneAdmin(id: string): Promise<boolean | null>;
}
//# sourceMappingURL=admin.repository.d.ts.map