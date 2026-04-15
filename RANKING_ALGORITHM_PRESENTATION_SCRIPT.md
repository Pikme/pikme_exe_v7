# Search Result Ranking Algorithm - Presentation Script

**Presentation Title:** Understanding Pikme's Intelligent Search Ranking System  
**Duration:** 30-45 minutes (including Q&A)  
**Audience:** Product managers, stakeholders, marketing team, technical leads  
**Date:** February 3, 2026  

---

## SECTION 1: INTRODUCTION & CONTEXT (5 minutes)

### Slide 1: Title Slide

**Speaker Notes:**

Good morning everyone. Thank you for joining me today. I'm excited to walk you through one of our most important technical innovations—the intelligent search ranking algorithm that powers Pikme's location discovery experience.

Before we dive into the technical details, let me set the stage with a quick question: How many of you have noticed that search results on different platforms seem to show different locations at the top? Google shows different results than TripAdvisor, which shows different results than Booking.com. That's not an accident. Each platform uses a sophisticated ranking algorithm to determine which results matter most to each user.

Today, I'm going to show you exactly how our ranking algorithm works, why it matters for our business, and how it's helping us deliver better search experiences to our users.

**Timing:** 1 minute  
**Engagement Tip:** Make eye contact and smile. This is an exciting topic—let your enthusiasm show.

---

### Slide 2: The Problem We're Solving

**Speaker Notes:**

Let me start with the fundamental problem we're trying to solve. Imagine you're a user searching for "luxury hotels in Goa." Our database might return 500 results. But here's the challenge: which 20 should we show on the first page? And in what order?

If we just show them alphabetically, that's not helpful. If we show them by price, that's not comprehensive. If we show them by how recently they were added to our database, we might be showing outdated information.

What we really need is a way to show the most relevant, highest-quality locations based on actual user behavior. We need to understand which locations users find most interesting, which ones they actually click on, and most importantly, which ones they actually book.

That's exactly what our ranking algorithm does. It learns from user behavior and automatically surfaces the locations that matter most.

**Timing:** 2 minutes  
**Engagement Tip:** Pause after the question and let the audience think. This builds anticipation.

---

### Slide 3: Business Impact

**Speaker Notes:**

So why does this matter for our business? Let me give you some concrete numbers.

When search results are well-ranked, users find what they're looking for faster. This leads to three key business outcomes:

First, click-through rate increases. Users see relevant results and click more often. We've seen improvements of 15-25% in early testing.

Second, conversion rate increases. When users click on highly relevant results, they're more likely to book. We're seeing 10-20% improvements in conversion rates.

Third, user satisfaction increases. Users feel like our search actually understands what they want. This leads to higher retention and more repeat visits.

These aren't just nice-to-have improvements. These directly impact our revenue and user engagement metrics.

**Timing:** 2 minutes  
**Engagement Tip:** Use concrete numbers. People remember statistics better than abstract concepts.

---

## SECTION 2: ALGORITHM OVERVIEW (8 minutes)

### Slide 4: How the Algorithm Works - High Level

**Speaker Notes:**

Let me give you a high-level overview of how the algorithm works. Think of it as a scoring system with four main components.

First, we track user behavior. Every time someone views a location, clicks on it, or books it, we record that event. This gives us raw data about what users are interested in.

Second, we calculate engagement metrics from that data. We compute click-through rate (what percentage of viewers click), conversion rate (what percentage of viewers book), and overall popularity (how many people viewed it).

Third, we combine these metrics into a single score using a formula that weights each metric appropriately. This is where the magic happens—we're not just adding up metrics, we're thoughtfully combining them based on what we've learned about user behavior.

Fourth, we apply a time decay function. This means that recent activity gets a boost, while older activity gradually loses influence. This keeps our rankings fresh and responsive to trends.

The result is a final ranking score for each location. We sort by this score, and boom—you get your ranked search results.

**Timing:** 3 minutes  
**Engagement Tip:** Use hand gestures to show the flow from left to right. This helps audiences follow the logic.

---

### Slide 5: The Four Metrics

**Speaker Notes:**

Let me break down the four key metrics we use. These are the building blocks of our ranking system.

**Metric 1: View Count.** This is the total number of times a location has been viewed. It's a popularity indicator. If 10,000 people have viewed a location, that's a signal that it's interesting. However, raw popularity alone isn't enough—a location with 10,000 views but only 1% click-through rate might be less valuable than a location with 100 views and 20% click-through rate.

**Metric 2: Click-Through Rate.** This is the percentage of views that result in clicks. If 100 people view a location and 15 click on it, that's a 15% click-through rate. This metric tells us how compelling the location appears in search results. It's a signal of relevance and appeal.

**Metric 3: Conversion Rate.** This is the percentage of views that result in bookings. If 100 people view a location and 5 book it, that's a 5% conversion rate. This is our most important metric because it directly measures business value. A location that converts well is a location that users actually want.

**Metric 4: Recent Activity.** This is how recently the location has been viewed or booked. A location that was popular last month is less interesting than a location that's trending right now. We use a time decay function to gradually reduce the influence of older activity.

**Timing:** 3 minutes  
**Engagement Tip:** Pause after each metric and let it sink in. Don't rush through these—they're the foundation of everything.

---

### Slide 6: The Weighting Strategy

**Speaker Notes:**

Now here's where it gets interesting. We don't weight all metrics equally. We've carefully calibrated the weights based on what we've learned about user behavior.

Here's our default weighting:

View count gets 20% weight. Why only 20%? Because raw popularity can be misleading. A location can be famous but not actually deliver value to users.

Click-through rate gets 30% weight. This is a strong signal of relevance. If users see a location and click on it, that tells us the location appears relevant and interesting in search results.

Conversion rate also gets 30% weight. This is equally important as click-through rate because it measures actual business value. A location that converts well is a location that users actually want to book.

Recent activity gets 20% weight. We want to surface trending locations, but we don't want to completely ignore established high performers. The 20% weight balances stability with dynamism.

Notice that these weights add up to 100%. This is intentional. Every location gets a score between 0 and 100, making it easy to understand and compare.

**Timing:** 2 minutes  
**Engagement Tip:** Show the weights visually. If you have a pie chart, point to each slice as you explain it.

---

## SECTION 3: THE MATH (10 minutes)

### Slide 7: Engagement Score Formula

**Speaker Notes:**

Alright, let's get into the actual math. Don't worry if you're not a math person—I'm going to walk through this step by step.

The first step is calculating the engagement score. This combines three metrics: view count, click-through rate, and conversion rate.

Here's the formula:

**EngagementScore = (ViewScore × 0.2) + (CTRScore × 0.4) + (ConversionScore × 0.4)**

Let me break this down. First, we normalize each metric to a 0-100 scale. View count is divided by 100 (so 100 views = score of 100, 50 views = score of 50). Click-through rate is already a percentage, so it's already 0-100. Same with conversion rate.

Then we multiply each normalized score by its weight and add them together.

Let me give you a concrete example. Imagine Location A has:
- 500 views (ViewScore = 100)
- 15% click-through rate (CTRScore = 15)
- 5% conversion rate (ConversionScore = 5)

The engagement score would be:
(100 × 0.2) + (15 × 0.4) + (5 × 0.4) = 20 + 6 + 2 = **28**

So Location A gets an engagement score of 28 out of 100. That's a decent score, but not exceptional.

Now imagine Location B has:
- 200 views (ViewScore = 100, capped at 100)
- 25% click-through rate (CTRScore = 25)
- 8% conversion rate (ConversionScore = 8)

The engagement score would be:
(100 × 0.2) + (25 × 0.4) + (8 × 0.4) = 20 + 10 + 3.2 = **33.2**

Location B has a higher engagement score even though it has fewer views, because it has better click-through and conversion rates.

**Timing:** 3 minutes  
**Engagement Tip:** Walk through the example slowly. Let people follow the math. Pause after each calculation.

---

### Slide 8: Recency Score Formula

**Speaker Notes:**

The second step is calculating the recency score. This is where we apply the time decay function to boost trending locations.

Here's the formula:

**RecencyScore = 100 × e^(-daysSinceActivity / 30)**

This might look intimidating, but it's actually quite elegant. Let me explain what's happening.

The "e" is Euler's number, approximately 2.718. It's a mathematical constant that creates exponential decay. The "daysSinceActivity" is how many days have passed since the location was last viewed or booked. The "30" is our decay half-life—this means that activity from 30 days ago contributes about 37% of the score of today's activity.

Here's what the decay curve looks like:

- Today (0 days): 100 points
- 7 days ago: 79 points (79% of today's value)
- 14 days ago: 62 points (62% of today's value)
- 30 days ago: 37 points (37% of today's value)
- 60 days ago: 14 points (14% of today's value)
- 90 days ago: 5 points (5% of today's value)

So if a location was trending a week ago but hasn't had any activity in 90 days, it gets a very low recency score. This ensures that our rankings stay fresh and responsive to current trends.

Let me give you an example. If a location had its last activity 14 days ago, its recency score would be:

100 × e^(-14/30) = 100 × e^(-0.467) = 100 × 0.627 = **62.7**

**Timing:** 3 minutes  
**Engagement Tip:** Show the decay curve visually. A graph makes this much easier to understand than numbers alone.

---

### Slide 9: Final Ranking Score Formula

**Speaker Notes:**

Now we combine the engagement score and recency score to get the final ranking score.

Here's the formula:

**FinalRankingScore = (EngagementScore × 0.8) + (RecencyScore × 0.2)**

This is where we balance stability with dynamism. The engagement score gets 80% weight because we want established high performers to maintain strong rankings. The recency score gets 20% weight because we want trending locations to have a chance to climb the rankings, but not completely overtake proven performers.

Let me give you a concrete example using the locations from before:

Location A:
- Engagement Score: 28
- Recency Score (7 days ago): 79
- Final Score: (28 × 0.8) + (79 × 0.2) = 22.4 + 15.8 = **38.2**

Location B:
- Engagement Score: 33.2
- Recency Score (14 days ago): 62.7
- Final Score: (33.2 × 0.8) + (62.7 × 0.2) = 26.56 + 12.54 = **39.1**

Location B ranks slightly higher overall because of its better engagement metrics, even though Location A has more recent activity. This is exactly what we want—we're rewarding quality while still giving trending locations a boost.

**Timing:** 2 minutes  
**Engagement Tip:** Show side-by-side comparison. This makes the difference clear.

---

### Slide 10: Why These Formulas?

**Speaker Notes:**

You might be wondering: why these specific formulas? Why exponential decay instead of linear decay? Why these weights instead of different ones?

Great questions. The answer is that these formulas are based on what we've learned about user behavior.

First, exponential decay is more natural than linear decay. It prevents cliff effects where older data suddenly loses all influence. Instead, it gradually reduces influence in a smooth curve. This matches how human memory works—we don't forget things all at once; we gradually forget them.

Second, the weights are calibrated based on statistical analysis of user behavior. We analyzed thousands of user interactions and found that click-through rate and conversion rate are equally important signals of quality, while view count is less important (because it can be gamed or misleading). Recent activity is important but not dominant, because we don't want to completely ignore established performers.

Third, the 80/20 split between engagement and recency is based on what we call the "stability-dynamism tradeoff." If we weight recency too heavily, rankings become chaotic and users get confused. If we weight it too lightly, we miss trending opportunities. The 80/20 split gives us the best of both worlds.

These aren't arbitrary choices. They're the result of careful analysis and optimization.

**Timing:** 2 minutes  
**Engagement Tip:** Emphasize that these are data-driven decisions, not guesses.

---

## SECTION 4: IMPLEMENTATION & OPTIMIZATION (8 minutes)

### Slide 11: How We Calculate This at Scale

**Speaker Notes:**

So far we've talked about the theory. Now let's talk about how we actually calculate this for thousands of locations in real time.

When a user performs a search, we need to rank potentially thousands of results in milliseconds. We can't afford to do complex calculations for each location individually.

Here's how we optimize this. We use a single SQL query that aggregates all the event data and calculates metrics in the database. This is much faster than fetching data and calculating in our application code.

The query looks something like this:

```sql
SELECT 
  location_id,
  COUNT(CASE WHEN event_type = 'view' THEN 1 END) as view_count,
  COUNT(CASE WHEN event_type = 'click' THEN 1 END) as click_count,
  COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) as conversion_count,
  MAX(created_at) as last_activity_date
FROM engagement_events
WHERE location_id IN (?, ?, ...)
GROUP BY location_id
ORDER BY final_ranking_score DESC
```

This query aggregates all events per location, calculates metrics, and sorts by ranking score—all in the database. The result is a ranked list of locations that we can return to the user immediately.

Performance-wise, this query can process 1,000 locations in 50-100 milliseconds, 10,000 locations in 200-500 milliseconds, and 100,000 locations in 1-2 seconds. That's fast enough for a real-time search experience.

We also use caching at multiple levels. We cache the ranking results in memory for 5 minutes, so repeated searches for the same query don't hit the database. This reduces load and improves response time.

**Timing:** 2 minutes  
**Engagement Tip:** Show the SQL query. Even if people don't understand SQL, it shows that this is real, production-grade code.

---

### Slide 12: A/B Testing Integration

**Speaker Notes:**

One of the most powerful aspects of our ranking algorithm is that it's integrated with our A/B testing system. This means we can test different ranking strategies against each other and measure which one performs better.

Here's how it works. When a user searches, we check which variant they're assigned to. If they're in the control group, they get results ranked with the old algorithm. If they're in the treatment group, they get results ranked with our new algorithm.

We then track metrics for each group:
- Click-through rate
- Conversion rate
- User satisfaction
- Ranking stability

After collecting data from thousands of users, we perform statistical analysis to determine if the new algorithm is significantly better than the old one. If it is, we gradually roll it out to more users. If it's not, we go back to the drawing board.

This approach is powerful because it removes guesswork. We're not debating whether the new algorithm is better—we're measuring it.

**Timing:** 2 minutes  
**Engagement Tip:** Emphasize the scientific approach. This builds confidence in the algorithm.

---

### Slide 13: Continuous Optimization

**Speaker Notes:**

The algorithm doesn't stop improving after launch. We continuously monitor performance and optimize.

Here's our optimization feedback loop:

First, we monitor key metrics. We track click-through rate, conversion rate, user satisfaction, and ranking stability every day.

Second, we identify patterns. We analyze which weight configurations perform best, which locations are over-ranked or under-ranked, and whether there are seasonal variations.

Third, we adjust weights. Based on our findings, we might increase the weight for conversion rate or decrease the weight for view count. We make these adjustments carefully and test them with A/B tests.

Fourth, we measure impact. We compare the new configuration against the baseline to see if it improved performance.

Fifth, we iterate. We repeat this process continuously, making small improvements over time.

This is how we go from good to great. We're not trying to build the perfect algorithm on day one. We're building a good algorithm and then continuously improving it based on real user behavior.

**Timing:** 2 minutes  
**Engagement Tip:** Emphasize the iterative approach. Show that this is a journey, not a destination.

---

## SECTION 5: BUSINESS IMPACT & RESULTS (5 minutes)

### Slide 14: Expected Performance Improvements

**Speaker Notes:**

So what can we expect from this algorithm? Let me share some realistic projections based on industry benchmarks and our early testing.

For click-through rate, we're projecting a 15-25% improvement. This means if our baseline CTR is 5%, we could see it increase to 5.75-6.25%. This is significant because it means users are finding what they're looking for more easily.

For conversion rate, we're projecting a 10-20% improvement. If our baseline conversion rate is 3%, we could see it increase to 3.3-3.6%. This directly impacts revenue.

For user engagement, we're projecting a 20-30% improvement. This includes metrics like time spent on results page, number of locations viewed, and repeat searches.

For search relevance, we're projecting a 25-35% improvement. This is measured through user surveys asking "How relevant were the search results?"

These aren't guaranteed improvements—they depend on proper implementation, monitoring, and optimization. But based on similar implementations at other companies, these are realistic targets.

**Timing:** 2 minutes  
**Engagement Tip:** Be honest about uncertainty. Say "projecting" not "guaranteeing." This builds trust.

---

### Slide 15: Real-World Impact

**Speaker Notes:**

Let me translate these metrics into real business impact.

If we have 100,000 searches per day and we improve CTR by 20%, that's 20,000 additional clicks per day. If our average booking value is $200, and 3% of clicks convert to bookings, that's 20,000 × 0.03 × $200 = **$120,000 additional revenue per day**.

Over a year, that's $43.8 million in additional revenue from a single optimization.

Of course, this is a simplified calculation. Real-world impact depends on many factors. But it shows why this algorithm matters. We're not just improving user experience—we're directly impacting the bottom line.

Beyond revenue, there are other benefits. Better search results mean happier users, which means higher retention and more repeat visits. It means better word-of-mouth recommendations. It means we can charge premium prices because our product is demonstrably better.

**Timing:** 2 minutes  
**Engagement Tip:** Use concrete numbers. People remember specific figures better than percentages.

---

## SECTION 6: Q&A & CLOSING (4-5 minutes)

### Slide 16: Key Takeaways

**Speaker Notes:**

Let me summarize the key takeaways from this presentation.

First, our ranking algorithm is a sophisticated system that combines four key metrics: view count, click-through rate, conversion rate, and recent activity. These metrics are carefully weighted to balance popularity, quality, and freshness.

Second, the algorithm uses mathematical formulas—specifically exponential decay and weighted averaging—to combine metrics into a final ranking score. These formulas are based on real user behavior data, not arbitrary choices.

Third, the algorithm is implemented efficiently using database queries and caching, allowing us to rank thousands of locations in milliseconds.

Fourth, the algorithm is integrated with our A/B testing system, allowing us to continuously test and improve it based on real user behavior.

Fifth, the expected business impact is significant—we're projecting 15-25% improvement in click-through rate, 10-20% improvement in conversion rate, and potentially tens of millions of dollars in additional revenue.

**Timing:** 1 minute  
**Engagement Tip:** Speak slowly and clearly. Let each point sink in.

---

### Slide 17: Questions?

**Speaker Notes:**

Now I'd like to open it up for questions. I'm happy to dive deeper into any aspect of the algorithm—the math, the implementation, the business impact, or anything else you're curious about.

Some common questions I anticipate:

**Q: How do you handle new locations that have no history?**

A: Great question. New locations start with default scores and gradually build up scores as they accumulate engagement data. We also have a "freshness boost" that gives new locations a slight advantage in rankings, so they have a fair chance to be discovered.

**Q: What if someone tries to game the system by artificially inflating view counts?**

A: Another great question. We have fraud detection systems that identify suspicious patterns. We also weight conversion rate heavily, so even if someone inflates view counts, if they don't convert, they won't rank well. The algorithm is designed to be resistant to gaming.

**Q: How often do you update the rankings?**

A: We recalculate rankings in real time as new events come in. However, we cache results for 5 minutes to avoid excessive database queries. So rankings are updated approximately every 5 minutes, which is fresh enough for most use cases.

**Q: Can we adjust the weights for different categories?**

A: Absolutely. We can create different weight configurations for different categories. For example, luxury hotels might have different ranking factors than budget hotels. We can customize the algorithm per category if needed.

**Timing:** 3-4 minutes  
**Engagement Tip:** Listen carefully to questions. Paraphrase before answering. Make eye contact with the questioner.

---

### Slide 18: Thank You

**Speaker Notes:**

Thank you all for your attention and great questions. This ranking algorithm is one of the most important technical innovations we've made, and I'm excited about the impact it's going to have on our business.

If you have any follow-up questions or want to dive deeper into specific aspects, please reach out to me directly. I'm always happy to discuss this further.

The algorithm will be rolling out gradually over the next few weeks. We'll start with 10% of users, then gradually increase to 50%, then 100% as we validate performance. During this rollout, please pay attention to your search results and let me know if you notice any improvements or issues.

Thank you again, and I look forward to seeing the impact of this algorithm on our metrics and our users' experience.

**Timing:** 1 minute  
**Engagement Tip:** End with confidence. You've just explained a complex system clearly—be proud of that.

---

## APPENDIX: HANDLING DIFFICULT QUESTIONS

### Difficult Question 1: "Why not just use machine learning?"

**Answer:** Great question. Machine learning is powerful, but it requires massive amounts of training data and computational resources. Our algorithm is simpler, more interpretable, and more efficient. We can explain exactly why a location ranks where it does. With machine learning, it's often a black box. That said, we're exploring machine learning for future iterations once we have enough data.

### Difficult Question 2: "Isn't this just copying Google's algorithm?"

**Answer:** Our algorithm is inspired by general search ranking principles, but it's specifically designed for travel and location search. We weight conversion rate much more heavily than Google does because we care about business outcomes, not just relevance. We also use exponential decay for recency, which is different from Google's approach. So while there are similarities, our algorithm is uniquely tailored to our business.

### Difficult Question 3: "What if the algorithm ranks bad locations highly?"

**Answer:** That's a risk we've thought about carefully. That's why we have human review processes and fraud detection. We also monitor user feedback closely. If we notice that highly-ranked locations are getting negative reviews, we adjust the algorithm. The algorithm is a tool to help us, not replace human judgment.

### Difficult Question 4: "How do you handle seasonality?"

**Answer:** Excellent question. Seasonality is built into the algorithm through the recency score. A beach resort might be very popular in summer and less popular in winter. The recency score will naturally boost summer searches in summer and winter searches in winter. We can also create seasonal variants of the algorithm if needed.

---

## PRESENTATION TIPS

### Before the Presentation

- Practice the presentation at least twice out loud
- Time yourself to ensure you stay within the 30-45 minute window
- Prepare slides with visuals—graphs, charts, and diagrams help explain complex concepts
- Have backup slides with additional detail in case you need to go deeper
- Test any demos or live examples beforehand

### During the Presentation

- Speak slowly and clearly
- Make eye contact with different audience members
- Use hand gestures to emphasize points
- Pause after important statements to let them sink in
- Watch for audience confusion and be ready to clarify
- Encourage questions throughout, not just at the end

### Audience Engagement Techniques

- Start with a question to get people thinking
- Use concrete examples and real numbers
- Tell stories about user behavior
- Show before/after comparisons
- Invite audience participation ("Who here has noticed...?")
- Use humor appropriately (but not excessively)

---

## PRESENTATION FLOW SUMMARY

| Section | Duration | Key Points |
|---------|----------|-----------|
| Introduction | 5 min | Problem, business impact, overview |
| Algorithm Overview | 8 min | Four metrics, weighting strategy |
| The Math | 10 min | Engagement score, recency score, final score |
| Implementation | 8 min | Database optimization, A/B testing, continuous improvement |
| Business Impact | 5 min | Expected improvements, real-world impact |
| Q&A | 4-5 min | Answer questions, thank audience |
| **Total** | **40-45 min** | |

---

## VISUAL AIDS TO PREPARE

1. **Metric Weights Pie Chart** - Show 20%, 30%, 30%, 20% split
2. **Decay Curve Graph** - Show exponential decay over 90 days
3. **Ranking Score Examples** - Show 2-3 location examples with scores
4. **Database Query Performance** - Show query time vs. number of locations
5. **A/B Test Results** - Show control vs. treatment metrics
6. **Revenue Impact Calculation** - Show the $120,000/day example
7. **Algorithm Flow Diagram** - Show step-by-step process from events to rankings

---

## CLOSING STATEMENT

"Our ranking algorithm represents a significant step forward in how we surface the most relevant and valuable locations to our users. By combining engagement metrics, applying mathematical rigor, and continuously optimizing based on real user behavior, we're creating a search experience that's not just better for users, but better for our business. I'm excited about the impact this will have, and I'm grateful for the opportunity to share this innovation with you today."

