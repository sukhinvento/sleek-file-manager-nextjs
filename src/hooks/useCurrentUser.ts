import { useAuth } from '@/contexts/AuthContext';

/**
 * Returns the best available display name for the logged-in user.
 * Use this as the default value for "requested by", "created by", etc. in forms.
 */
export const useCurrentUser = () => {
  const { displayName, user } = useAuth();
  return { displayName, username: user?.username || '' };
};
