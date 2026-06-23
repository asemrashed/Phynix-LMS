import { z } from "zod";
export declare const quizQuestionTypeSchema: z.ZodEnum<["SINGLE_CHOICE", "TRUE_FALSE"]>;
export declare const quizQuestionSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["SINGLE_CHOICE", "TRUE_FALSE"]>>;
    question: z.ZodString;
    options: z.ZodArray<z.ZodString, "many">;
    correctIndex: z.ZodNumber;
    explanation: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "SINGLE_CHOICE" | "TRUE_FALSE";
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string | undefined;
}, {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    type?: "SINGLE_CHOICE" | "TRUE_FALSE" | undefined;
    explanation?: string | undefined;
}>, {
    id: string;
    type: "SINGLE_CHOICE" | "TRUE_FALSE";
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string | undefined;
}, {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    type?: "SINGLE_CHOICE" | "TRUE_FALSE" | undefined;
    explanation?: string | undefined;
}>;
export declare const quizContentSchema: z.ZodObject<{
    passThreshold: z.ZodDefault<z.ZodNumber>;
    maxAttempts: z.ZodDefault<z.ZodNumber>;
    shuffleQuestions: z.ZodDefault<z.ZodBoolean>;
    shuffleOptions: z.ZodDefault<z.ZodBoolean>;
    timeLimitSeconds: z.ZodOptional<z.ZodNumber>;
    questions: z.ZodArray<z.ZodEffects<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<["SINGLE_CHOICE", "TRUE_FALSE"]>>;
        question: z.ZodString;
        options: z.ZodArray<z.ZodString, "many">;
        correctIndex: z.ZodNumber;
        explanation: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "SINGLE_CHOICE" | "TRUE_FALSE";
        question: string;
        options: string[];
        correctIndex: number;
        explanation?: string | undefined;
    }, {
        id: string;
        question: string;
        options: string[];
        correctIndex: number;
        type?: "SINGLE_CHOICE" | "TRUE_FALSE" | undefined;
        explanation?: string | undefined;
    }>, {
        id: string;
        type: "SINGLE_CHOICE" | "TRUE_FALSE";
        question: string;
        options: string[];
        correctIndex: number;
        explanation?: string | undefined;
    }, {
        id: string;
        question: string;
        options: string[];
        correctIndex: number;
        type?: "SINGLE_CHOICE" | "TRUE_FALSE" | undefined;
        explanation?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    passThreshold: number;
    maxAttempts: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    questions: {
        id: string;
        type: "SINGLE_CHOICE" | "TRUE_FALSE";
        question: string;
        options: string[];
        correctIndex: number;
        explanation?: string | undefined;
    }[];
    timeLimitSeconds?: number | undefined;
}, {
    questions: {
        id: string;
        question: string;
        options: string[];
        correctIndex: number;
        type?: "SINGLE_CHOICE" | "TRUE_FALSE" | undefined;
        explanation?: string | undefined;
    }[];
    passThreshold?: number | undefined;
    maxAttempts?: number | undefined;
    shuffleQuestions?: boolean | undefined;
    shuffleOptions?: boolean | undefined;
    timeLimitSeconds?: number | undefined;
}>;
export type QuizQuestionType = z.infer<typeof quizQuestionTypeSchema>;
export type QuizQuestionStored = z.infer<typeof quizQuestionSchema>;
export type QuizContentStored = z.infer<typeof quizContentSchema>;
/** Student-facing question (answers stripped) */
export interface QuizQuestionItem {
    id: string;
    type: QuizQuestionType;
    question: string;
    options: string[];
    /** Present only after quiz is passed (review mode) */
    correctIndex?: number;
    explanation?: string;
}
export interface QuizLessonContent {
    passThreshold: number;
    maxAttempts: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    timeLimitSeconds?: number;
    questions: QuizQuestionItem[];
    /** Present only after quiz is passed (review mode) */
    review?: {
        score: number;
        results: QuizQuestionResultItem[];
        /** Stored student answers keyed by question id */
        answers?: Record<string, number>;
    };
}
export interface QuizQuestionResultItem {
    questionId: string;
    correct: boolean;
    explanation?: string;
    correctIndex?: number;
}
export interface QuizSubmitResult {
    score: number;
    passed: boolean;
    correctCount: number;
    total: number;
    attemptsUsed: number;
    attemptsRemaining: number;
    perQuestion?: QuizQuestionResultItem[];
    /** Included when passed — same shape as review on lesson content */
    review?: QuizLessonContent["review"];
}
export declare function parseQuizContent(raw: string | null | undefined): QuizContentStored;
