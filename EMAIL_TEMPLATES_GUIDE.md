# Branded HTML Email Templates Guide

## Overview

The email template system provides professionally designed, branded HTML emails for all notification types. Each template includes:

- **Pikme brand styling** with consistent colors and typography
- **Responsive design** that works on desktop, tablet, and mobile
- **Action links** for quick responses and engagement
- **Customer details** and relevant information
- **Professional footer** with support links

## Architecture

### File Structure

```
server/
  email-templates/
    base.html                    # Base template with branding
    enquiry-assigned.html        # New enquiry assignment
    enquiry-updated.html         # Enquiry update notification
    enquiry-completed.html       # Booking confirmation
    team-message.html            # Team communication
    system-alert.html            # System notifications
  email-template-service.ts      # Template rendering service
  notification-service.ts        # Integration with notifications
  email-templates.test.ts        # 24 comprehensive tests
```

### Template Types

| Template | Trigger | Use Case |
|----------|---------|----------|
| **enquiry-assigned.html** | New enquiry routed | Alert team member of new assignment with customer details |
| **enquiry-updated.html** | Customer updates enquiry | Notify team member of changes requiring action |
| **enquiry-completed.html** | Booking confirmed | Celebrate successful conversion with team member |
| **team-message.html** | Team communication | Internal team notifications |
| **system-alert.html** | System events | Maintenance, alerts, important updates |

## Template Features

### Base Template (base.html)

The base template provides:

- **Header** with Pikme logo and branding
- **Content area** for template-specific content
- **Footer** with links and copyright
- **Responsive styling** for all devices
- **CSS variables** for easy customization

**Key Colors:**
- Primary Blue: `#0066cc`
- Success Green: `#28a745`
- Warning Orange: `#ffc107`
- Background: `#f5f5f5`

### Enquiry Assignment Template

**Subject:** `New Enquiry: {tourName}`

**Includes:**
- Customer information (name, email, phone, country)
- Tour details (name, travelers, dates, special requests)
- Matching score (expertise, workload, availability breakdown)
- Quick-action buttons (Accept, Defer, View)
- Next steps guidance

**Variables:**
```
{{teamMemberName}}           # Recipient name
{{customerName}}             # Customer full name
{{customerEmail}}            # Customer email
{{customerPhone}}            # Customer phone
{{customerCountry}}          # Customer country
{{tourName}}                 # Tour name
{{numberOfTravelers}}        # Number of travelers
{{preferredStartDate}}       # Preferred start date
{{preferredEndDate}}         # Preferred end date
{{specialRequests}}          # Special requests
{{tourCategory}}             # Tour category
{{matchingScore}}            # Matching percentage (0-100)
{{actionUrl}}                # View enquiry link
{{acceptUrl}}                # Accept quick action link
{{deferUrl}}                 # Defer quick action link
{{viewUrl}}                  # View details link
{{settingsUrl}}              # Notification settings link
{{appUrl}}                   # Base app URL
{{assignedAt}}               # Assignment timestamp
{{enquiryId}}                # Enquiry ID
```

### Enquiry Update Template

**Subject:** `Update: {customerName} - {updateType}`

**Includes:**
- Customer information
- Update type and message
- Action link to view enquiry
- Guidance on next steps

**Variables:**
```
{{teamMemberName}}
{{customerName}}
{{customerEmail}}
{{customerPhone}}
{{updateType}}               # Type of update
{{updateMessage}}            # Update details
{{actionUrl}}
{{appUrl}}
{{settingsUrl}}
{{enquiryId}}
{{updatedAt}}
```

### Enquiry Completion Template

**Subject:** `Booking Confirmed: {tourName}`

**Includes:**
- Customer information
- Booking details (dates, travelers, value)
- Confirmation badge
- Performance metrics (conversion rate)
- Next steps (confirmation email, payment, itinerary)

**Variables:**
```
{{teamMemberName}}
{{customerName}}
{{tourName}}
{{numberOfTravelers}}
{{startDate}}
{{endDate}}
{{bookingValue}}             # Formatted currency
{{bookingId}}
{{conversionRate}}           # Team member's conversion %
{{actionUrl}}
{{appUrl}}
{{settingsUrl}}
{{enquiryId}}
{{confirmedAt}}
```

### Team Message Template

**Subject:** `Message from {senderName}`

**Includes:**
- Sender information
- Message content
- Reply link
- Channel information

**Variables:**
```
{{teamMemberName}}
{{senderName}}               # Message sender
{{message}}                  # Message content
{{channel}}                  # Communication channel
{{actionUrl}}
{{appUrl}}
{{settingsUrl}}
{{sentAt}}
```

### System Alert Template

**Subject:** `[Alert] {alertType}`

**Includes:**
- Alert type and severity
- Alert message
- Impact information
- Timeline (start/end times)
- Affected services

**Variables:**
```
{{teamMemberName}}
{{alertType}}                # Alert category
{{alertMessage}}             # Alert details
{{alertColor}}               # Color code (#ff9800, etc)
{{startTime}}
{{endTime}}
{{duration}}
{{affectedServices}}
{{impact}}
{{actionUrl}}
{{appUrl}}
{{settingsUrl}}
{{alertId}}
{{sentAt}}
```

## Email Template Service API

### Rendering Functions

```typescript
// Render enquiry assignment email
renderEnquiryAssignmentEmail(data: EmailTemplateData): EmailContent

// Render enquiry update email
renderEnquiryUpdateEmail(data: EmailTemplateData): EmailContent

// Render enquiry completion email
renderEnquiryCompletionEmail(data: EmailTemplateData): EmailContent

// Render team message email
renderTeamMessageEmail(data: EmailTemplateData): EmailContent

// Render system alert email
renderSystemAlertEmail(data: EmailTemplateData): EmailContent

// Render by notification type
renderEmailByType(type: NotificationType, data: EmailTemplateData): EmailContent
```

### Utility Functions

```typescript
// Validate template data has required fields
validateTemplateData(type: NotificationType, data: EmailTemplateData): {
  valid: boolean
  errors: string[]
}

// Format date for email display
formatEmailDate(date: Date | string): string
// Output: "March 15, 2026, 10:30:00 AM"

// Format currency for email display
formatEmailCurrency(amount: number, currency?: string): string
// Output: "$2,500.50" or "€2,500,50"

// Create action URLs for email
createEmailActionUrls(baseUrl: string, notificationId: number, enquiryId?: number): {
  actionUrl: string
  acceptUrl: string
  deferUrl: string
  viewUrl: string
  settingsUrl: string
}

// Prepare email data with defaults
prepareEmailData(type: NotificationType, baseData: EmailTemplateData, baseUrl: string): EmailTemplateData
```

### Email Content Object

```typescript
interface EmailContent {
  subject: string      // Email subject line
  html: string         // HTML email body
  text: string         // Plain text version
}
```

## Integration with Notification System

### Sending Emails

The email templates are automatically integrated with the notification system:

```typescript
import { notifyEnquiryAssignment } from "./notification-service";

// Send notification with branded email
await notifyEnquiryAssignment(
  userId,           // Team member ID
  enquiryId,        // Enquiry ID
  {
    customerName: "John Doe",
    tourName: "Paris City Tour",
    numberOfTravelers: 2,
    email: "john@example.com",
    phone: "+1234567890",
    country: "USA",
    tourCategory: "European Tours",
    matchingScore: 92,
  }
);
```

### Email Sending Flow

```
Enquiry Created
    ↓
Automatic Routing
    ↓
notifyEnquiryAssignment() called
    ↓
Check notification preferences
    ↓
Create in-app notification
    ↓
Render branded email template
    ↓
Send via email service
    ↓
Team member receives branded HTML email
```

## Usage Examples

### Example 1: Send Enquiry Assignment Email

```typescript
import {
  renderEnquiryAssignmentEmail,
  prepareEmailData,
  createEmailActionUrls,
} from "./email-template-service";

const baseUrl = "https://app.pikmeusa.com";
const notificationId = 1;
const enquiryId = 123;

const emailData = prepareEmailData(
  "enquiry_assigned",
  {
    teamMemberName: "John Smith",
    customerName: "Jane Doe",
    customerEmail: "jane@example.com",
    customerPhone: "+1234567890",
    customerCountry: "USA",
    tourName: "Paris City Tour",
    numberOfTravelers: 2,
    preferredStartDate: "2026-03-15",
    preferredEndDate: "2026-03-22",
    specialRequests: "Vegetarian meals required",
    tourCategory: "European Tours",
    matchingScore: 92,
    ...createEmailActionUrls(baseUrl, notificationId, enquiryId),
  },
  baseUrl
);

const email = renderEnquiryAssignmentEmail(emailData);

// Send email
await sendEmail({
  to: "john@pikmeusa.com",
  subject: email.subject,
  html: email.html,
  text: email.text,
});
```

### Example 2: Validate Template Data

```typescript
import { validateTemplateData } from "./email-template-service";

const data = {
  teamMemberName: "John",
  appUrl: "https://app.pikmeusa.com",
  customerName: "Jane",
  customerEmail: "jane@example.com",
  tourName: "Paris",
  actionUrl: "https://app.pikmeusa.com/admin/bookings/1",
};

const validation = validateTemplateData("enquiry_assigned", data);

if (!validation.valid) {
  console.error("Template validation failed:", validation.errors);
}
```

### Example 3: Format Email Data

```typescript
import {
  formatEmailDate,
  formatEmailCurrency,
} from "./email-template-service";

const date = new Date();
const formatted = formatEmailDate(date);
// Output: "January 24, 2026, 09:52:37 AM"

const currency = formatEmailCurrency(2500.5, "USD");
// Output: "$2,500.50"
```

## Customization

### Changing Brand Colors

Edit `server/email-templates/base.html` CSS:

```css
.email-header {
  background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
}

.action-button {
  background-color: #YOUR_PRIMARY_COLOR;
}
```

### Changing Logo

Replace the logo icon in `base.html`:

```html
<div class="logo-icon">✈️</div>  <!-- Change emoji or use <img> -->
```

### Adding Custom Styling

Add CSS to `base.html` `<style>` section:

```css
.custom-section {
  background-color: #f0f5ff;
  padding: 20px;
  border-radius: 6px;
}
```

### Modifying Template Content

Edit the specific template file (e.g., `enquiry-assigned.html`) and add/remove sections as needed.

## Testing

### Run All Email Tests

```bash
pnpm test server/email-templates.test.ts
```

**Expected Output:**
```
✓ server/email-templates.test.ts (24 tests) 55ms
Test Files  1 passed (1)
     Tests  24 passed (24)
```

### Test Coverage

- ✓ All 5 email templates render correctly
- ✓ Action links included in emails
- ✓ Template data validation
- ✓ Date and currency formatting
- ✓ Email action URLs generation
- ✓ Email data preparation with defaults
- ✓ HTML to plain text conversion
- ✓ Email subject line generation
- ✓ Brand styling and footer links

## Best Practices

### 1. Always Validate Data

```typescript
const validation = validateTemplateData("enquiry_assigned", data);
if (!validation.valid) {
  throw new Error(`Invalid email data: ${validation.errors.join(", ")}`);
}
```

### 2. Use Prepared Data

```typescript
// Good: Uses prepareEmailData to add defaults
const data = prepareEmailData("enquiry_assigned", baseData, baseUrl);

// Avoid: Manual data assembly
const data = { ...baseData, appUrl: baseUrl }; // Missing defaults
```

### 3. Include All Action URLs

```typescript
// Good: All action URLs included
const urls = createEmailActionUrls(baseUrl, notificationId, enquiryId);
const data = { ...baseData, ...urls };

// Avoid: Missing action URLs
const data = { ...baseData, actionUrl: url }; // Missing other URLs
```

### 4. Format Dates and Currency

```typescript
// Good: Use formatting functions
const date = formatEmailDate(new Date());
const currency = formatEmailCurrency(2500, "USD");

// Avoid: Raw values
const date = new Date().toString();
const currency = "2500";
```

### 5. Test Before Sending

```typescript
// Always test template rendering
const email = renderEmailByType(type, data);
console.log("Subject:", email.subject);
console.log("HTML length:", email.html.length);
console.log("Text length:", email.text.length);
```

## Troubleshooting

### Issue: Email Not Rendering Correctly

**Symptoms:**
- Missing content in email
- Broken layout on mobile
- Images not loading

**Solutions:**
1. Validate template data: `validateTemplateData(type, data)`
2. Check all required variables are provided
3. Test with different email clients
4. Verify CSS is not stripped by email service

### Issue: Template Variables Not Replaced

**Symptoms:**
- Email shows `{{variableName}}` instead of actual value
- Content appears as literal text

**Solutions:**
1. Check variable name spelling matches exactly
2. Ensure variable is not null or undefined
3. Use `prepareEmailData()` to add defaults
4. Verify template file syntax

### Issue: Styling Not Applied

**Symptoms:**
- Email appears unstyled
- Colors not showing
- Layout broken

**Solutions:**
1. Use inline CSS (email clients strip external stylesheets)
2. Test with email client compatibility tool
3. Avoid advanced CSS features (use basic properties)
4. Include fallback colors

### Issue: Links Not Clickable

**Symptoms:**
- Action buttons not working
- URLs not recognized

**Solutions:**
1. Verify URLs are complete (include protocol)
2. Use `createEmailActionUrls()` for consistent formatting
3. Test URLs in email client
4. Ensure URLs are not wrapped in extra markup

## Performance

### Email Rendering Time

- Average rendering time: **50-100ms**
- Template validation: **5-10ms**
- Data preparation: **2-5ms**

### Optimization Tips

1. **Cache templates** - Load templates once at startup
2. **Batch rendering** - Render multiple emails together
3. **Async sending** - Don't wait for email delivery
4. **Monitor performance** - Track rendering times

## Future Enhancements

1. **Email A/B Testing** - Test different subject lines and content
2. **Dynamic Content** - Personalize based on user preferences
3. **Email Analytics** - Track opens, clicks, conversions
4. **Template Versioning** - Manage multiple template versions
5. **Localization** - Support multiple languages
6. **Advanced Personalization** - ML-based content recommendations

## Support

For issues or questions about email templates:

1. Check troubleshooting section above
2. Review test cases for expected behavior
3. Validate template data with `validateTemplateData()`
4. Check server logs for rendering errors
5. Contact development team with error details

## File References

- **Base Template:** `/server/email-templates/base.html`
- **Service:** `/server/email-template-service.ts`
- **Tests:** `/server/email-templates.test.ts`
- **Integration:** `/server/notification-service.ts`
