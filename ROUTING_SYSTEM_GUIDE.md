# Automated Enquiry Routing System Guide

## Overview

The Automated Enquiry Routing System intelligently assigns booking enquiries to team members based on expertise, workload, language skills, and availability. This system reduces manual assignment overhead and ensures enquiries reach the most qualified team members.

## Architecture

### Core Components

1. **Routing Engine** (`server/routing-engine.ts`)
   - Scoring algorithm that evaluates team members
   - Expertise matching and workload balancing
   - Availability and conversion rate tracking

2. **Routing Router** (`server/routers/routing.ts`)
   - tRPC procedures for routing operations
   - Configuration management for team expertise and rules
   - Routing statistics and audit trails

3. **Routing Webhooks** (`server/webhooks/routing-webhook.ts`)
   - Automatic routing triggers on new enquiries
   - Bulk routing and rebalancing operations
   - Team member status change handlers

4. **Admin UI** (`client/src/pages/admin/AdminRoutingConfig.tsx`)
   - Configure team member expertise and skills
   - Set availability and workload limits
   - Create and manage routing rules
   - Preview routing scores before applying

### Database Schema

#### `teamMemberExpertise`
Stores skills, specializations, and language proficiency for team members.

```sql
- id: Primary key
- userId: Reference to user
- tourCategoryId: Expertise in specific tour category
- destination: Expertise in specific destination
- language: Language proficiency (en, es, fr, etc.)
- proficiencyLevel: beginner, intermediate, expert
- yearsOfExperience: Years of experience in this area
- maxConcurrentEnquiries: Maximum workload capacity
- isActive: Whether this expertise is active
```

#### `teamMemberAvailability`
Tracks current workload and availability status.

```sql
- id: Primary key
- userId: Reference to user
- currentEnquiriesCount: Current active enquiries
- maxEnquiriesPerDay: Maximum assignments per day
- isAvailable: Whether member can receive new assignments
- unavailableUntil: When member becomes available again
- lastAssignmentTime: Last assignment timestamp
- averageResponseTime: Average response time in minutes
- conversionRate: Booking conversion percentage (0-100)
```

#### `routingRules`
Defines rules for automatic enquiry assignment.

```sql
- id: Primary key
- name: Rule name
- description: Rule description
- priority: Higher priority rules evaluated first
- tourCategoryId: Match enquiries for specific tour category
- destinationPattern: Regex pattern for destination matching
- requiredLanguage: Required language for assignee
- minExperienceYears: Minimum experience required
- assignmentStrategy: round_robin, least_loaded, expertise_match, random
- isActive: Whether rule is active
```

#### `routingAudit`
Audit trail for all automatic routing decisions.

```sql
- id: Primary key
- enquiryId: Reference to enquiry
- routingRuleId: Which rule triggered the assignment
- assignedToUserId: Who was assigned
- scoringDetails: JSON with scoring breakdown
- matchedCriteria: JSON with matched criteria
- createdAt: When routing occurred
```

## Scoring Algorithm

The routing system uses a weighted scoring algorithm to determine the best team member for each enquiry.

### Score Components

1. **Workload Score (30% weight)**
   - Evaluates current workload vs. capacity
   - Formula: `100 - (currentEnquiries / maxCapacity) * 100`
   - Range: 0-100 (100 = completely free)

2. **Expertise Score (25% weight)**
   - Matches tour category and destination
   - Base score: 50 points
   - +30 points for tour category match
   - +20 points for destination match
   - Range: 0-100

3. **Availability Score (20% weight)**
   - Checks if member is available for new assignments
   - 100 = available, 0 = unavailable
   - Considers unavailability end time

4. **Conversion Score (15% weight)**
   - Historical booking conversion rate
   - Range: 0-100 (percentage)

5. **Language Score (10% weight)**
   - Matches required language skills
   - 100 = language match, 0 = no match
   - 50 = neutral (no requirement)

### Total Score Calculation

```
Total Score = (Workload × 0.30) + (Expertise × 0.25) + 
              (Availability × 0.20) + (Conversion × 0.15) + 
              (Language × 0.10)
```

**Range: 0-100** (100 = best match)

## Usage Guide

### 1. Configure Team Member Expertise

**Admin Panel:** `/admin/routing` → Expertise Tab

```typescript
// Add expertise for a team member
trpc.routing.configureExpertise.mutate({
  userId: 5,
  destination: "Goa",
  language: "es",
  proficiencyLevel: "expert",
  yearsOfExperience: 5,
  maxConcurrentEnquiries: 15
});
```

**What to Configure:**
- Destination expertise (e.g., Goa, Kerala, Rajasthan)
- Language proficiency (e.g., English, Spanish, French)
- Proficiency level (Beginner, Intermediate, Expert)
- Years of experience in this area
- Maximum concurrent enquiries they can handle

### 2. Manage Team Member Availability

**Admin Panel:** `/admin/routing` → Availability Tab

```typescript
// Update availability
trpc.routing.updateAvailability.mutate({
  userId: 5,
  isAvailable: true,
  maxEnquiriesPerDay: 20,
  currentEnquiriesCount: 8
});
```

**When to Use:**
- Team member on vacation/leave
- Workload is too high
- Temporary unavailability
- Update conversion rates

### 3. Create Routing Rules

**Admin Panel:** `/admin/routing` → Routing Rules Tab

```typescript
// Create a rule for Spanish-speaking enquiries
trpc.routing.createRoutingRule.mutate({
  name: "Spanish Enquiries",
  priority: 10,
  requiredLanguage: "es",
  assignmentStrategy: "expertise_match",
  minExperienceYears: 2
});
```

**Rule Types:**
- **Destination-based:** Route Goa enquiries to Goa specialists
- **Language-based:** Route Spanish enquiries to Spanish speakers
- **Category-based:** Route adventure tours to adventure specialists
- **Experience-based:** Route complex enquiries to experienced members

### 4. Preview Routing Scores

**Admin Panel:** `/admin/routing` → Preview Routing Tab

```typescript
// Get routing scores for an enquiry
const scores = await trpc.routing.getRoutingScores.query({
  enquiryId: 123
});

// Returns:
// {
//   enquiryId: 123,
//   scores: [
//     {
//       userId: 5,
//       userName: "John Doe",
//       totalScore: 87.5,
//       workloadScore: 90,
//       expertiseScore: 85,
//       ...
//     },
//     ...
//   ],
//   recommendedUserId: 5,
//   appliedRule: "Spanish Enquiries"
// }
```

### 5. Apply Automatic Routing

**Automatic (on new enquiry):**
```typescript
// Triggered automatically when new enquiry is created
await handleEnquiryCreated(enquiryId);
```

**Manual (single enquiry):**
```typescript
trpc.routing.autoRouteEnquiry.mutate({
  enquiryId: 123
});
```

**Bulk routing:**
```typescript
trpc.routing.bulkAutoRoute.mutate({
  enquiryIds: [123, 124, 125]
});
```

## Real-World Examples

### Example 1: Goa Specialist

**Setup:**
- Team member: Sarah
- Expertise: Goa (expert), 5 years
- Languages: English, Spanish
- Max capacity: 15 enquiries/day
- Current load: 8 enquiries

**Routing Decision:**
When a Spanish-language Goa enquiry arrives:
- Workload score: 47 (8/15 = 53% loaded)
- Expertise score: 100 (category + destination match)
- Language score: 100 (Spanish match)
- Availability score: 100 (available)
- Conversion score: 85 (historical data)
- **Total: 88.5/100** → Assigned to Sarah

### Example 2: Overloaded Team Member

**Setup:**
- Team member: John
- Expertise: General tours
- Max capacity: 10 enquiries/day
- Current load: 10 enquiries (100% loaded)

**Routing Decision:**
When a new enquiry arrives:
- Workload score: 0 (completely full)
- Expertise score: 50 (no specific match)
- Availability score: 100 (technically available)
- **Total: 35/100** → NOT assigned to John

Instead, routed to less-loaded team member with score 65+.

### Example 3: Language-Specific Routing

**Setup:**
- Rule: "French Enquiries" (priority 10)
- Required language: French
- Strategy: Expertise match

**Routing Decision:**
When French enquiry arrives:
- Only team members with French language are considered
- Among French speakers, highest expertise + lowest workload wins
- Ensures language-specific enquiries reach qualified members

## Monitoring & Analytics

### View Routing Statistics

```typescript
const stats = await trpc.routing.getRoutingStats.query();

// Returns:
// {
//   totalRouted: 1250,
//   memberStats: [
//     {
//       userId: 5,
//       userName: "John Doe",
//       totalAssignments: 450,
//       averageScore: 82.3
//     },
//     ...
//   ],
//   timestamp: Date
// }
```

### Check Routing Audit Trail

```typescript
const audit = await trpc.routing.getRoutingAudit.query({
  enquiryId: 123
});

// Returns detailed routing history:
// {
//   enquiryId: 123,
//   routingRuleId: 5,
//   assignedToUserId: 8,
//   scoringDetails: { ... },
//   matchedCriteria: { ... },
//   createdAt: Date
// }
```

## Best Practices

### 1. Keep Expertise Data Updated
- Review team expertise quarterly
- Update years of experience annually
- Add new destination expertise as team grows

### 2. Monitor Workload Balance
- Check `currentEnquiriesCount` weekly
- Adjust `maxEnquiriesPerDay` based on team capacity
- Mark unavailable during peak periods

### 3. Use Routing Rules Strategically
- Create rules for high-volume languages/destinations
- Set appropriate priority (higher = evaluated first)
- Test rules with preview before applying

### 4. Track Conversion Rates
- Update `conversionRate` monthly
- Use this to identify top performers
- Assign complex enquiries to high-conversion members

### 5. Handle Special Cases
- Create rules for VIP clients
- Set minimum experience for complex tours
- Use manual assignment for edge cases

## Troubleshooting

### No Team Members Available
**Problem:** "No available team members for routing"

**Solutions:**
1. Check if any team members are marked as available
2. Verify workload limits are not too strict
3. Add more team members or increase capacity

### Enquiries Not Being Routed
**Problem:** Enquiries remain unassigned

**Solutions:**
1. Check routing rules are active (`isActive: true`)
2. Verify team member expertise matches enquiry criteria
3. Review workload - may be at capacity
4. Check language requirements match available speakers

### Uneven Workload Distribution
**Problem:** Some team members overloaded, others underutilized

**Solutions:**
1. Adjust `maxEnquiriesPerDay` for overloaded members
2. Add expertise areas to underutilized members
3. Create rules to distribute specific enquiry types
4. Review conversion rates - high performers may need more

### Low Routing Scores
**Problem:** All team members scoring below 50

**Solutions:**
1. Add more expertise areas to team members
2. Reduce workload limits temporarily
3. Mark unavailable members as unavailable
4. Review and adjust routing rules

## API Reference

### Core Procedures

#### `routing.autoRouteEnquiry`
Automatically route a single enquiry.

```typescript
mutation autoRouteEnquiry(enquiryId: number) {
  success: boolean
  enquiryId: number
  assignedToUserId: number
  assignedToName: string
  score: number
  allScores: RoutingScore[]
  appliedRule?: string
}
```

#### `routing.getRoutingScores`
Get scoring preview for an enquiry (without assigning).

```typescript
query getRoutingScores(enquiryId: number) {
  enquiryId: number
  scores: RoutingScore[]
  recommendedUserId: number
  recommendedUserName: string
  appliedRule?: string
}
```

#### `routing.configureExpertise`
Configure team member expertise.

```typescript
mutation configureExpertise({
  userId: number
  tourCategoryId?: number
  destination?: string
  language?: string
  proficiencyLevel: "beginner" | "intermediate" | "expert"
  yearsOfExperience?: number
  maxConcurrentEnquiries?: number
}) {
  success: boolean
  message: string
}
```

#### `routing.updateAvailability`
Update team member availability and workload.

```typescript
mutation updateAvailability({
  userId: number
  isAvailable?: boolean
  unavailableUntil?: Date
  maxEnquiriesPerDay?: number
  currentEnquiriesCount?: number
}) {
  success: boolean
  message: string
}
```

#### `routing.createRoutingRule`
Create a new routing rule.

```typescript
mutation createRoutingRule({
  name: string
  description?: string
  priority: number
  tourCategoryId?: number
  destinationPattern?: string
  requiredLanguage?: string
  minExperienceYears?: number
  assignmentStrategy: "round_robin" | "least_loaded" | "expertise_match" | "random"
}) {
  success: boolean
  message: string
  ruleId: number
}
```

#### `routing.bulkAutoRoute`
Route multiple enquiries at once.

```typescript
mutation bulkAutoRoute(enquiryIds: number[]) {
  success: boolean
  message: string
  successCount: number
  errorCount: number
  results: Array<{
    enquiryId: number
    success: boolean
    assignedToUserId?: number
    score?: number
    error?: string
  }>
}
```

## Testing

All routing logic is covered by 41 comprehensive vitest tests:

```bash
# Run routing tests
pnpm test server/routing.test.ts

# Test coverage includes:
# - Workload score calculation
# - Expertise matching
# - Language proficiency scoring
# - Availability evaluation
# - Score weighting and totals
# - Real-world scenarios
# - Edge cases
```

## Future Enhancements

1. **Machine Learning Integration**
   - Predict best team member based on historical data
   - Learn from successful assignments

2. **Dynamic Rule Adjustment**
   - Auto-adjust rules based on performance metrics
   - A/B testing for routing strategies

3. **Real-time Notifications**
   - Notify team members of new assignments
   - Escalation for high-priority enquiries

4. **Advanced Analytics**
   - Routing effectiveness dashboard
   - Team member performance insights
   - Enquiry-to-booking conversion tracking

5. **Integration with CRM**
   - Sync team member data from CRM
   - Track customer preferences
   - Historical assignment patterns

## Support

For issues or questions about the routing system:
1. Check the troubleshooting section above
2. Review routing audit trail for specific enquiries
3. Contact the development team with routing logs
