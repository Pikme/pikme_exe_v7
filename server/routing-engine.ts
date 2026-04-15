import { eq, and, or, lt, gte } from "drizzle-orm";
import {
  teamMemberExpertise,
  teamMemberAvailability,
  routingRules,
  routingAudit,
  bookingEnquiries,
  users,
  tours,
} from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Scoring interface for routing decisions
 */
export interface RoutingScore {
  userId: number;
  userName: string;
  email: string;
  totalScore: number;
  workloadScore: number;
  expertiseScore: number;
  availabilityScore: number;
  languageScore: number;
  conversionScore: number;
  breakdown: {
    currentLoad: number;
    maxCapacity: number;
    expertise: string[];
    languages: string[];
    conversionRate: number;
    isAvailable: boolean;
  };
}

/**
 * Calculate workload score (lower current load = higher score)
 */
export function calculateWorkloadScore(
  currentEnquiries: number,
  maxCapacity: number
): number {
  if (maxCapacity === 0) return 0;
  const loadPercentage = currentEnquiries / maxCapacity;
  // Score from 0-100, where 100 is completely free
  return Math.max(0, 100 - loadPercentage * 100);
}

/**
 * Calculate expertise score based on matching criteria
 */
export function calculateExpertiseScore(
  expertiseList: Array<{ tourCategoryId?: number; destination?: string }>,
  tourCategoryId?: number,
  destination?: string
): number {
  let score = 50; // Base score for having any expertise

  // Check for exact tour category match
  if (tourCategoryId) {
    const categoryMatch = expertiseList.find(
      (e) => e.tourCategoryId === tourCategoryId
    );
    if (categoryMatch) score += 30;
  }

  // Check for destination match
  if (destination) {
    const destinationMatch = expertiseList.find((e) => {
      if (!e.destination) return false;
      // Simple pattern matching - can be enhanced with regex
      return destination.toLowerCase().includes(e.destination.toLowerCase()) ||
        e.destination.toLowerCase().includes(destination.toLowerCase())
        ? true
        : false;
    });
    if (destinationMatch) score += 20;
  }

  return Math.min(100, score);
}

/**
 * Calculate language proficiency score
 */
export function calculateLanguageScore(
  teamLanguages: string[],
  requiredLanguage?: string
): number {
  if (!requiredLanguage) return 50; // Neutral score if no language requirement

  const hasLanguage = teamLanguages.includes(requiredLanguage);
  return hasLanguage ? 100 : 0; // Strict matching for language requirements
}

/**
 * Calculate conversion rate score (higher conversion = higher score)
 */
export function calculateConversionScore(conversionRate: number): number {
  // Normalize conversion rate (0-100%) to score
  return Math.min(100, conversionRate || 0);
}

/**
 * Calculate availability score
 */
export function calculateAvailabilityScore(
  isAvailable: boolean,
  unavailableUntil?: Date
): number {
  if (!isAvailable) {
    if (unavailableUntil && unavailableUntil > new Date()) {
      return 0; // Not available
    }
  }
  return 100; // Available
}

/**
 * Main routing algorithm - find best team member for an enquiry
 */
export async function routeEnquiry(enquiryId: number): Promise<{
  assignedToUserId: number;
  scores: RoutingScore[];
  selectedRule?: string;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database connection unavailable");

  // Get enquiry details
  const enquiry = await db
    .select()
    .from(bookingEnquiries)
    .where(eq(bookingEnquiries.id, enquiryId))
    .then((rows) => rows[0]);

  if (!enquiry) {
    throw new Error("Enquiry not found");
  }

  // Get tour details for category and destination info
  const tour = await db
    .select()
    .from(tours)
    .where(eq(tours.id, enquiry.tourId))
    .then((rows) => rows[0]);

  // Get active routing rules (ordered by priority)
  const rules = await db
    .select()
    .from(routingRules)
    .where(eq(routingRules.isActive, true))
    .orderBy((t) => t.priority);

  // Get all active team members with their expertise and availability
  const teamMembers = await db
    .select({
      user: users,
      availability: teamMemberAvailability,
    })
    .from(users)
    .leftJoin(
      teamMemberAvailability,
      eq(users.id, teamMemberAvailability.userId)
    )
    .where(
      and(
        eq(users.role, "admin"),
        or(
          eq(teamMemberAvailability.isAvailable, true),
          eq(teamMemberAvailability.isAvailable, null)
        )
      )
    );

  // Get expertise for each team member
  const scores: RoutingScore[] = [];

  for (const member of teamMembers) {
    const expertise = await db
      .select()
      .from(teamMemberExpertise)
      .where(
        and(
          eq(teamMemberExpertise.userId, member.user.id),
          eq(teamMemberExpertise.isActive, true)
        )
      );

    const languages = expertise
      .map((e) => e.language)
      .filter((l) => l !== null) as string[];

    const currentLoad = member.availability?.currentEnquiriesCount || 0;
    const maxCapacity = member.availability?.maxEnquiriesPerDay || 10;
    const isAvailable = member.availability?.isAvailable !== false;
    const conversionRate =
      member.availability?.conversionRate?.toString() || "0";

    // Calculate individual scores
    const workloadScore = calculateWorkloadScore(currentLoad, maxCapacity);
    const expertiseScore = calculateExpertiseScore(
      expertise,
      tour?.categoryId,
      enquiry.country
    );
    const languageScore = calculateLanguageScore(languages); // No specific language requirement by default
    const availabilityScore = calculateAvailabilityScore(
      isAvailable,
      member.availability?.unavailableUntil || undefined
    );
    const conversionScoreVal = calculateConversionScore(
      parseFloat(conversionRate)
    );

    // Weighted total score
    const totalScore =
      workloadScore * 0.3 + // 30% weight on workload
      expertiseScore * 0.25 + // 25% weight on expertise
      availabilityScore * 0.2 + // 20% weight on availability
      conversionScoreVal * 0.15 + // 15% weight on conversion
      languageScore * 0.1; // 10% weight on language

    scores.push({
      userId: member.user.id,
      userName: member.user.name || "Unknown",
      email: member.user.email || "",
      totalScore,
      workloadScore,
      expertiseScore,
      availabilityScore,
      languageScore,
      conversionScore: conversionScoreVal,
      breakdown: {
        currentLoad,
        maxCapacity,
        expertise: expertise.map((e) => e.destination || `Category ${e.tourCategoryId}`),
        languages,
        conversionRate: parseFloat(conversionRate),
        isAvailable,
      },
    });
  }

  // Sort by score (highest first)
  scores.sort((a, b) => b.totalScore - a.totalScore);

  if (scores.length === 0) {
    throw new Error("No available team members for routing");
  }

  const selectedMember = scores[0];

  // Find which rule was applied (if any)
  let appliedRule = undefined;
  for (const rule of rules) {
    // Check if rule matches enquiry criteria
    const matches =
      (!rule.tourCategoryId || rule.tourCategoryId === tour?.categoryId) &&
      (!rule.destinationPattern ||
        enquiry.country?.match(rule.destinationPattern));

    if (matches) {
      appliedRule = rule.name;
      break;
    }
  }

  // Record routing decision in audit trail
  await db.insert(routingAudit).values({
    enquiryId,
    routingRuleId: undefined,
    assignedToUserId: selectedMember.userId,
    scoringDetails: JSON.stringify({
      workloadScore: selectedMember.workloadScore,
      expertiseScore: selectedMember.expertiseScore,
      availabilityScore: selectedMember.availabilityScore,
      languageScore: selectedMember.languageScore,
      conversionScore: selectedMember.conversionScore,
      totalScore: selectedMember.totalScore,
    }),
    matchedCriteria: JSON.stringify({
      tourCategory: tour?.categoryId,
      destination: enquiry.country,
      appliedRule,
    }),
  });

  return {
    assignedToUserId: selectedMember.userId,
    scores,
    selectedRule: appliedRule,
  };
}

/**
 * Get routing statistics for analytics
 */
export async function getRoutingStatistics() {
  const db = await getDb();
  if (!db) throw new Error("Database connection unavailable");

  // Get total routed enquiries
  const totalRouted = await db
    .select()
    .from(routingAudit);

  // Get average scores by team member
  const memberStats = await db
    .select({
      userId: routingAudit.assignedToUserId,
      userName: users.name,
      totalAssignments: routingAudit.assignedToUserId,
      averageScore: routingAudit.scoringDetails,
    })
    .from(routingAudit)
    .leftJoin(users, eq(routingAudit.assignedToUserId, users.id))
    .groupBy(routingAudit.assignedToUserId);

  return {
    totalRouted: totalRouted.length,
    memberStats,
    timestamp: new Date(),
  };
}

/**
 * Update team member availability after assignment
 */
export async function updateTeamMemberAvailability(
  userId: number,
  increment: number = 1
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection unavailable");

  const availability = await db
    .select()
    .from(teamMemberAvailability)
    .where(eq(teamMemberAvailability.userId, userId))
    .then((rows) => rows[0]);

  if (availability) {
    const newCount = Math.max(0, availability.currentEnquiriesCount + increment);
    const isAvailable = newCount < availability.maxEnquiriesPerDay;

    await db
      .update(teamMemberAvailability)
      .set({
        currentEnquiriesCount: newCount,
        isAvailable,
        lastAssignmentTime: new Date(),
      })
      .where(eq(teamMemberAvailability.userId, userId));
  } else {
    // Create availability record if it doesn't exist
    await db.insert(teamMemberAvailability).values({
      userId,
      currentEnquiriesCount: increment,
      isAvailable: true,
    });
  }
}

/**
 * Get team member expertise summary
 */
export async function getTeamMemberExpertiseSummary(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection unavailable");

  const expertise = await db
    .select()
    .from(teamMemberExpertise)
    .where(eq(teamMemberExpertise.userId, userId));

  const availability = await db
    .select()
    .from(teamMemberAvailability)
    .where(eq(teamMemberAvailability.userId, userId))
    .then((rows) => rows[0]);

  return {
    expertise,
    availability,
    summary: {
      totalExpertiseAreas: expertise.length,
      languages: [...new Set(expertise.map((e) => e.language).filter(Boolean))],
      destinations: [...new Set(expertise.map((e) => e.destination).filter(Boolean))],
      averageExperience:
        expertise.length > 0
          ? expertise.reduce((sum, e) => sum + (e.yearsOfExperience || 0), 0) /
            expertise.length
          : 0,
    },
  };
}
