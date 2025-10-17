/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defaultsDeep } from "lodash";
import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Parser } from "./parser";
import { urlJoin } from "./url-join";
import { MessageInstance } from "antd/es/message/interface";
import { message } from "antd";

export interface RequestOptions<T = any> extends AxiosRequestConfig {
  endpoint?: string;
  parser?: Parser<T>;
  passthroughErrorCatcher?: boolean;
}

export type ServiceOptions = {
  endpoint: string;
};

export type RefreshTokenInvoker = () => Promise<void>;

export abstract class ServiceBase {
  private static token?: string;

  public static baseUrl: string;

  private static refreshTokenInvoking = false;

  private static refreshTokenInvoker: RefreshTokenInvoker | undefined;

  private static refreshTokenQueue: {
    resolver: VoidFunction;
    rejector: VoidFunction;
  }[] = [];

  static setConfig(baseUrl: string) {
    ServiceBase.baseUrl = baseUrl;
  }

  static setToken(token?: string) {
    ServiceBase.token = token;
  }

  static setTokenRefresher(invoker: RefreshTokenInvoker) {
    ServiceBase.refreshTokenInvoker = async () => {
      if (ServiceBase.refreshTokenInvoking) return;
      ServiceBase.refreshTokenInvoking = true;
      try {
        let success = false;
        for (let i = 0; i < 5; i++) {
          try {
            await invoker();
            success = true;
            break;
          } catch (err) {
            console.warn(`Refresh token failed, retry ${i + 1}/5`);
            if (i < 4) {
              await new Promise((r) => setTimeout(r, 3000));
            }
          }
        }
        if (!success) throw new Error("Refresh token failed");
        ServiceBase.refreshTokenQueue.forEach(({ resolver }) => resolver());
      } catch (err) {
        ServiceBase.refreshTokenQueue.forEach(({ rejector }) => rejector());
      } finally {
        ServiceBase.refreshTokenQueue.length = 0;
        ServiceBase.refreshTokenInvoking = false;
      }
    };
  }
  private static refreshToken() {
    return new Promise<void>((resolver, rejector) => {
      ServiceBase.refreshTokenQueue.push({
        resolver,
        rejector,
      });
      if (!ServiceBase.refreshTokenInvoking) {
        if (ServiceBase.refreshTokenInvoker) {
          ServiceBase.refreshTokenInvoker();
        } else {
          rejector();
          ServiceBase.refreshTokenQueue.splice(
            0,
            ServiceBase.refreshTokenQueue.length
          );
        }
      }
    });
  }

  protected options: ServiceOptions = { endpoint: "" };

  constructor(
    options?: ServiceOptions,
    private client: AxiosInstance = Axios.create({
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: 300000,
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            if (headers) {
              // eslint-disable-next-line no-param-reassign
              delete headers["Content-Type"];
            }
            return data;
          }
          return JSON.stringify(data);
        },
      ],
    })
  ) {
    this.options = defaultsDeep(options, {
      endpoint: "",
    });
    this.client.interceptors.response.use(
      (response) => {
        return response.data; // chỉ trả về data
      },
      (error) => {
        return Promise.reject(error.response ? error.response.data : error);
      }
    );
  }

  /**
   * Trả về kết quả, nếu true thì sẽ gọi lại request, nếu false thì sẽ throw
   */
  private async catchError(e: any): Promise<boolean> {
    if (e.statusCode === 401) {
      try {
        await ServiceBase.refreshToken();
        return true;
      } catch {
        message.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("currentUser");
        window.location.href = "/signin";
        return false;
      }
    }

    if (e instanceof Error && e.message === "Network Error") {
      message.error("Máy chủ đang bận, vui lòng thử lại sau");
      return false;
    }

    message.error("Xảy ra một lỗi chưa xác định");
    return false;
  }

  private getOptions(options?: RequestOptions) {
    let headers = options?.headers ?? {};

    if (headers["Authorization"]) {
      // giữ lại token đã truyền vào
    } else if (ServiceBase.token) {
      // không có thì dùng token đã lưu
      headers = {
        ...headers,
        Authorization: `Bearer ${ServiceBase.token}`,
      };
    }

    return { ...options, headers };
  }

  private getAbsoluteRequestUrl(options?: RequestOptions) {
    if (this.options.endpoint.startsWith("http")) {
      return urlJoin(
        this.options.endpoint,
        (options && options.endpoint) || ""
      );
    }
    return urlJoin(
      ServiceBase.baseUrl,
      this.options.endpoint,
      (options && options.endpoint) || ""
    );
  }

  async get<T = any>(options?: RequestOptions): Promise<any> {
    const opts = this.getOptions(options);
    try {
      const data = await this.client.get(
        this.getAbsoluteRequestUrl(options),
        opts
      );
      if (opts.parser) {
        return await opts.parser.parse(data);
      }
      return data;
    } catch (e) {
      if (opts.passthroughErrorCatcher) throw e;
      const catched = await this.catchError(e);
      if (catched) {
        return this.get(options);
      }
      throw e;
    }
  }

  async post<T = any>(data: any, options?: RequestOptions): Promise<any> {
    const opts = this.getOptions(options);
    try {
      const response = await this.client.post(
        this.getAbsoluteRequestUrl(options),
        data,
        opts
      );
      if (opts.parser) {
        return await opts.parser.parse(response);
      }
      return response;
    } catch (e) {
      if (opts.passthroughErrorCatcher) {
        throw e;
      }

      const catched = await this.catchError(e);
      if (catched) {
        return this.post(data, options);
      }
      throw e;
    }
  }

  async patch<T = any>(data: any, options?: RequestOptions): Promise<any> {
    const opts = this.getOptions(options);
    try {
      const result = await this.client.patch(
        `${this.getAbsoluteRequestUrl(options)}`,
        data,
        opts
      );
      if (opts.parser) {
        return await opts.parser.parse(result);
      }
      return result;
    } catch (e) {
      if (opts.passthroughErrorCatcher) throw e;
      const catched = await this.catchError(e);
      if (catched) {
        return this.patch(options);
      }
      throw e;
    }
  }

  async delete(data: any, options?: RequestOptions): Promise<boolean> {
    const opts = this.getOptions(options);
    try {
      const { data: result } = await this.client.delete(
        `${this.getAbsoluteRequestUrl(options)}`,
        opts
      );
      return true;
    } catch (e) {
      if (opts.passthroughErrorCatcher) throw e;
      const catched = await this.catchError(e);
      if (catched) {
        return this.delete(data, options);
      }
      throw e;
    }
  }
}
