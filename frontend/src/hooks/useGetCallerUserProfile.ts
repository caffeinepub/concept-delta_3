import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    // Only run when: actor is ready, not fetching, user is authenticated, and not initializing
    enabled: !!actor && !actorFetching && isAuthenticated && !isInitializing,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || isInitializing || query.isLoading,
    isFetched: !!actor && isAuthenticated && query.isFetched,
  };
}
