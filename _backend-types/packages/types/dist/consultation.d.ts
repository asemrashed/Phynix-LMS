export type ConsultationTypeId = "career" | "study-abroad" | "trading" | "business";
export type ConsultationType = "CAREER" | "STUDY_ABROAD" | "TRADING" | "BUSINESS";
export interface ConsultationTypeConfig {
    id: ConsultationTypeId;
    type: ConsultationType;
    label: string;
    description: string;
    specialization: string;
}
export declare const CONSULTATION_TYPES: ConsultationTypeConfig[];
export declare const CONSULTATION_TYPE_LABELS: Record<ConsultationType, string>;
export declare const MENTOR_TRADING_SKILLS: readonly ["SMC", "ICT", "Risk Management", "Gold Trading"];
export declare const MENTOR_CONSULTATION_SPECIALIZATIONS: string[];
export declare function isConsultationTypeId(value: string): value is ConsultationTypeId;
export declare function isConsultationType(value: string): value is ConsultationType;
export declare function consultationTypeIdToEnum(id: ConsultationTypeId): ConsultationType;
export declare function consultationTypeToId(type: ConsultationType): ConsultationTypeId;
export declare function getConsultationConfigById(id: ConsultationTypeId): ConsultationTypeConfig;
export declare function getConsultationConfigByType(type: ConsultationType): ConsultationTypeConfig;
export declare function getConsultationLabel(type: ConsultationType | null | undefined): string | null;
export declare function resolveConsultationTypeId(value: string | null | undefined, fallback?: ConsultationTypeId): ConsultationTypeId;
