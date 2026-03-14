// Company types
export interface Company {
    id: number;
    name: string;
    taxId?: string;
    registrationNumber?: string;
    legalForm?: string;
    industry?: string;
    incorporationDate?: string;
    country?: string;
    city?: string;
    employeeCount?: number;
    status?: string;
    tenantId?: number;
}

// Financial types
export interface FinancialData {
    id?: number;
    companyId: number;
    fiscalYear: number;
    revenue?: number;
    netResult?: number;
    totalAssets?: number;
    totalLiabilities?: number;
    equity?: number;
    currentAssets?: number;
    currentLiabilities?: number;
    cash?: number;
    inventory?: number;
    accountsReceivable?: number;
    accountsPayable?: number;
    longTermDebt?: number;
    fixedAssets?: number;
    operatingIncome?: number;
    financialExpenses?: number;
    ebitda?: number;
    costOfGoodsSold?: number;
    shareCapital?: number;
    // Payment history
    totalPayments?: number;
    onTimePayments?: number;
    latePayments?: number;
    unpaidCount?: number;
    litigationCount?: number;
    averagePaymentDelay?: number;
    // Context
    employeeCount?: number;
}

// Score types
export interface Score {
    id: number;
    companyId: number;
    tenantId: number;
    overallScore: number;
    financialScore?: number;
    operationalScore?: number;
    marketScore?: number;
    legalScore?: number;
    riskRating?: string;
    riskLevel?: RiskLevel;
    confidenceLevel?: number;
    scoringMethod?: string;
    scoredBy?: number;
    scoredAt?: string;
    validUntil?: string;
    notes?: string;
}

export type RiskLevel =
    | 'EXCELLENT'
    | 'LOW_RISK'
    | 'MODERATE_RISK'
    | 'MEDIUM_RISK'
    | 'HIGH_RISK'
    | 'CRITICAL';

// Recommendation types
export interface Recommendation {
    score: number;
    riskLevel: RiskLevel;
    decision: string;
    decisionLabel: string;
    creditLimitPolicy: string;
    maxPaymentDays: number;
    guaranteesRequired: string;
    defaultRateRange: string;
}

// Alert types
export interface Alert {
    id: number;
    companyId: number;
    companyName?: string;
    subject?: string;
    title?: string;
    message: string;
    riskLevel?: RiskLevel;
    severity?: string;
    score?: number;
    status?: string;
    createdAt?: string;
}

// Auth types
export interface LoginRequest { username: string; password: string; }
export interface LoginResponse { accessToken: string; tokenType?: string; expiresIn?: number; }
export interface AuthUser { username: string; roles?: string[]; }

// API pagination / list
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}
