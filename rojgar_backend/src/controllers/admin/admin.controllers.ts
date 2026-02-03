
import { UserModel, IUser } from "../../models/user.model";
import { HttpError } from "../../errors/http-error";
import bcrypt from "bcryptjs";


export class AdminUserService {
  async createUser(userData: any): Promise<IUser> {
    try {
      
      const existingUser = await UserModel.findOne({ 
        $or: [{ email: userData.email }, { phone: userData.phone }] 
      });

      if (existingUser) {
        throw new HttpError(400, "User with this email or phone already exists");
      }

      
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      
      const newUser = await UserModel.create(userData);
      return newUser;
    } catch (error: any) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, error.message || "Error creating user");
    }
  }

  async getAllUsers(filters?: any): Promise<IUser[]> {
    try {
      const query = filters || {};
      const users = await UserModel.find(query)
        .select("-password")
        .sort({ createdAt: -1 });
      return users;
    } catch (error: any) {
      throw new HttpError(500, error.message || "Error fetching users");
    }
  }

  async getUserById(userId: string): Promise<IUser> {
    try {
      const user = await UserModel.findById(userId).select("-password");
      
      if (!user) {
        throw new HttpError(404, "User not found");
      }

      return user;
    } catch (error: any) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, error.message || "Error fetching user");
    }
  }

  async updateUser(userId: string, updateData: any): Promise<IUser> {
    try {
      
      if (updateData.password) {
        delete updateData.password;
      }

      
      if (updateData.email || updateData.phone) {
        const existingUser = await UserModel.findOne({
          _id: { $ne: userId },
          $or: [
            ...(updateData.email ? [{ email: updateData.email }] : []),
            ...(updateData.phone ? [{ phone: updateData.phone }] : [])
          ]
        });

        if (existingUser) {
          throw new HttpError(400, "Email or phone already in use");
        }
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        throw new HttpError(404, "User not found");
      }

      return updatedUser;
    } catch (error: any) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, error.message || "Error updating user");
    }
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    try {
      const user = await UserModel.findByIdAndDelete(userId);

      if (!user) {
        throw new HttpError(404, "User not found");
      }

      return { message: "User deleted successfully" };
    } catch (error: any) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, error.message || "Error deleting user");
    }
  }

  async getUsersByRole(role: string): Promise<IUser[]> {
    try {
      const users = await UserModel.find({ role })
        .select("-password")
        .sort({ createdAt: -1 });
      return users;
    } catch (error: any) {
      throw new HttpError(500, error.message || "Error fetching users by role");
    }
  }

  async searchUsers(searchTerm: string): Promise<IUser[]> {
    try {
      const users = await UserModel.find({
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
          { phone: { $regex: searchTerm, $options: "i" } }
        ]
      })
        .select("-password")
        .limit(20);
      return users;
    } catch (error: any) {
      throw new HttpError(500, error.message || "Error searching users");
    }
  }
}