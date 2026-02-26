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
    questions: Array<Question>;
}
export interface UserProfile {
    fullName: string;
    hasVisitedAdmin: boolean;
    contactNumber: bigint;
    userClass: Class;
}
export interface TestResult {
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
    /**
     * / Add a new question. Admin only.
     */
    addQuestion(image: ExternalBlob, correctOption: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Create a new test. Admin only.
     */
    createTest(name: string, durationMinutes: bigint, questionIds: Array<bigint>): Promise<bigint>;
    /**
     * / Delete a question. Admin only.
     */
    deleteQuestion(questionId: bigint): Promise<void>;
    /**
     * / Get all questions. Admin only.
     */
    getAllQuestions(): Promise<Array<Question>>;
    /**
     * / Get all test results. Admin only.
     */
    getAllResults(): Promise<Array<TestResult>>;
    /**
     * / Get all tests (published and unpublished). Admin only.
     */
    getAllTests(): Promise<Array<CompleteTest>>;
    /**
     * / Get all registered users. Admin only.
     */
    getAllUsers(): Promise<Array<[Principal, UserProfile]>>;
    /**
     * / Get the calling user's own profile. Requires #user role.
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Get the calling user's profile. Requires #user role.
     */
    getMyProfile(): Promise<UserProfile | null>;
    /**
     * / Get the calling user's own test results. Requires #user role.
     */
    getMyResults(): Promise<Array<TestResult>>;
    /**
     * / Get all published tests. Requires #user role.
     */
    getPublishedTests(): Promise<Array<CompleteTest>>;
    /**
     * / Get a test by ID. Non-admins can only access published tests.
     */
    getTestById(testId: bigint): Promise<CompleteTest>;
    /**
     * / Get another user's profile. Caller must be the same user or an admin.
     */
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    /**
     * / Check if the caller has visited the admin.
     */
    hasAdminBeenVisited(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Mark that the admin has been visited by the caller (admin only).
     */
    markAdminVisited(): Promise<void>;
    /**
     * / Register a new user profile. Requires #user role (must be authenticated).
     */
    registerUser(profile: UserProfile): Promise<void>;
    /**
     * / Save the calling user's own profile. Requires #user role.
     */
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Submit a test result. Requires #user role.
     */
    submitTestResult(testId: bigint, answers: Array<Answer>, score: bigint): Promise<void>;
    /**
     * / Toggle publish/unpublish a test. Admin only.
     */
    togglePublishTest(testId: bigint): Promise<void>;
    /**
     * / Update the calling user's profile. Requires #user role.
     */
    updateProfile(profile: UserProfile): Promise<void>;
    /**
     * / Update an existing question. Admin only.
     */
    updateQuestion(questionId: bigint, image: ExternalBlob, correctOption: string): Promise<void>;
    /**
     * / Update an existing test. Admin only.
     */
    updateTest(testId: bigint, name: string, durationMinutes: bigint, questionIds: Array<bigint>): Promise<void>;
}
