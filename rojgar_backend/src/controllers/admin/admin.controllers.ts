import { AdminUserService } from "../../services/admin/admin.user.services";
import { Request, Response} from "express";
import { CreateUserDto } from "../../dtos/user.dto";
import { HttpError } from "../../errors/http-error";
let adminUserService = new AdminUserService();

export class AdminUserController{
    async createUser(req: Request, res: Response){
        try{
            const parsed = CreateUserDto.safeParse(req.body);
            if(!parsed.success){
                return res.status(400).json({ success: false, errors: parsed.error.format() });
            }
            const newUser = await adminUserService.createUser(parsed.data);
            let userObj: any = newUser;
            if(typeof newUser.toObject === "function") userObj = newUser.toObject();
            const { password, ...userWithoutPassword } = userObj;
            return res.status(201).json({success:true, data: userWithoutPassword, message: "User created successfully"});
        }catch(error: any){
            return res.status(error?.statusCode || 500).json({success:false, message: error.message || "Internal Server Error"});
        }
    }

    async getAllUsers(req: Request, res: Response){
        try{
            const users = await adminUserService.getAllUsers();
            return res.status(200).json({success:true, data: users, message: "Users fetched successfully"});
        }catch(error: any){
            return res.status(error?.statusCode || 500).json({success:false, message: error.message || "Internal Server Error"});
        }
    }

    async getUserById(req: Request, res: Response){
        try{
            const userId = req.params.id; //from url /api/admin/users/:id
            const user = await adminUserService.getUserById(userId);
            res.status(200).json({success:true,data: user, message: "User fetched successfully"});
        }catch(error:Error | any){
            return res.status(error.statusCode || 500).json({success:false, message: error.message || "Internal Server Error"});
        }
    }

    async updateOneUser(req: Request, res: Response){
        try{
            const userId = req.params.id;
            const updateData = req.body;
            const updated = await adminUserService.updateUser(userId, updateData);
            return res.status(200).json({success:true, data: updated, message: "User updated successfully"});
        }catch(error: any){
            return res.status(error?.statusCode || 500).json({success:false, message: error.message || "Internal Server Error"});
        }
    }

    async deleteOneUser(req: Request, res: Response){
        try{
            const userId = req.params.id;
            await adminUserService.deleteUser(userId);
            return res.status(200).json({success:true, message: "User deleted successfully"});
        }catch(error: any){
            return res.status(error?.statusCode || 500).json({success:false, message: error.message || "Internal Server Error"});
        }
    }
}