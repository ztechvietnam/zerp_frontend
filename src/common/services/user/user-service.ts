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
}

export const userService = new UserService();
