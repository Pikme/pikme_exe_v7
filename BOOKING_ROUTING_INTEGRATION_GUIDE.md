# Booking Modal + Automated Routing Integration Guide

## Overview

The booking modal now integrates seamlessly with the automated routing system. When customers submit a booking enquiry, the system automatically assigns it to the best-suited team member based on expertise, workload, language skills, and availability.

## Architecture

### Components

1. **BookingModalWithRouting.tsx** (`client/src/components/BookingModalWithRouting.tsx`)
   - Enhanced booking modal with routing status display
   - Real-time feedback on enquiry assignment
   - Manual override option for special cases

2. **Booking Enquiries Router** (`server/routers/booking-enquiries.ts`)
   - Updated `create` mutation with automatic routing trigger
   - Graceful error handling if routing fails
   - Returns routing information in response

3. **Routing Team Router** (`server/routers/routing-team.ts`)
   - `getTeamMembers` - List available team members for manual assignment
   - `getTeamMemberById` - Get detailed team member information

4. **Integration Tests** (`server/booking-routing.integration.test.ts`)
   - 23 comprehensive tests covering all integration scenarios
   - All tests passing

## User Flow

### Step 1: Customer Fills Booking Form
Customer enters personal information, travel details, and special requests in the booking modal.

```
┌─────────────────────────────────────┐
│  Booking Modal                      │
│  ┌─────────────────────────────────┐│
│  │ Personal Information             ││
│  │ • First Name, Last Name          ││
│  │ • Email, Phone                   ││
│  │ • Country                        ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ Travel Details                   ││
│  │ • Number of Travelers            ││
│  │ • Preferred Dates                ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ Additional Information           ││
│  │ • Special Requests               ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Step 2: Submit Enquiry
Customer clicks "Send Enquiry" button.

```
┌─────────────────────────────────────┐
│  Routing Status: Loading            │
│  ⟳ Finding the best team member...  │
└─────────────────────────────────────┘
```

### Step 3: Automatic Routing
System evaluates all team members using the routing algorithm.

```
Scoring Calculation:
- Workload Score (30%): Current load vs capacity
- Expertise Score (25%): Destination/category match
- Availability Score (20%): Is member available?
- Conversion Score (15%): Historical success rate
- Language Score (10%): Language requirements

Total Score = Weighted Sum of All Scores
```

### Step 4: Assignment Confirmation
System displays assignment result with team member name and match score.

```
✓ Auto-routed successfully
  Assigned to Sarah (match score: 87.5%)
```

### Step 5: Success Message
Customer receives confirmation with routing information.

```
Success: Your booking enquiry has been sent successfully 
and automatically assigned to Sarah (score: 87.5%). 
We will contact you soon!
```

## Implementation Details

### Booking Creation with Routing

**File:** `server/routers/booking-enquiries.ts`

```typescript
create: publicProcedure
  .input(z.object({
    tourId: z.number(),
    firstName: z.string(),
    // ... other fields
  }))
  .mutation(async ({ input }) => {
    // 1. Create enquiry
    const result = await createBookingEnquiry({...});

    // 2. Notify admin
    await notifyOwner({...});

    // 3. Automatically route enquiry
    try {
      const routingResult = await routeEnquiry(result.id);
      return {
        ...result,
        autoRoutingApplied: true,
        assignedToUserId: routingResult.assignedToUserId,
        routingScore: routingResult.scores[0]?.totalScore,
      };
    } catch (routingError) {
      // Return enquiry even if routing fails
      return {
        ...result,
        autoRoutingApplied: false,
        routingError: routingError.message,
      };
    }
  })
```

### Modal UI with Routing Status

**File:** `client/src/components/BookingModalWithRouting.tsx`

```typescript
// Routing status states
const [routingStatus, setRoutingStatus] = useState<RoutingStatus>({
  applied: false,
  loading: false,
});

// Display loading state
{routingStatus.loading && (
  <Card className="bg-blue-50 border-blue-200">
    <CardContent className="pt-6">
      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      <p>Routing enquiry...</p>
    </CardContent>
  </Card>
)}

// Display success state
{routingStatus.applied && !routingStatus.loading && (
  <Card className="bg-green-50 border-green-200">
    <CardContent className="pt-6">
      <CheckCircle2 className="h-5 w-5 text-green-600" />
      <p>Auto-routed successfully</p>
      <p>Assigned to {routingStatus.assignedToName} 
         (match score: {routingStatus.score?.toFixed(1)}%)</p>
    </CardContent>
  </Card>
)}

// Display error state with manual override option
{routingStatus.error && !routingStatus.loading && (
  <Card className="bg-amber-50 border-amber-200">
    <CardContent className="pt-6">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <p>Routing unavailable: {routingStatus.error}</p>
      <button onClick={() => setShowManualOverride(!showManualOverride)}>
        Assign manually
      </button>
    </CardContent>
  </Card>
)}
```

### Manual Assignment Override

When automatic routing fails, users can manually select a team member:

```typescript
{showManualOverride && (
  <Card className="bg-gray-50 border-gray-200">
    <CardContent>
      <Select value={manualOverride} onValueChange={setManualOverride}>
        <SelectTrigger>
          <SelectValue placeholder="Select team member..." />
        </SelectTrigger>
        <SelectContent>
          {teamMembers?.map((member) => (
            <SelectItem key={member.id} value={member.id.toString()}>
              {member.name} ({member.email})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CardContent>
  </Card>
)}
```

## Error Handling

### Scenario 1: No Available Team Members
**Status:** Routing fails
**User Experience:** 
- Shows error message: "No available team members"
- Offers manual assignment option
- Enquiry is still created and stored

### Scenario 2: Routing Service Timeout
**Status:** Routing takes too long
**User Experience:**
- After 5 seconds, shows error message
- Offers manual assignment option
- Enquiry is still created and stored

### Scenario 3: Network Error
**Status:** Cannot reach routing service
**User Experience:**
- Shows error message: "Routing service temporarily unavailable"
- Offers manual assignment option
- Enquiry is still created and stored

## Success Metrics

### Automatic Routing Success Rate
Track percentage of enquiries successfully auto-routed:
- Target: 95%+ auto-routing success rate
- Monitor: Failed routing attempts and reasons

### Assignment Quality
Measure quality of automatic assignments:
- Metric: Average routing score of assignments
- Target: Average score > 80/100

### Team Member Utilization
Ensure balanced workload distribution:
- Metric: Coefficient of variation in workload
- Target: Balanced distribution (CV < 0.3)

### Customer Experience
Monitor customer satisfaction with routing:
- Metric: Conversion rate (enquiry to booking)
- Metric: Response time from assigned team member
- Target: Response within 2 hours

## Configuration

### Enable/Disable Automatic Routing

To disable automatic routing temporarily:

```typescript
// In booking-enquiries.ts
const ENABLE_AUTO_ROUTING = true; // Set to false to disable

if (ENABLE_AUTO_ROUTING) {
  try {
    const routingResult = await routeEnquiry(result.id);
    // ... handle routing
  } catch (error) {
    // ... handle error
  }
}
```

### Adjust Routing Timeout

```typescript
const ROUTING_TIMEOUT_MS = 5000; // 5 seconds

const routingPromise = routeEnquiry(result.id);
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("Routing timeout")), ROUTING_TIMEOUT_MS)
);

const routingResult = await Promise.race([routingPromise, timeoutPromise]);
```

## Testing

### Run Integration Tests

```bash
# Run all booking-routing integration tests
pnpm test server/booking-routing.integration.test.ts

# Expected output:
# ✓ server/booking-routing.integration.test.ts (23 tests) 113ms
# Test Files  1 passed (1)
#      Tests  23 passed (23)
```

### Test Coverage

The integration tests cover:
- ✓ Enquiry creation with automatic routing
- ✓ Routing failure handling
- ✓ Manual assignment override
- ✓ Routing status communication (loading, success, error)
- ✓ User experience flow
- ✓ Notification and confirmation
- ✓ Modal state management
- ✓ Manual override flow
- ✓ Error handling
- ✓ Performance and timing

## Monitoring and Debugging

### Log Automatic Routing

Check server logs for routing information:

```
[BOOKING] Enquiry #123 auto-routed to user 5
[BOOKING] Enquiry #124 auto-routed to user 8 (score: 87.5)
[BOOKING] Failed to auto-route enquiry #125: No available team members
```

### View Routing Audit Trail

Access routing decisions for specific enquiries:

```typescript
const audit = await trpc.routing.getRoutingAudit.query({
  enquiryId: 123
});

// Returns:
// {
//   enquiryId: 123,
//   routingRuleId: 5,
//   assignedToUserId: 8,
//   scoringDetails: { ... },
//   createdAt: Date
// }
```

### Monitor Routing Performance

Track routing operation metrics:

```typescript
const stats = await trpc.routing.getRoutingStats.query();

// Returns:
// {
//   totalRouted: 1250,
//   successRate: 0.95,
//   averageScore: 82.3,
//   memberStats: [...]
// }
```

## Troubleshooting

### Issue: Enquiries Not Being Routed

**Symptoms:**
- Enquiries show "routing failed" message
- Manual override required for all enquiries

**Solutions:**
1. Check if any team members are marked as available
2. Verify team member expertise is configured
3. Check routing rules are active
4. Review server logs for routing errors

### Issue: Incorrect Team Member Assigned

**Symptoms:**
- Enquiries assigned to wrong team member
- Routing scores seem incorrect

**Solutions:**
1. Review team member expertise configuration
2. Check workload limits are set correctly
3. Verify language requirements match
4. Review routing algorithm weights

### Issue: Slow Routing Response

**Symptoms:**
- Routing takes more than 5 seconds
- Users see timeout errors

**Solutions:**
1. Reduce number of team members evaluated
2. Optimize routing algorithm
3. Check database query performance
4. Consider caching routing results

## Future Enhancements

1. **Machine Learning Integration**
   - Learn from successful/unsuccessful assignments
   - Predict best team member based on patterns

2. **Real-time Notifications**
   - Notify team member immediately of new assignment
   - Show notification in team member dashboard

3. **Advanced Analytics**
   - Dashboard showing routing effectiveness
   - Team member performance metrics
   - Conversion rate by assigned team member

4. **A/B Testing**
   - Test different routing strategies
   - Measure impact on conversion rates

5. **Integration with CRM**
   - Sync team member data from CRM
   - Track customer preferences
   - Historical assignment patterns

## Support

For issues or questions about booking-routing integration:
1. Check the troubleshooting section above
2. Review integration tests for expected behavior
3. Check server logs for routing errors
4. Contact development team with routing logs
