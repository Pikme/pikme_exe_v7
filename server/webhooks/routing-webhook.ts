import { eq } from "drizzle-orm";
import { bookingEnquiries } from "../../drizzle/schema";
import { getDb } from "../db";
import { routeEnquiry, updateTeamMemberAvailability } from "../routing-engine";
import { notifyOwner } from "../_core/notification";

/**
 * Webhook handler for automatic enquiry routing
 * Called when a new booking enquiry is created
 */
export async function handleEnquiryCreated(enquiryId: number) {
  try {
    const db = await getDb();
    if (!db) {
      console.error(`[ROUTING] Database connection failed for enquiry ${enquiryId}`);
      throw new Error("Database connection failed");
    }

    // Get enquiry details
    const enquiry = await db
      .select()
      .from(bookingEnquiries)
      .where(eq(bookingEnquiries.id, enquiryId))
      .then((rows) => rows[0]);

    if (!enquiry) {
      console.error(`Enquiry ${enquiryId} not found for routing`);
      return;
    }

    // Run routing algorithm
    const result = await routeEnquiry(enquiryId);

    // Update enquiry with assignment
    if (db) {
      await db
        .update(bookingEnquiries)
        .set({
          assignedTo: result.assignedToUserId,
          updatedAt: new Date(),
        })
        .where(eq(bookingEnquiries.id, enquiryId));
    }

    // Update team member availability
    await updateTeamMemberAvailability(result.assignedToUserId, 1);

    // Log successful routing
    console.log(
      `[ROUTING] Enquiry #${enquiryId} automatically routed to user ${result.assignedToUserId} with score ${result.scores[0]?.totalScore.toFixed(2)}`
    );

    // Notify admin about automatic routing
    await notifyOwner({
      title: "Enquiry Auto-Routed",
      content: `Enquiry #${enquiryId} has been automatically assigned to ${result.scores[0]?.userName}. Score: ${result.scores[0]?.totalScore.toFixed(2)}/100. Rule: ${result.selectedRule || "Default"}`,
    });

    return {
      success: true,
      enquiryId,
      assignedToUserId: result.assignedToUserId,
      score: result.scores[0]?.totalScore,
    };
  } catch (error) {
    console.error(`[ROUTING ERROR] Failed to route enquiry ${enquiryId}:`, error);

    // Notify admin about routing failure
    await notifyOwner({
      title: "Enquiry Routing Failed",
      content: `Failed to automatically route enquiry #${enquiryId}. Error: ${error instanceof Error ? error.message : "Unknown error"}. Manual assignment required.`,
    });

    throw error;
  }
}

/**
 * Webhook handler for bulk routing of existing enquiries
 * Called when routing rules are updated or team configuration changes
 */
export async function handleBulkRouting(enquiryIds: number[]) {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ enquiryId: number; error: string }>,
  };

  for (const enquiryId of enquiryIds) {
    try {
      const db = await getDb();
      if (!db) {
        results.failed++;
        results.errors.push({
          enquiryId,
          error: "Database connection failed",
        });
        continue;
      }

      // Check if enquiry is already assigned
      const enquiry = await db
        .select()
        .from(bookingEnquiries)
        .where(eq(bookingEnquiries.id, enquiryId))
        .then((rows) => rows[0]);

      if (!enquiry) {
        results.failed++;
        results.errors.push({
          enquiryId,
          error: "Enquiry not found",
        });
        continue;
      }

      // Skip if already assigned
      if (enquiry.assignedTo) {
        continue;
      }

      // Run routing algorithm
      const result = await routeEnquiry(enquiryId);

      // Update enquiry with assignment
      if (db) {
        await db
          .update(bookingEnquiries)
          .set({
            assignedTo: result.assignedToUserId,
            updatedAt: new Date(),
          })
          .where(eq(bookingEnquiries.id, enquiryId));
      }

      // Update team member availability
      await updateTeamMemberAvailability(result.assignedToUserId, 1);

      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        enquiryId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Notify admin about bulk routing results
  await notifyOwner({
    title: "Bulk Enquiry Routing Complete",
    content: `Routed ${results.success} enquiries successfully. ${results.failed} failed. Check logs for details.`,
  });

  return results;
}

/**
 * Webhook handler for rebalancing team assignments
 * Called periodically to redistribute workload
 */
export async function handleWorkloadRebalancing() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[REBALANCING] Database connection failed");
      return {
        success: false,
        message: "Database connection failed",
        routed: 0,
      };
    }

    // Get all unassigned enquiries
    const unassignedEnquiries = await db
      .select()
      .from(bookingEnquiries)
      .where(eq(bookingEnquiries.assignedTo, null as any));

    if (unassignedEnquiries.length === 0) {
      console.log("[REBALANCING] No unassigned enquiries to route");
      return {
        success: true,
        message: "No unassigned enquiries",
        routed: 0,
      };
    }

    // Route all unassigned enquiries
    const result = await handleBulkRouting(
      unassignedEnquiries.map((e) => e.id)
    );

    console.log(
      `[REBALANCING] Routed ${result.success} enquiries, ${result.failed} failed`
    );

    return {
      success: true,
      routed: result.success,
      failed: result.failed,
    };
  } catch (error) {
    console.error("[REBALANCING ERROR]", error);
    throw error;
  }
}

/**
 * Webhook handler for team member status changes
 * Called when a team member becomes available/unavailable
 */
export async function handleTeamMemberStatusChange(
  userId: number,
  isAvailable: boolean
) {
  try {
    console.log(
      `[TEAM STATUS] User ${userId} is now ${isAvailable ? "available" : "unavailable"}`
    );

    // If member becomes unavailable, reassign their current enquiries
    if (!isAvailable) {
      const db = await getDb();
      if (!db) {
        console.error("[TEAM STATUS] Database connection failed");
        throw new Error("Database connection failed");
      }

      const assignedEnquiries = await db
        .select()
        .from(bookingEnquiries)
        .where(eq(bookingEnquiries.assignedTo, userId as any));

      if (assignedEnquiries.length > 0) {
        // Reassign to other team members
        await handleBulkRouting(assignedEnquiries.map((e) => e.id));

        await notifyOwner({
          title: "Team Member Unavailable",
          content: `User ${userId} is now unavailable. Reassigned ${assignedEnquiries.length} enquiries to other team members.`,
        });
      }
    }

    // If member becomes available, they can receive new assignments
    if (isAvailable) {
      await notifyOwner({
        title: "Team Member Available",
        content: `User ${userId} is now available for new enquiry assignments.`,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("[TEAM STATUS ERROR]", error);
    throw error;
  }
}
