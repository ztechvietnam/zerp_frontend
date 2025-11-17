import { CrudServiceBase } from "../crud-servicebase";
import { UserEntity } from "./user";

class UserService extends CrudServiceBase<UserEntity> {
  constructor() {
    super({
      endpoint: "/users",
      populateKeys: ["role", "status"],
    });
  }

  // ví dụ custom API ngoài CRUD mặc định
  changePassword(userId: string, newPassword: string) {
    return this.patch<UserEntity>(
      { id: userId, password: newPassword },
      { endpoint: `${userId}/change-password` }
    );
  }

  async findAndFilter(departmentIds?: number[], keyword?: string): Promise<any> {
    return this.post(
      {
        keyword: keyword || "",
        departmentIds,
      },
      {
        endpoint: "/findandfilter",
      }
    );
  }
}

export const userService = new UserService();
