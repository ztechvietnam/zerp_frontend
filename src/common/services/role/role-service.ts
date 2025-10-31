import { CrudServiceBase } from "../crud-servicebase";
import { RoleEntity } from "./role";

class RoleService extends CrudServiceBase<RoleEntity> {
  constructor() {
    super({
      endpoint: "/roles",
      populateKeys: [],
    });
  }
}

export const roleService = new RoleService();
