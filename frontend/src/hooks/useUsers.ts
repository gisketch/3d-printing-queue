import { useState, useEffect, useCallback } from 'react';
import pb from '../lib/pocketbase';
import type { UserRequest, User } from '../types';
import { generateTempPassword } from '../lib/utils';

export function useUserRequests() {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const records = await pb.collection('user_requests').getFullList<UserRequest>({
        sort: '-created',
        filter: 'status = "pending"',
      });

      setRequests(records);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch requests'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();

    // Set up realtime subscription
    pb.collection('user_requests').subscribe('*', () => {
      fetchRequests();
    });

    return () => {
      pb.collection('user_requests').unsubscribe('*');
    };
  }, [fetchRequests]);

  const approveRequest = async (request: UserRequest): Promise<{ user: User; tempPassword: string }> => {
    const tempPassword = generateTempPassword();

    // Create the user account
    const newUser = await pb.collection('users').create<User>({
      username: request.desired_username,
      email: `${request.desired_username}@netzon.local`, // Placeholder email
      name: request.full_name,
      password: tempPassword,
      passwordConfirm: tempPassword,
      role: 'user',
      total_print_time: 0,
      must_change_password: true,
    });

    // Update the request status
    await pb.collection('user_requests').update(request.id, {
      status: 'approved',
    });

    return { user: newUser, tempPassword };
  };

  const rejectRequest = async (requestId: string, notes?: string) => {
    await pb.collection('user_requests').update(requestId, {
      status: 'rejected',
      notes,
    });
  };

  return { requests, isLoading, error, refetch: fetchRequests, approveRequest, rejectRequest };
}

export function useRequestAccess() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitRequest = async (fullName: string, desiredUsername: string) => {
    try {
      setIsSubmitting(true);
      setError(null);

      await pb.collection('user_requests').create({
        full_name: fullName,
        desired_username: desiredUsername,
        status: 'pending',
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to submit request'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitRequest, isSubmitting, error };
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const records = await pb.collection('users').getFullList<User>({
        sort: '-created',
      });

      setUsers(records);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch users'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, refetch: fetchUsers };
}
