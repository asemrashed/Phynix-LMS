"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizContentSchema = exports.quizQuestionSchema = exports.quizQuestionTypeSchema = void 0;
exports.parseQuizContent = parseQuizContent;
const zod_1 = require("zod");
exports.quizQuestionTypeSchema = zod_1.z.enum(["SINGLE_CHOICE", "TRUE_FALSE"]);
exports.quizQuestionSchema = zod_1.z
    .object({
    id: zod_1.z.string().min(1),
    type: exports.quizQuestionTypeSchema.default("SINGLE_CHOICE"),
    question: zod_1.z.string().trim().min(1, "Question text is required"),
    options: zod_1.z.array(zod_1.z.string().trim().min(1)).min(2, "At least 2 options required"),
    correctIndex: zod_1.z.number().int().min(0),
    explanation: zod_1.z.string().optional(),
})
    .refine((data) => data.correctIndex < data.options.length, {
    message: "Correct answer index is out of range",
    path: ["correctIndex"],
});
exports.quizContentSchema = zod_1.z.object({
    passThreshold: zod_1.z.number().min(0).max(100).default(70),
    maxAttempts: zod_1.z.number().int().min(1).default(3),
    shuffleQuestions: zod_1.z.boolean().default(false),
    shuffleOptions: zod_1.z.boolean().default(false),
    timeLimitSeconds: zod_1.z.number().int().positive().optional(),
    questions: zod_1.z.array(exports.quizQuestionSchema).min(1, "Add at least one question"),
});
function parseQuizContent(raw) {
    if (!raw?.trim()) {
        return {
            passThreshold: 70,
            maxAttempts: 3,
            shuffleQuestions: false,
            shuffleOptions: false,
            questions: [],
        };
    }
    try {
        const parsed = JSON.parse(raw);
        const questions = Array.isArray(parsed.questions)
            ? parsed.questions.map((q) => ({
                id: String(q.id ?? ""),
                type: q.type === "TRUE_FALSE" ? "TRUE_FALSE" : "SINGLE_CHOICE",
                question: String(q.question ?? ""),
                options: q.type === "TRUE_FALSE"
                    ? ["True", "False"]
                    : Array.isArray(q.options)
                        ? q.options.map(String)
                        : ["", ""],
                correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
                explanation: q.explanation ? String(q.explanation) : undefined,
            }))
            : [];
        return {
            passThreshold: parsed.passThreshold ?? 70,
            maxAttempts: parsed.maxAttempts ?? 3,
            shuffleQuestions: parsed.shuffleQuestions ?? false,
            shuffleOptions: parsed.shuffleOptions ?? false,
            timeLimitSeconds: parsed.timeLimitSeconds,
            questions,
        };
    }
    catch {
        return {
            passThreshold: 70,
            maxAttempts: 3,
            shuffleQuestions: false,
            shuffleOptions: false,
            questions: [],
        };
    }
}
