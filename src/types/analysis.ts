export type ResultType = 'STRENGTH' | 'WEAKNESS' | 'OPPORTUNITY' | 'THREAT';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AnalysisResult {
    id?: number;
    resultType: ResultType;
    category: string;
    title: string;
    description: string;
    severity?: Severity;
    recommendation?: string;
}

export interface FinancialAnalysis {
    id?: number;
    companyId: number;
    analysisType: string;
    periodStart: string;
    periodEnd: string;
    status: string;
    overallHealth?: string;
    revenue?: number;
    netProfit?: number;
    assets?: number;
    liabilities?: number;
    equity?: number;
    cashFlow?: number;
    notes?: string;
    createdAt?: string;
    results: AnalysisResult[];
}
