/* eslint-disable @typescript-eslint/no-explicit-any */
import _, { Dictionary } from "lodash";
import { ServiceBase, ServiceOptions } from "./servicebase";
import { EntityBase } from "./entity-base";

export interface PaginateResult<T> {
  docs: T[];
  count: number;
}

const excludeKeys = ["id", "createdAt", "updatedAt", "deletedAt"];

export abstract class CrudServiceBase<
  T extends EntityBase
> extends ServiceBase {
  populateKeys: (keyof T)[];

  constructor(
    options: ServiceOptions & {
      /**
       * Giá trị của trường này dùng để chuyển các object đã bị populate sang dạng id
       */
      populateKeys?: (keyof T)[];
    }
  ) {
    super(options);

    this.populateKeys = options.populateKeys || [];

    if (this.populateKeys.some((k) => k.toString().includes("."))) {
      // eslint-disable-next-line no-console
      console.warn(
        `[${options.endpoint}] Đang dùng sai ý tưởng của populateKeys`
      );
    }
  }

  private normalized(entity: any) {
    const processedEntity: Dictionary<any> = {};
    Object.keys(entity).forEach((key) => {
      const value = (entity as Dictionary<any>)[key];
      // những property mà được khai báo là populate thì sẽ được convert thành id khi upload lên server
      // if (value && this.populateKeys.includes(key as keyof T)) {
      //   if (Array.isArray(value)) {
      //     value = value.map((v) => (typeof v === "object" && v.id ? v.id : v));
      //   } else if (typeof value === "object") {
      //     value = value.id ? value.id : value;
      //   }
      // }
      processedEntity[key] = value;
    });
    return processedEntity;
  }

  add(entity: Omit<T, keyof EntityBase>, options?: { populate?: string[] }) {
    let populate: string[] = [];
    if (options && options.populate && options.populate.length > 0) {
      populate = options.populate;
    }
    if (this.populateKeys === populate) {
      console.warn(
        `[${this.options.endpoint}] Chỉ populate những trường cần thiết, không sử dụng pouplateKeys sai mục đích`
      );
    }
    return this.post<T>(_.omit(this.normalized(entity), excludeKeys), {
      endpoint: populate.length > 0 ? `?$populate=${populate.join(",")}` : "",
    });
  }

  update(
    entity: Partial<Omit<T, "id">> & Pick<T, "id">,
    options?: { populate?: string[] }
  ) {
    let populate: string[] = [];
    if (options && options.populate && options.populate.length > 0) {
      populate = options.populate;
    }
    if (this.populateKeys === populate) {
      console.warn(
        `[${this.options.endpoint}] Chỉ populate những trường cần thiết, không sử dụng pouplateKeys sai mục đích`
      );
    }
    return this.patch<T>(_.omit(this.normalized(entity), excludeKeys), {
      endpoint:
        populate.length > 0
          ? `${entity.id}?$populate=${populate.join(",")}`
          : `${entity.id}`,
    });
  }

  deleteById(id: string | number | bigint) {
    return super.delete(null, {
      endpoint: `${id}`,
    });
  }

  getById(id: string, options?: { populate?: string[] }) {
    let populate: string[] = [];
    if (options && options.populate && options.populate.length > 0) {
      populate = options.populate;
    }
    if (this.populateKeys === populate) {
      console.warn(
        `[${this.options.endpoint}] Chỉ populate những trường cần thiết, không sử dụng pouplateKeys sai mục đích`
      );
    }
    return this.get<T>({
      endpoint:
        populate.length > 0 ? `${id}?$populate=${populate.join(",")}` : `${id}`,
    });
  }

  paginate(query: any, options?: any) {
    return this.post<PaginateResult<T>>(
      {
        query,
        options,
      },
      {
        endpoint: "paginate",
      }
    );
  }

  getCount(query?: any, options?: any) {
    return this.post<number>(
      {
        query,
        options,
      },
      {
        endpoint: "count",
      }
    );
  }
}
