import { router, protectedProcedure, adminProcedure } from './_core';
import { z } from 'zod';
import { KeyRotationService } from '../key-rotation-service';
import { AuditReencryptionWorker } from '../audit-reencryption-worker';
import { TRPCError } from '@trpc/server';

export const keyRotationRouter = router({
  /**
   * Get current key rotation status
   */
  getStatus: protectedProcedure.query(async () => {
    const result = await KeyRotationService.getKeyRotationStatus();
    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: result.error,
      });
    }
    return result;
  }),

  /**
   * Check if key rotation is needed
   */
  isRotationNeeded: protectedProcedure.query(async () => {
    const needed = await KeyRotationService.isKeyRotationNeeded();
    return { needed };
  }),

  /**
   * Initiate manual key rotation (admin only)
   */
  initiateRotation: adminProcedure.mutation(async ({ ctx }) => {
    const result = await KeyRotationService.initiateKeyRotation(ctx.user.id, ctx.user.name);
    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: result.error,
      });
    }
    return result;
  }),

  /**
   * Get key rotation event history
   */
  getEventHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(1000).default(100),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const result = await KeyRotationService.getKeyRotationEventHistory(input.limit, input.offset);
      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error,
        });
      }
      return result.events || [];
    }),

  /**
   * Get re-encryption job status
   */
  getJobStatus: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      const result = await KeyRotationService.getReencryptionJobStatus(input.jobId);
      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error,
        });
      }
      return result;
    }),

  /**
   * Get all active re-encryption jobs
   */
  getActiveJobs: protectedProcedure.query(async () => {
    const result = await KeyRotationService.getActiveReencryptionJobs();
    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: result.error,
      });
    }
    return result.jobs || [];
  }),

  /**
   * Pause a re-encryption job (admin only)
   */
  pauseJob: adminProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ input }) => {
      const result = await KeyRotationService.pauseReencryptionJob(input.jobId);
      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error,
        });
      }
      return { success: true };
    }),

  /**
   * Resume a paused re-encryption job (admin only)
   */
  resumeJob: adminProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ input }) => {
      const result = await KeyRotationService.resumeReencryptionJob(input.jobId);
      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error,
        });
      }
      return { success: true };
    }),

  /**
   * Manually process pending re-encryption jobs (admin only)
   */
  processPendingJobs: adminProcedure.mutation(async () => {
    const result = await AuditReencryptionWorker.processPendingJobs();
    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: result.error,
      });
    }
    return result;
  }),

  /**
   * Get re-encryption queue status
   */
  getQueueStatus: protectedProcedure.query(async () => {
    const result = await AuditReencryptionWorker.getQueueStatus();
    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: result.error,
      });
    }
    return result;
  }),

  /**
   * Get key rotation statistics
   */
  getStats: protectedProcedure.query(async () => {
    const result = await KeyRotationService.getKeyRotationStats();
    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: result.error,
      });
    }
    return result.stats || {};
  }),

  /**
   * Retry a failed re-encryption job (admin only)
   */
  retryFailedJob: adminProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ input }) => {
      const result = await AuditReencryptionWorker.retryReencryptionJob(input.jobId);
      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error,
        });
      }
      return { success: true };
    }),

  /**
   * Cleanup archived keys (admin only)
   */
  cleanupArchivedKeys: adminProcedure.mutation(async () => {
    const result = await AuditReencryptionWorker.cleanupArchivedKeys();
    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: result.error,
      });
    }
    return result;
  }),
});
