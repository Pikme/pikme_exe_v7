/**
 * Scheduled Exports Hooks
 * React hooks for tRPC integration with scheduled exports
 */

import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Hook for managing scheduled exports list
 */
export function useScheduledExports(activeOnly: boolean = true) {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = trpc.schedules.list.useQuery({ activeOnly });

  const schedules = response?.data || [];

  return {
    schedules,
    isLoading,
    error,
    refetch,
    count: response?.count || 0,
  };
}

/**
 * Hook for getting a specific scheduled export
 */
export function useScheduledExport(id: number) {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = trpc.schedules.get.useQuery({ id }, { enabled: !!id });

  const schedule = response?.data;

  return {
    schedule,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for creating a new scheduled export
 */
export function useCreateSchedule() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMutation = trpc.schedules.create.useMutation();
  const utils = trpc.useUtils();

  const create = useCallback(
    async (data: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await createMutation.mutateAsync(data);
        await utils.schedules.list.invalidate();
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create schedule";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [createMutation, utils]
  );

  return {
    create,
    isLoading: isLoading || createMutation.isPending,
    error: error || createMutation.error?.message,
  };
}

/**
 * Hook for updating a scheduled export
 */
export function useUpdateSchedule() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMutation = trpc.schedules.update.useMutation();
  const utils = trpc.useUtils();

  const update = useCallback(
    async (id: number, data: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await updateMutation.mutateAsync({ id, data });
        await utils.schedules.list.invalidate();
        await utils.schedules.get.invalidate({ id });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update schedule";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateMutation, utils]
  );

  return {
    update,
    isLoading: isLoading || updateMutation.isPending,
    error: error || updateMutation.error?.message,
  };
}

/**
 * Hook for deleting a scheduled export
 */
export function useDeleteSchedule() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMutation = trpc.schedules.delete.useMutation();
  const utils = trpc.useUtils();

  const delete_ = useCallback(
    async (id: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await deleteMutation.mutateAsync({ id });
        await utils.schedules.list.invalidate();
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete schedule";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [deleteMutation, utils]
  );

  return {
    delete: delete_,
    isLoading: isLoading || deleteMutation.isPending,
    error: error || deleteMutation.error?.message,
  };
}

/**
 * Hook for toggling scheduled export active status
 */
export function useToggleSchedule() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleMutation = trpc.schedules.toggle.useMutation();
  const utils = trpc.useUtils();

  const toggle = useCallback(
    async (id: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await toggleMutation.mutateAsync({ id });
        await utils.schedules.list.invalidate();
        await utils.schedules.get.invalidate({ id });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to toggle schedule";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [toggleMutation, utils]
  );

  return {
    toggle,
    isLoading: isLoading || toggleMutation.isPending,
    error: error || toggleMutation.error?.message,
  };
}

/**
 * Hook for getting export history
 */
export function useExportHistory(scheduleId: number, limit: number = 50) {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = trpc.schedules.getHistory.useQuery(
    { id: scheduleId, limit },
    { enabled: !!scheduleId }
  );

  const history = response?.data || [];

  return {
    history,
    isLoading,
    error,
    refetch,
    count: response?.count || 0,
  };
}

/**
 * Hook for getting export statistics
 */
export function useExportStats(scheduleId: number) {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = trpc.schedules.getStats.useQuery({ id: scheduleId }, { enabled: !!scheduleId });

  const stats = response?.data;

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for executing a schedule immediately
 */
export function useExecuteSchedule() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeMutation = trpc.schedules.executeNow.useMutation();
  const utils = trpc.useUtils();

  const execute = useCallback(
    async (id: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await executeMutation.mutateAsync({ id });
        await utils.schedules.getHistory.invalidate({ id });
        await utils.schedules.getStats.invalidate({ id });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to execute schedule";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [executeMutation, utils]
  );

  return {
    execute,
    isLoading: isLoading || executeMutation.isPending,
    error: error || executeMutation.error?.message,
  };
}

/**
 * Hook for sending test email
 */
export function useSendTestEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testEmailMutation = trpc.schedules.testEmail.useMutation();

  const sendTestEmail = useCallback(
    async (scheduleId: number, testEmail: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await testEmailMutation.mutateAsync({
          id: scheduleId,
          testEmail,
        });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send test email";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [testEmailMutation]
  );

  return {
    sendTestEmail,
    isLoading: isLoading || testEmailMutation.isPending,
    error: error || testEmailMutation.error?.message,
  };
}

/**
 * Hook for getting pending exports
 */
export function usePendingExports() {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = trpc.schedules.getPending.useQuery();

  const pending = response?.data || [];

  return {
    pending,
    isLoading,
    error,
    refetch,
    count: response?.count || 0,
  };
}

export default {
  useScheduledExports,
  useScheduledExport,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useToggleSchedule,
  useExportHistory,
  useExportStats,
  useExecuteSchedule,
  useSendTestEmail,
  usePendingExports,
};
