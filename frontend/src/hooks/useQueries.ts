import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, CompleteTest, Question, TestResult, Answer } from '../backend';
import { ExternalBlob, UserRole } from '../backend';

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
      queryClient.invalidateQueries({ queryKey: ['callerRole'] });
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

// ─── Caller Role ───────────────────────────────────────────────────────────

export function useGetCallerRole() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const principalStr = identity?.getPrincipal().toString() ?? 'anonymous';

  const isReady = !!actor && !actorFetching && isAuthenticated && !isInitializing;

  const query = useQuery<UserRole>({
    queryKey: ['callerRole', principalStr],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: isReady,
    retry: false,
    staleTime: 0,
  });

  return {
    ...query,
    isPending: !isReady || query.isPending,
    isFetched: isReady && query.isFetched,
  };
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const principalStr = identity?.getPrincipal().toString() ?? 'anonymous';

  const isReady = !!actor && !actorFetching && isAuthenticated && !isInitializing;

  const query = useQuery<boolean>({
    // Include the principal in the key so the query re-runs when the user logs in/out
    queryKey: ['isCallerAdmin', principalStr],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    // Only run when actor is ready AND user is authenticated (not anonymous)
    enabled: isReady,
    // Don't retry on error (e.g. unauthorized trap from backend)
    retry: false,
    staleTime: 0,
  });

  return {
    ...query,
    // isLoading should be true while actor/identity are still initializing OR query is actively fetching
    // Use query.isLoading (isPending && isFetching) instead of query.isPending to avoid
    // staying in loading state when the query is disabled (isPending is true for disabled queries too)
    isLoading: !isReady || query.isLoading,
    data: query.data,
  };
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
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return useQuery<boolean>({
    queryKey: ['hasAdminBeenVisited', identity?.getPrincipal().toString() ?? 'anonymous'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.hasAdminBeenVisited();
    },
    enabled: !!actor && !actorFetching && isAuthenticated && !isInitializing,
  });
}
