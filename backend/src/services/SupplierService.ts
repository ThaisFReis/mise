import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateSupplierDTO {
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
}

export interface UpdateSupplierDTO {
  name?: string;
  contact?: string;
  email?: string;
  phone?: string;
}

export class SupplierService {
  /**
   * Lista todos os fornecedores
   */
  async getAll() {
    return await prisma.supplier.findMany({
      include: {
        _count: {
          select: {
            productCosts: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Busca um fornecedor por ID
   */
  async getById(id: number) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        productCosts: {
          include: {
            product: true,
          },
          orderBy: {
            validFrom: 'desc',
          },
        },
      },
    });

    if (!supplier) {
      throw new Error(`Supplier with id ${id} not found`);
    }

    return supplier;
  }

  /**
   * Cria um novo fornecedor
   */
  async create(data: CreateSupplierDTO) {
    return await prisma.supplier.create({
      data: {
        name: data.name,
        contact: data.contact,
        email: data.email,
        phone: data.phone,
      },
    });
  }

  /**
   * Atualiza um fornecedor
   */
  async update(id: number, data: UpdateSupplierDTO) {
    // Verificar se existe
    await this.getById(id);

    return await prisma.supplier.update({
      where: { id },
      data,
    });
  }

  /**
   * Deleta um fornecedor
   */
  async delete(id: number) {
    // Verificar se existe
    await this.getById(id);

    // Verificar se tem custos de produtos associados
    const costsCount = await prisma.productCost.count({
      where: { supplierId: id },
    });

    if (costsCount > 0) {
      throw new Error(
        `Cannot delete supplier. There are ${costsCount} product costs associated with this supplier. Please remove or reassign them first.`
      );
    }

    return await prisma.supplier.delete({
      where: { id },
    });
  }

  /**
   * Busca produtos de um fornecedor
   */
  async getProducts(supplierId: number) {
    const supplier = await this.getById(supplierId);

    // Agrupar custos por produto (pegar apenas o custo atual)
    const productsMap = new Map();

    for (const cost of supplier.productCosts) {
      if (!cost.validUntil) {
        // Custo atual
        productsMap.set(cost.product.id, {
          id: cost.product.id,
          name: cost.product.name,
          currentCost: Number(cost.cost),
          costId: cost.id,
          validFrom: cost.validFrom,
        });
      }
    }

    return Array.from(productsMap.values());
  }

  /**
   * Busca fornecedores com filtro de busca
   */
  async search(query: string) {
    return await prisma.supplier.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { contact: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        _count: {
          select: {
            productCosts: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}

export default new SupplierService();
