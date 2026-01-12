import { CategoryRepo } from './category.repo.ts';

export class CategoryService {
  private repo: CategoryRepo;

  constructor() {
    this.repo = new CategoryRepo();
  }

  async listCategories() {
    return this.repo.findAll();
  }

  async getCategoryById(id: number) {
    return this.repo.findById(id);
  }
}
