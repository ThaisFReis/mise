import prisma from '../config/database';
import cacheService from './cacheService';

export class CategoryService {
  async getCategories(): Promise<Array<{ id: number; name: string }>> {
    const cacheKey = 'categories:all';
    const cached = await cacheService.get<Array<{ id: number; name: string }>>(cacheKey);

    if (cached) {
      return cached;
    }

    const categories = await prisma.category.findMany({
      where: {
        type: 'P', // Only product categories
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Cache for 1 hour since categories don't change often
    await cacheService.set(cacheKey, categories, 3600);
    return categories;
  }
}

export default new CategoryService();
