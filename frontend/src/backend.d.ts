import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Answer {
    questionId: bigint;
    selectedOption: string;
}
export interface Question {
    id: bigint;
    correctOption: string;
    image: ExternalBlob;
}
export interface CompleteTest {
    id: bigint;
    isPublished: boolean;
    name: string;
    durationMinutes: bigint;
    marksPerCorrect: bigint;
    questions: Array<Question>;
    negativeMarks: bigint;
}
export interface UserProfile {
    fullName: string;
    hasVisitedAdmin: boolean;
    contactNumber: bigint;
    userClass: Class;
}
export interface TestResult {
    marks: bigint;
    userId: Principal;
    answers: Array<Answer>;
    submittedAt: Time;
    score: bigint;
    testId: bigint;
}
export enum Class {
    dropper = "dropper",
    eleventh = "eleventh",
    twelfth = "twelfth"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addQuestion(image: ExternalBlob, correctOption: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createTest(name: string, durationMinutes: bigint, questionIds: Array<bigint>, marksPerCorrect: bigint, negativeMarks: bigint): Promise<bigint>;
    deleteQuestion(questionId: bigint): Promise<void>;
    getAllQuestions(): Promise<Array<Question>>;
    getAllResults(): Promise<Array<TestResult>>;
    getAllTests(): Promise<Array<CompleteTest>>;
    getAllUsers(): Promise<Array<[Principal, UserProfile]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyProfile(): Promise<UserProfile | null>;
    getMyResults(): Promise<Array<TestResult>>;
    getPublishedTests(): Promise<Array<CompleteTest>>;
    getTestById(testId: bigint): Promise<CompleteTest>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasAdminBeenVisited(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    markAdminVisited(): Promise<void>;
    registerUser(profile: UserProfile): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitTestResult(testId: bigint, answers: Array<Answer>): Promise<void>;
    togglePublishTest(testId: bigint): Promise<void>;
    updateProfile(profile: UserProfile): Promise<void>;
    updateQuestion(questionId: bigint, image: ExternalBlob, correctOption: string): Promise<void>;
    updateTest(testId: bigint, name: string, durationMinutes: bigint, questionIds: Array<bigint>, marksPerCorrect: bigint, negativeMarks: bigint): Promise<void>;
}
