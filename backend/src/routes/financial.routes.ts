import { Router } from 'express';
import CostController from '../controllers/CostController';
import SupplierController from '../controllers/SupplierController';
import ExpenseController from '../controllers/ExpenseController';
import FinancialController from '../controllers/FinancialController';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createProductCostSchema,
  bulkProductCostSchema,
  createSupplierSchema,
  updateSupplierSchema,
  createOperatingExpenseSchema,
  updateOperatingExpenseSchema,
  createFixedCostSchema,
  updateFixedCostSchema,
} from '../validators/financial.validators';

const router = Router();

// ===== COST ROUTES =====

// Product Costs
router.post(
  '/costs/products',
  validateBody(createProductCostSchema),
  CostController.createProductCost.bind(CostController)
);

router.get(
  '/costs/products/:id',
  CostController.getCurrentProductCost.bind(CostController)
);

router.get(
  '/costs/products/:id/history',
  CostController.getCostHistory.bind(CostController)
);

router.delete(
  '/costs/products/:id',
  CostController.deleteProductCost.bind(CostController)
);

router.post(
  '/costs/products/bulk',
  validateBody(bulkProductCostSchema),
  CostController.bulkCreateProductCosts.bind(CostController)
);

router.get(
  '/costs/cogs',
  CostController.calculateCOGS.bind(CostController)
);

router.get(
  '/costs/prime-cost',
  CostController.calculatePrimeCost.bind(CostController)
);

router.get(
  '/costs/by-category',
  CostController.getCostsByCategory.bind(CostController)
);

// Fixed Costs
router.get(
  '/costs/fixed',
  ExpenseController.getFixedCosts.bind(ExpenseController)
);

router.get(
  '/costs/fixed/:id',
  ExpenseController.getFixedCostById.bind(ExpenseController)
);

router.post(
  '/costs/fixed',
  validateBody(createFixedCostSchema),
  ExpenseController.createFixedCost.bind(ExpenseController)
);

router.put(
  '/costs/fixed/:id',
  validateBody(updateFixedCostSchema),
  ExpenseController.updateFixedCost.bind(ExpenseController)
);

router.delete(
  '/costs/fixed/:id',
  ExpenseController.deleteFixedCost.bind(ExpenseController)
);

router.get(
  '/costs/fixed/monthly',
  ExpenseController.getMonthlyFixedCosts.bind(ExpenseController)
);

// ===== SUPPLIER ROUTES =====

router.get(
  '/suppliers',
  SupplierController.getAll.bind(SupplierController)
);

router.get(
  '/suppliers/search',
  SupplierController.search.bind(SupplierController)
);

router.get(
  '/suppliers/:id',
  SupplierController.getById.bind(SupplierController)
);

router.post(
  '/suppliers',
  validateBody(createSupplierSchema),
  SupplierController.create.bind(SupplierController)
);

router.put(
  '/suppliers/:id',
  validateBody(updateSupplierSchema),
  SupplierController.update.bind(SupplierController)
);

router.delete(
  '/suppliers/:id',
  SupplierController.delete.bind(SupplierController)
);

router.get(
  '/suppliers/:id/products',
  SupplierController.getProducts.bind(SupplierController)
);

// ===== EXPENSE ROUTES =====

// Operating Expenses
router.get(
  '/expenses/operating',
  ExpenseController.getOperatingExpenses.bind(ExpenseController)
);

router.get(
  '/expenses/operating/:id',
  ExpenseController.getOperatingExpenseById.bind(ExpenseController)
);

router.post(
  '/expenses/operating',
  validateBody(createOperatingExpenseSchema),
  ExpenseController.createOperatingExpense.bind(ExpenseController)
);

router.put(
  '/expenses/operating/:id',
  validateBody(updateOperatingExpenseSchema),
  ExpenseController.updateOperatingExpense.bind(ExpenseController)
);

router.delete(
  '/expenses/operating/:id',
  ExpenseController.deleteOperatingExpense.bind(ExpenseController)
);

router.get(
  '/expenses/operating/summary',
  ExpenseController.getSummary.bind(ExpenseController)
);

// ===== FINANCIAL ANALYSIS ROUTES =====

// DRE (Income Statement)
router.get(
  '/financial/dre',
  FinancialController.generateDRE.bind(FinancialController)
);

router.get(
  '/financial/dre/compare',
  FinancialController.compareDRE.bind(FinancialController)
);

// Prime Cost
router.get(
  '/financial/prime-cost',
  FinancialController.getPrimeCost.bind(FinancialController)
);

// Channel Profitability
router.get(
  '/financial/channel-profitability',
  FinancialController.analyzeChannelProfitability.bind(FinancialController)
);

// Break-Even
router.get(
  '/financial/break-even',
  FinancialController.calculateBreakEven.bind(FinancialController)
);

router.get(
  '/financial/break-even/progress',
  FinancialController.getBreakEvenProgress.bind(FinancialController)
);

// COGS
router.get(
  '/financial/cogs',
  FinancialController.calculateCOGS.bind(FinancialController)
);

// Operating Expenses (alternative route)
router.get(
  '/financial/operating-expenses',
  FinancialController.getOperatingExpenses.bind(FinancialController)
);

// Dashboard Summary
router.get(
  '/financial/dashboard',
  FinancialController.getDashboardSummary.bind(FinancialController)
);

export default router;
