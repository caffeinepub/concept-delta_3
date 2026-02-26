import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, CompleteTest, Question, TestResult, Answer } from '../backend';
import { ExternalBlob } from '../backend';

// ─── User Profile ──────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Published Tests ───────────────────────────────────────────────────────

export function useGetPublishedTests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CompleteTest[]>({
    queryKey: ['publishedTests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublishedTests();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Test by ID ────────────────────────────────────────────────────────────

export function useGetTestById(testId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CompleteTest>({
    queryKey: ['test', testId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTestById(testId);
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Submit Test Result ────────────────────────────────────────────────────

export function useSubmitTestResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      testId,
      answers,
    }: {
      testId: bigint;
      answers: Answer[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.submitTestResult(testId, answers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResults'] });
      queryClient.invalidateQueries({ queryKey: ['allResults'] });
    },
  });
}

// ─── My Results ────────────────────────────────────────────────────────────

export function useGetMyResults() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TestResult[]>({
    queryKey: ['myResults'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyResults();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Admin: All Questions ──────────────────────────────────────────────────

export function useGetAllQuestions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Question[]>({
    queryKey: ['allQuestions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuestions();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ image, correctOption }: { image: ExternalBlob; correctOption: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addQuestion(image, correctOption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allQuestions'] });
    },
  });
}

export function useDeleteQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteQuestion(questionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allQuestions'] });
    },
  });
}

// ─── Admin: All Tests ──────────────────────────────────────────────────────

export function useGetAllTests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CompleteTest[]>({
    queryKey: ['allTests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateTest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      durationMinutes,
      questionIds,
      marksPerCorrect,
      negativeMarks,
    }: {
      name: string;
      durationMinutes: bigint;
      questionIds: bigint[];
      marksPerCorrect: bigint;
      negativeMarks: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTest(name, durationMinutes, questionIds, marksPerCorrect, negativeMarks);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTests'] });
      queryClient.invalidateQueries({ queryKey: ['publishedTests'] });
    },
  });
}

export function useTogglePublishTest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.togglePublishTest(testId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTests'] });
      queryClient.invalidateQueries({ queryKey: ['publishedTests'] });
    },
  });
}

// ─── Admin: All Results ────────────────────────────────────────────────────

export function useGetAllResults() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TestResult[]>({
    queryKey: ['allResults'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllResults();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Admin: All Users ──────────────────────────────────────────────────────

export function useGetAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[import('@dfinity/principal').Principal, UserProfile][]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCallerRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['callerRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useMarkAdminVisited() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.markAdminVisited();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useHasAdminBeenVisited() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasAdminBeenVisited'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.hasAdminBeenVisited();
    },
    enabled: !!actor && !actorFetching,
  });
}
