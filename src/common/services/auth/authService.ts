import { ServiceBase } from "../servicebase";
import { UserEntity } from "../user/user"; // nếu có entity User
import { AuthEntity } from "./auth";

export class AuthService extends ServiceBase {
  constructor() {
    super({ endpoint: "/auth" });
  }

  // email login
  async login(username: string, password: string) {
    return this.post<AuthEntity>(
      { username, password },
      { endpoint: "login", passthroughErrorCatcher: true }
    );
  }
  
  // email login
  async emailLogin(email: string, password: string) {
    return this.post<AuthEntity>(
      { email, password },
      { endpoint: "email/login", passthroughErrorCatcher: true }
    );
  }

  // email register
  async emailRegister(data: {
    email: string;
    password: string;
    name?: string;
  }) {
    return this.post<{ user: UserEntity }>(data, {
      endpoint: "email/register",
    });
  }

  // email confirm
  async confirmEmail(token: string) {
    return this.post<void>({ token }, { endpoint: "email/confirm" });
  }

  // confirm email mới
  async newConfirmEmail(email: string) {
    return this.post<void>({ email }, { endpoint: "email/confirm/new" });
  }

  // forgot password
  async forgotPassword(email: string) {
    return this.post<void>({ email }, { endpoint: "forgot/password" });
  }

  // reset password
  async resetPassword(data: { token: string; newPassword: string }) {
    return this.post<void>(data, {
      endpoint: "reset/password",
    });
  }

  // lấy thông tin user hiện tại
  async me() {
    return this.get<UserEntity>({ endpoint: "me" });
  }

  // cập nhật user hiện tại
  async updateMe(data: Partial<UserEntity>) {
    return this.patch<UserEntity>(data, { endpoint: "me" });
  }

  // xoá user hiện tại
  async deleteMe() {
    return this.delete(null, { endpoint: "me" });
  }

  // refresh token
  async refresh(refreshToken: string) {
    return this.post<{ token: string; refreshToken: string; user: UserEntity | undefined }>(
      {},
      {
        endpoint: "refresh",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
  }

  async logout() {
    return this.post<void>({}, { endpoint: "logout" });
  }
}

export const authService = new AuthService();
