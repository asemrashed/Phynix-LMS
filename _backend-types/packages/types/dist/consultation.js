"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MENTOR_CONSULTATION_SPECIALIZATIONS = exports.MENTOR_TRADING_SKILLS = exports.CONSULTATION_TYPE_LABELS = exports.CONSULTATION_TYPES = void 0;
exports.isConsultationTypeId = isConsultationTypeId;
exports.isConsultationType = isConsultationType;
exports.consultationTypeIdToEnum = consultationTypeIdToEnum;
exports.consultationTypeToId = consultationTypeToId;
exports.getConsultationConfigById = getConsultationConfigById;
exports.getConsultationConfigByType = getConsultationConfigByType;
exports.getConsultationLabel = getConsultationLabel;
exports.resolveConsultationTypeId = resolveConsultationTypeId;
exports.CONSULTATION_TYPES = [
    {
        id: "career",
        type: "CAREER",
        label: "Career Consultation",
        description: "Finance careers, trading jobs, and professional growth",
        specialization: "Career",
    },
    {
        id: "study-abroad",
        type: "STUDY_ABROAD",
        label: "Study Abroad Guidance",
        description: "University applications and finance programs overseas",
        specialization: "Study Abroad",
    },
    {
        id: "trading",
        type: "TRADING",
        label: "Trading Consultation",
        description: "Strategy review, risk management, live market guidance",
        specialization: "Trading",
    },
    {
        id: "business",
        type: "BUSINESS",
        label: "Business Consultation",
        description: "Prop firm setup, trading business, and scaling",
        specialization: "Business",
    },
];
exports.CONSULTATION_TYPE_LABELS = {
    CAREER: "Career Consultation",
    STUDY_ABROAD: "Study Abroad Guidance",
    TRADING: "Trading Consultation",
    BUSINESS: "Business Consultation",
};
exports.MENTOR_TRADING_SKILLS = [
    "SMC",
    "ICT",
    "Risk Management",
    "Gold Trading",
];
exports.MENTOR_CONSULTATION_SPECIALIZATIONS = exports.CONSULTATION_TYPES.map((item) => item.specialization);
const ID_BY_TYPE = Object.fromEntries(exports.CONSULTATION_TYPES.map((item) => [item.type, item.id]));
const TYPE_BY_ID = Object.fromEntries(exports.CONSULTATION_TYPES.map((item) => [item.id, item.type]));
const CONFIG_BY_ID = Object.fromEntries(exports.CONSULTATION_TYPES.map((item) => [item.id, item]));
const CONFIG_BY_TYPE = Object.fromEntries(exports.CONSULTATION_TYPES.map((item) => [item.type, item]));
function isConsultationTypeId(value) {
    return value in TYPE_BY_ID;
}
function isConsultationType(value) {
    return value in ID_BY_TYPE;
}
function consultationTypeIdToEnum(id) {
    return TYPE_BY_ID[id];
}
function consultationTypeToId(type) {
    return ID_BY_TYPE[type];
}
function getConsultationConfigById(id) {
    return CONFIG_BY_ID[id];
}
function getConsultationConfigByType(type) {
    return CONFIG_BY_TYPE[type];
}
function getConsultationLabel(type) {
    if (!type)
        return null;
    return exports.CONSULTATION_TYPE_LABELS[type];
}
function resolveConsultationTypeId(value, fallback = "trading") {
    if (value && isConsultationTypeId(value))
        return value;
    return fallback;
}
