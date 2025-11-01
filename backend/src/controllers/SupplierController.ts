import { Request, Response, NextFunction } from 'express';
import SupplierService from '../services/SupplierService';

/**
 * Controller para gerenciamento de fornecedores
 */
export class SupplierController {
  /**
   * GET /api/suppliers
   * Listar todos os fornecedores
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const suppliers = await SupplierService.getAll();

      res.json({
        success: true,
        data: suppliers,
        count: suppliers.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/suppliers/:id
   * Obter um fornecedor por ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const supplierId = parseInt(id);

      const supplier = await SupplierService.getById(supplierId);

      res.json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/suppliers
   * Criar um novo fornecedor
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, contact, email, phone } = req.body;

      const supplier = await SupplierService.create({
        name,
        contact,
        email,
        phone,
      });

      res.status(201).json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/suppliers/:id
   * Atualizar um fornecedor
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const supplierId = parseInt(id);
      const { name, contact, email, phone } = req.body;

      const supplier = await SupplierService.update(supplierId, {
        name,
        contact,
        email,
        phone,
      });

      res.json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/suppliers/:id
   * Deletar um fornecedor
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const supplierId = parseInt(id);

      await SupplierService.delete(supplierId);

      res.json({
        success: true,
        message: 'Supplier deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/suppliers/:id/products
   * Obter produtos de um fornecedor
   */
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const supplierId = parseInt(id);

      const products = await SupplierService.getProducts(supplierId);

      res.json({
        success: true,
        data: products,
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/suppliers/search
   * Buscar fornecedores
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Query parameter is required',
        });
      }

      const suppliers = await SupplierService.search(query);

      res.json({
        success: true,
        data: suppliers,
        count: suppliers.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SupplierController();
