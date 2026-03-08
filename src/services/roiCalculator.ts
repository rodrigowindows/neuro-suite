/** ROI calculation logic extracted from ROIDashboard */

export interface ROIInputs {
  totalEmployees: number;
  avgSalary: number;
  turnoverRate: number;
  absenteeismDays: number;
}

export interface ROIResults {
  annualTurnoverCost: number;
  annualAbsenteeismCost: number;
  totalCostWithoutNeuroSuite: number;
  savingsTurnover: number;
  savingsAbsenteeism: number;
  totalSavings: number;
  annualNeuroSuiteCost: number;
  netROI: number;
  roiPercentage: number;
}

const REPLACEMENT_COST_MONTHS = 6;
const WORKING_DAYS_PER_MONTH = 22;
const COST_PER_EMPLOYEE_MONTH = 29;
const TURNOVER_REDUCTION_RATE = 0.25;
const ABSENTEEISM_REDUCTION_RATE = 0.20;

export function calculateROI(inputs: ROIInputs): ROIResults {
  const turnoverCostPerEmployee = inputs.avgSalary * REPLACEMENT_COST_MONTHS;
  const annualTurnoverCost = (inputs.totalEmployees * (inputs.turnoverRate / 100)) * turnoverCostPerEmployee;

  const absenteeismCostPerDay = inputs.avgSalary / WORKING_DAYS_PER_MONTH;
  const annualAbsenteeismCost = inputs.totalEmployees * inputs.absenteeismDays * absenteeismCostPerDay;

  const totalCostWithoutNeuroSuite = annualTurnoverCost + annualAbsenteeismCost;

  const savingsTurnover = annualTurnoverCost * TURNOVER_REDUCTION_RATE;
  const savingsAbsenteeism = annualAbsenteeismCost * ABSENTEEISM_REDUCTION_RATE;
  const totalSavings = savingsTurnover + savingsAbsenteeism;

  const annualNeuroSuiteCost = inputs.totalEmployees * COST_PER_EMPLOYEE_MONTH * 12;
  const netROI = totalSavings - annualNeuroSuiteCost;
  const roiPercentage = annualNeuroSuiteCost > 0 ? Math.round((netROI / annualNeuroSuiteCost) * 100) : 0;

  return {
    annualTurnoverCost,
    annualAbsenteeismCost,
    totalCostWithoutNeuroSuite,
    savingsTurnover,
    savingsAbsenteeism,
    totalSavings,
    annualNeuroSuiteCost,
    netROI,
    roiPercentage,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
