import { RoleRepo } from './role.repo.ts';

export class RoleService {
  private repo: RoleRepo;

  constructor() {
    this.repo = new RoleRepo();
  }

  async listRoles() {
    return this.repo.findAll();
  }
}
