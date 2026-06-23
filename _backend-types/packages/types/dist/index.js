"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveConsultationTypeId = exports.getConsultationLabel = exports.getConsultationConfigByType = exports.getConsultationConfigById = exports.consultationTypeToId = exports.consultationTypeIdToEnum = exports.isConsultationType = exports.isConsultationTypeId = exports.MENTOR_CONSULTATION_SPECIALIZATIONS = exports.MENTOR_TRADING_SKILLS = exports.CONSULTATION_TYPE_LABELS = exports.CONSULTATION_TYPES = exports.parseQuizContent = exports.quizContentSchema = exports.quizQuestionSchema = exports.quizQuestionTypeSchema = void 0;
__exportStar(require("./schemas/admin-course"), exports);
var quiz_1 = require("./schemas/quiz");
Object.defineProperty(exports, "quizQuestionTypeSchema", { enumerable: true, get: function () { return quiz_1.quizQuestionTypeSchema; } });
Object.defineProperty(exports, "quizQuestionSchema", { enumerable: true, get: function () { return quiz_1.quizQuestionSchema; } });
Object.defineProperty(exports, "quizContentSchema", { enumerable: true, get: function () { return quiz_1.quizContentSchema; } });
Object.defineProperty(exports, "parseQuizContent", { enumerable: true, get: function () { return quiz_1.parseQuizContent; } });
var consultation_1 = require("./consultation");
Object.defineProperty(exports, "CONSULTATION_TYPES", { enumerable: true, get: function () { return consultation_1.CONSULTATION_TYPES; } });
Object.defineProperty(exports, "CONSULTATION_TYPE_LABELS", { enumerable: true, get: function () { return consultation_1.CONSULTATION_TYPE_LABELS; } });
Object.defineProperty(exports, "MENTOR_TRADING_SKILLS", { enumerable: true, get: function () { return consultation_1.MENTOR_TRADING_SKILLS; } });
Object.defineProperty(exports, "MENTOR_CONSULTATION_SPECIALIZATIONS", { enumerable: true, get: function () { return consultation_1.MENTOR_CONSULTATION_SPECIALIZATIONS; } });
Object.defineProperty(exports, "isConsultationTypeId", { enumerable: true, get: function () { return consultation_1.isConsultationTypeId; } });
Object.defineProperty(exports, "isConsultationType", { enumerable: true, get: function () { return consultation_1.isConsultationType; } });
Object.defineProperty(exports, "consultationTypeIdToEnum", { enumerable: true, get: function () { return consultation_1.consultationTypeIdToEnum; } });
Object.defineProperty(exports, "consultationTypeToId", { enumerable: true, get: function () { return consultation_1.consultationTypeToId; } });
Object.defineProperty(exports, "getConsultationConfigById", { enumerable: true, get: function () { return consultation_1.getConsultationConfigById; } });
Object.defineProperty(exports, "getConsultationConfigByType", { enumerable: true, get: function () { return consultation_1.getConsultationConfigByType; } });
Object.defineProperty(exports, "getConsultationLabel", { enumerable: true, get: function () { return consultation_1.getConsultationLabel; } });
Object.defineProperty(exports, "resolveConsultationTypeId", { enumerable: true, get: function () { return consultation_1.resolveConsultationTypeId; } });
