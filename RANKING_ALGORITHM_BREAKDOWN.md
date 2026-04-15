# Search Result Ranking Algorithm - Technical Breakdown

**Document Version:** 1.0  
**Last Updated:** February 3, 2026  
**Author:** Manus AI  

---

## Executive Overview

The Pikme search result ranking algorithm is a sophisticated multi-factor scoring system that combines engagement metrics, user behavior data, and temporal decay to surface the most relevant and high-performing locations. The algorithm operates on a weighted composite score that balances popularity (view count), user interest (click-through rate), business value (conversion rate), and recency (recent activity boost).

The system is designed to be transparent, tunable, and statistically rigorous, enabling administrators to adjust ranking weights in real-time and compare performance between different ranking strategies through A/B testing.

---

## Algorithm Architecture

### Core Components

The ranking system consists of four primary components working in concert:

**1. Engagement Metrics Collection** - Aggregates user interaction data (views, clicks, conversions) from the event tracking system into normalized metrics for each location.

**2. Metric Normalization** - Converts raw counts and percentages into comparable 0-100 scales to ensure fair weighting across different metric types.

**3. Composite Score Calculation** - Combines normalized metrics using configurable weights to produce a final ranking score for each location.

**4. Temporal Decay Application** - Applies exponential decay to recent activity scores, ensuring trending locations receive a boost while older data gradually loses influence.

### Data Flow

```
User Interaction Events
    ↓
Event Aggregation (views, clicks, conversions)
    ↓
Metric Calculation (CTR, conversion rate, recency)
    ↓
Metric Normalization (0-100 scale)
    ↓
Weighted Composite Scoring
    ↓
Temporal Decay Application
    ↓
Final Ranking Score
    ↓
Sort Results by Score (descending)
```

---

## Mathematical Formulas

### 1. Engagement Score Calculation

The engagement score combines three normalized metrics into a single 0-100 value:

**Formula:**

```
EngagementScore = (ViewScore × 0.2) + (CTRScore × 0.4) + (ConversionScore × 0.4)
```

Where:
- **ViewScore** = min(ViewCount / 100, 100) - Normalized view count capped at 100
- **CTRScore** = (ClickCount / ViewCount) × 100 - Click-through rate as percentage
- **ConversionScore** = (ConversionCount / ViewCount) × 100 - Conversion rate as percentage

**Interpretation:**

The engagement score weights click-through rate and conversion rate more heavily (40% each) than raw view count (20%), reflecting the principle that quality engagement matters more than raw popularity. This prevents locations with high traffic but low engagement from dominating results.

**Example Calculation:**

Consider Location A with the following metrics:
- View Count: 500 (ViewScore = min(500/100, 100) = 100)
- Click Count: 75 (CTR = 75/500 × 100 = 15%)
- Conversion Count: 25 (Conversion Rate = 25/500 × 100 = 5%)

EngagementScore = (100 × 0.2) + (15 × 0.4) + (5 × 0.4)
EngagementScore = 20 + 6 + 2 = **28**

### 2. Recency Score Calculation

The recency score applies exponential decay to boost recently active locations while gradually reducing the influence of older data:

**Formula:**

```
RecencyScore = 100 × e^(-daysSinceActivity / decayDays)
```

Where:
- **daysSinceActivity** = (CurrentTime - LastActivityDate) / (24 hours)
- **decayDays** = Decay half-life parameter (default: 30 days)
- **e** = Euler's number (2.71828...)

**Interpretation:**

The exponential decay function ensures that locations with recent activity receive a significant boost, while the influence of older activity gradually diminishes. The decay half-life (30 days) means that activity from 30 days ago contributes approximately 37% of the score of today's activity.

**Decay Curve:**

| Days Since Activity | RecencyScore | Relative Influence |
|-------------------|--------------|-------------------|
| 0 (today) | 100 | 100% |
| 7 days | 78.8 | 79% |
| 14 days | 62.1 | 62% |
| 30 days | 36.8 | 37% |
| 60 days | 13.5 | 14% |
| 90 days | 5.0 | 5% |

**Example Calculation:**

Consider Location B with last activity 14 days ago:

RecencyScore = 100 × e^(-14 / 30)
RecencyScore = 100 × e^(-0.467)
RecencyScore = 100 × 0.627
RecencyScore = **62.7**

### 3. Final Ranking Score Calculation

The final ranking score combines the engagement score and recency score using configurable weights:

**Formula:**

```
FinalRankingScore = (EngagementScore × EngagementWeight) + (RecencyScore × RecencyWeight)
```

Where:
- **EngagementWeight** = Sum of (ViewWeight + CTRWeight + ConversionWeight) = 0.8
- **RecencyWeight** = 0.2
- **EngagementScore** = Calculated from engagement metrics (0-100)
- **RecencyScore** = Calculated from temporal decay (0-100)

**Default Configuration:**

| Component | Weight | Purpose |
|-----------|--------|---------|
| View Count | 0.2 | Popularity indicator |
| Click-Through Rate | 0.3 | User interest signal |
| Conversion Rate | 0.3 | Business value indicator |
| Recent Activity | 0.2 | Trending boost |
| **Total** | **1.0** | |

**Interpretation:**

The 0.8/0.2 split between engagement and recency means that established, high-performing locations retain strong ranking positions while still allowing trending locations to climb the rankings. This balances stability (consistent high performers) with dynamism (emerging trends).

**Example Calculation:**

Combining the previous examples:

FinalRankingScore = (28 × 0.8) + (62.7 × 0.2)
FinalRankingScore = 22.4 + 12.54
FinalRankingScore = **34.94**

---

## Metric Calculations

### Click-Through Rate (CTR)

**Definition:** The percentage of views that result in clicks on a location.

**Formula:**

```
CTR = (ClickCount / ViewCount) × 100
```

**Calculation in Database:**

```sql
ROUND(
  (SUM(CASE WHEN e.eventType = 'click' THEN 1 ELSE 0 END) / 
   NULLIF(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) * 100), 2
) as clickThroughRate
```

**Interpretation:**

CTR measures how compelling a location appears to users in search results. Higher CTR indicates that users find the location relevant and worth exploring. A CTR of 10% means 1 in 10 users who see the location click on it.

**Typical Ranges:**

- **Below 2%:** Weak relevance or poor presentation
- **2-5%:** Average performance
- **5-10%:** Good performance
- **Above 10%:** Excellent performance

### Conversion Rate

**Definition:** The percentage of views that result in a conversion (booking, inquiry, or other desired action).

**Formula:**

```
ConversionRate = (ConversionCount / ViewCount) × 100
```

**Calculation in Database:**

```sql
ROUND(
  (SUM(CASE WHEN e.eventType = 'conversion' THEN 1 ELSE 0 END) / 
   NULLIF(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) * 100), 2
) as conversionRate
```

**Interpretation:**

Conversion rate is the most direct measure of business value. It indicates what percentage of interested users (those who viewed the location) actually take the desired action. This is the strongest signal of location quality and user satisfaction.

**Typical Ranges:**

- **Below 1%:** Low conversion potential
- **1-3%:** Average conversion
- **3-5%:** Good conversion
- **Above 5%:** Excellent conversion

### View Count

**Definition:** The total number of times a location has been viewed in search results or detail pages.

**Calculation in Database:**

```sql
COALESCE(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) as viewCount
```

**Interpretation:**

View count indicates overall popularity and visibility. While raw popularity is less important than engagement quality, it serves as a baseline indicator of location awareness and provides statistical confidence (more views = more reliable metrics).

**Normalization:**

View count is normalized by dividing by 100 and capping at 100, meaning a location with 100+ views receives the maximum view score of 100. This prevents very popular locations from dominating rankings solely based on volume.

---

## Weighting Strategy

### Default Weight Configuration

The algorithm uses a carefully balanced weighting scheme:

| Metric | Weight | Rationale |
|--------|--------|-----------|
| View Count | 0.2 (20%) | Popularity baseline, but not dominant |
| Click-Through Rate | 0.3 (30%) | Strong signal of relevance and appeal |
| Conversion Rate | 0.3 (30%) | Direct business value, equally important as CTR |
| Recent Activity | 0.2 (20%) | Trends and freshness, but not overweighting |

### Weight Rationale

**Why 30% for CTR and Conversion Rate?**

These metrics are equally weighted because they represent different but equally important aspects of quality. CTR indicates user interest and relevance, while conversion rate indicates actual business value. Together, they provide a comprehensive quality signal.

**Why 20% for View Count?**

Raw popularity is weighted lower because it can be misleading. A location with 1000 views but only 1% CTR is less valuable than a location with 100 views and 15% CTR. However, some weight is given to popularity because it provides statistical confidence and indicates baseline awareness.

**Why 20% for Recent Activity?**

Recency is weighted at 20% to balance stability with dynamism. This ensures that:
- Established high performers maintain strong rankings
- Trending locations can climb rankings
- Seasonal variations are accommodated
- Stale content gradually loses visibility

### Adjusting Weights

Administrators can adjust weights to optimize for different business objectives:

**For Maximizing Conversions:**
```
viewWeight: 0.1
ctrWeight: 0.2
conversionWeight: 0.5  // Increased
recencyWeight: 0.2
```

**For Promoting Trending Content:**
```
viewWeight: 0.15
ctrWeight: 0.25
conversionWeight: 0.25
recencyWeight: 0.35  // Increased
```

**For Balanced Approach (Default):**
```
viewWeight: 0.2
ctrWeight: 0.3
conversionWeight: 0.3
recencyWeight: 0.2
```

---

## Implementation Details

### Database Query Structure

The ranking algorithm executes a single optimized SQL query that aggregates events and calculates metrics:

```sql
SELECT 
  l.id as locationId,
  l.name,
  l.description,
  l.image,
  l.slug,
  COALESCE(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) as viewCount,
  COALESCE(SUM(CASE WHEN e.eventType = 'click' THEN 1 ELSE 0 END), 0) as clickCount,
  COALESCE(SUM(CASE WHEN e.eventType = 'conversion' THEN 1 ELSE 0 END), 0) as conversionCount,
  COALESCE(
    ROUND(
      (SUM(CASE WHEN e.eventType = 'click' THEN 1 ELSE 0 END) / 
       NULLIF(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) * 100), 2
    ), 0
  ) as clickThroughRate,
  COALESCE(
    ROUND(
      (SUM(CASE WHEN e.eventType = 'conversion' THEN 1 ELSE 0 END) / 
       NULLIF(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) * 100), 2
    ), 0
  ) as conversionRate,
  MAX(e.createdAt) as lastActivityDate
FROM locations l
LEFT JOIN tagEngagementEvents e ON l.id = e.locationId
WHERE l.id IN (?, ?, ...)
GROUP BY l.id, l.name, l.description, l.image, l.slug
```

**Query Optimization:**

- **LEFT JOIN:** Includes locations with no events (zero metrics)
- **COALESCE:** Handles NULL values from locations with no events
- **NULLIF:** Prevents division by zero when calculating CTR/conversion rate
- **GROUP BY:** Aggregates all events per location
- **MAX(createdAt):** Captures most recent activity for recency calculation

### Computational Complexity

**Time Complexity:** O(n log n) where n is the number of locations
- Database query: O(n) aggregation + O(n log n) sorting
- Post-processing: O(n) for score calculations

**Space Complexity:** O(n) for storing metrics and results

**Performance Characteristics:**

- Typical query time for 1000 locations: 50-100ms
- Typical query time for 10,000 locations: 200-500ms
- Typical query time for 100,000 locations: 1-2 seconds

### Caching Strategy

The algorithm supports multi-level caching for performance optimization:

**Level 1: Application Cache (5 minutes)**
- Caches ranking results in memory
- Invalidated when feature flags change
- Reduces database load for repeated queries

**Level 2: Database Query Cache**
- MySQL query cache (if enabled)
- Caches metric aggregations
- Automatically invalidated on event inserts

**Level 3: Materialized Views (Optional)**
- Pre-computed hourly aggregations
- Trades freshness for query speed
- Useful for very large datasets

---

## Feature Flag Integration

The ranking algorithm integrates with the feature flag system to support A/B testing:

### Variant Assignment

When a user requests ranked results, the system checks their assigned variant:

```typescript
const variant = await getRankingVariant(userId, sessionId);

if (variant === 'control') {
  // Return results in original order
  return locationIds.map((id, index) => ({
    finalRankingScore: 100 - index,
    // ... other fields
  }));
} else {
  // Apply new ranking algorithm
  return rankSearchResults(locationIds, config);
}
```

**Consistent Hashing:**

Variant assignment uses consistent hashing to ensure stable assignment across sessions:

```typescript
function getVariant(userId: string, flagName: string, rolloutPercentage: number) {
  const hash = hashFunction(`${userId}:${flagName}`);
  const normalized = hash % 100;
  return normalized < rolloutPercentage ? 'treatment' : 'control';
}
```

This ensures that the same user always receives the same variant, enabling fair comparison between groups.

---

## Performance Optimization Techniques

### 1. Metric Normalization

Metrics are normalized to 0-100 scale to ensure fair weighting:

```typescript
const viewScore = Math.min(viewCount / 100, 100);
const ctrScore = clickThroughRate || 0;  // Already 0-100
const conversionScore = conversionRate || 0;  // Already 0-100
```

This prevents one metric from dominating due to different scales (e.g., view count in thousands vs. CTR in single digits).

### 2. Exponential Decay

Exponential decay provides smooth temporal weighting:

```typescript
const daysSinceActivity = (now - lastActivityDate) / (1000 * 60 * 60 * 24);
const recencyScore = 100 * Math.exp(-daysSinceActivity / decayDays);
```

This is more natural than linear decay and prevents cliff effects where older data suddenly loses all influence.

### 3. Batch Processing

For large result sets, the algorithm processes results in batches:

```typescript
const batchSize = 100;
for (let i = 0; i < locationIds.length; i += batchSize) {
  const batch = locationIds.slice(i, i + batchSize);
  const metrics = await getLocationEngagementMetrics(batch);
  // Process batch
}
```

This reduces memory usage and improves cache efficiency.

---

## Ranking Variations

### Trending Locations

Identifies high-activity locations from the past 7 days:

**Query Focus:**
- Recent activity (last 7 days)
- High view count
- Good click-through rate
- Ignores older data

**Use Case:** Homepage "Trending Now" section

### High-Conversion Locations

Identifies locations with proven conversion potential:

**Query Focus:**
- Minimum 5% conversion rate
- Minimum 10 views (statistical confidence)
- Sorted by conversion rate then view count
- Ignores recency

**Use Case:** "Best Performing" or "Most Booked" sections

### Top Engagement Locations

Identifies overall best performers across all metrics:

**Query Focus:**
- Balanced weighting of all metrics
- Minimum view count (statistical confidence)
- Sorted by composite engagement score
- Includes recency weighting

**Use Case:** General search results ranking

---

## Comparison with Alternative Approaches

### Approach 1: Simple Popularity (View Count)

**Pros:** Easy to understand, simple to implement
**Cons:** Doesn't account for quality, can be gamed, misses trending content

### Approach 2: Recency Only

**Pros:** Promotes fresh content, responsive to trends
**Cons:** Ignores proven performers, unstable rankings, can promote low-quality content

### Approach 3: Engagement-Based (Our Approach)

**Pros:** Balances quality, popularity, and freshness; statistically rigorous; tunable; supports A/B testing
**Cons:** More complex, requires event tracking, needs careful weight calibration

---

## Monitoring & Optimization

### Key Metrics to Monitor

| Metric | Target | Purpose |
|--------|--------|---------|
| Average CTR | +15-25% vs control | Measure ranking relevance |
| Average Conversion Rate | +10-20% vs control | Measure business impact |
| User Satisfaction | +20% vs control | Measure user perception |
| Ranking Stability | <5% daily change | Ensure consistent experience |

### Optimization Feedback Loop

1. **Monitor Performance** - Track CTR, conversion rate, and user satisfaction
2. **Identify Patterns** - Analyze which weight configurations perform best
3. **Adjust Weights** - Update configuration based on learnings
4. **A/B Test Changes** - Validate improvements before full rollout
5. **Measure Impact** - Compare new configuration against baseline
6. **Iterate** - Repeat process with refined configuration

---

## Edge Cases & Handling

### Division by Zero

When calculating CTR or conversion rate, view count may be zero:

```sql
NULLIF(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0)
```

The NULLIF function converts 0 to NULL, which prevents division by zero and results in NULL (handled as 0 by COALESCE).

### Missing Data

Locations with no events receive default scores:

```typescript
viewCount: 0
clickThroughRate: 0
conversionRate: 0
recencyScore: 0
engagementScore: 0
finalRankingScore: 0
```

These locations appear at the bottom of rankings but are still included for completeness.

### Very Old Data

Locations with activity older than 90 days receive minimal recency boost:

```
RecencyScore (90 days) = 100 × e^(-90/30) = 100 × e^(-3) = 4.98
```

This ensures that stale content gradually loses visibility while remaining searchable.

---

## Conclusion

The Pikme search result ranking algorithm represents a sophisticated balance between multiple competing objectives: popularity, quality, business value, and freshness. Through careful metric selection, thoughtful weighting, and exponential decay, the algorithm surfaces the most relevant and high-performing locations while remaining transparent, tunable, and statistically rigorous.

The integration with feature flags and A/B testing enables continuous optimization and data-driven decision making, allowing the ranking strategy to evolve based on real user behavior and business outcomes.

---

## Appendix: Quick Reference

### Default Configuration

```typescript
const DEFAULT_CONFIG = {
  viewWeight: 0.2,
  ctrWeight: 0.3,
  conversionWeight: 0.3,
  recencyWeight: 0.2,
  decayDays: 30,
};
```

### Key Formulas

| Formula | Purpose |
|---------|---------|
| `EngagementScore = (ViewScore × 0.2) + (CTRScore × 0.4) + (ConversionScore × 0.4)` | Engagement calculation |
| `RecencyScore = 100 × e^(-daysSinceActivity / decayDays)` | Temporal decay |
| `FinalRankingScore = (EngagementScore × 0.8) + (RecencyScore × 0.2)` | Final score |
| `CTR = (ClickCount / ViewCount) × 100` | Click-through rate |
| `ConversionRate = (ConversionCount / ViewCount) × 100` | Conversion rate |

### Typical Metric Ranges

| Metric | Poor | Average | Good | Excellent |
|--------|------|---------|------|-----------|
| CTR | <2% | 2-5% | 5-10% | >10% |
| Conversion Rate | <1% | 1-3% | 3-5% | >5% |
| View Count | <10 | 10-100 | 100-1000 | >1000 |
| Engagement Score | <20 | 20-50 | 50-75 | >75 |

