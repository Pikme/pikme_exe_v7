# Email Template Preview Dashboard Guide

## Overview

The Email Template Preview Dashboard is an admin tool for previewing, testing, and validating email templates before sending them to users. It provides multiple preview modes, sample data generation, and test email sending capabilities.

## Features

### 1. Template Preview Modes

- **Desktop Preview:** View emails as they appear on desktop email clients
- **Mobile Preview:** Check responsive design on mobile devices
- **HTML View:** Inspect raw HTML code for debugging
- **Text View:** See plain text version for non-HTML email clients

### 2. Sample Data Generation

- **5 Notification Types:** enquiry_assigned, enquiry_updated, enquiry_completed, team_message, system_alert
- **5 Test Scenarios:** luxury_tour, group_tour, budget_tour, honeymoon_tour, family_tour
- **25+ Combinations:** Test all template types with different scenarios
- **Realistic Data:** Sample data includes customer names, tour details, dates, and amounts

### 3. Data Customization

- **Edit Template Data:** Modify any field before rendering
- **Field Validation:** Real-time validation of required fields
- **Data Categorization:** Fields grouped by category (Customer, Tour, Links, etc.)
- **Reset to Defaults:** Quickly revert to default sample data

### 4. Email Testing

- **Test Email Sending:** Send test emails to verify delivery
- **Validation Before Send:** Check for errors before sending
- **Email Statistics:** Track email size and content metrics
- **Download Templates:** Save emails as HTML files for external testing

## Accessing the Dashboard

1. Log in to the admin panel
2. Navigate to **Admin** → **Email Template Preview**
3. Or visit: `/admin/email-template-preview`

## How to Use

### Basic Preview

1. **Select Template Type**
   - Choose from dropdown: enquiry_assigned, enquiry_updated, enquiry_completed, team_message, system_alert

2. **Select Test Scenario**
   - Choose from dropdown: luxury_tour, group_tour, budget_tour, honeymoon_tour, family_tour

3. **View Preview**
   - Desktop: Full-width email preview
   - Mobile: Responsive mobile view
   - HTML: Raw HTML code
   - Text: Plain text version

### Customize Data

1. **Expand Data Editor**
   - Click "Edit Template Data" to customize fields

2. **Modify Fields**
   - Edit customer name, tour details, dates, etc.
   - Fields are grouped by category for easy navigation

3. **Validation**
   - Required fields are marked with red badge
   - Errors appear below invalid fields

4. **Save Changes**
   - Changes auto-save as you type
   - Click "Reset to Defaults" to revert

### Send Test Email

1. **Verify Data**
   - Ensure all required fields are filled
   - Check validation errors

2. **Send Test**
   - Click "Send Test Email" button
   - Email sent to project owner

3. **Confirm Delivery**
   - Check email inbox
   - Verify formatting and content

### Download Template

1. **Click Download Button**
   - Downloads email as HTML file
   - Filename: `email-{type}.html`

2. **External Testing**
   - Test in different email clients
   - Check rendering across platforms

## Sample Scenarios

### Luxury Tour
- **Customer:** Elizabeth & Robert Thompson
- **Team Member:** Victoria Sterling
- **Tour:** Luxury Rajasthan Palace Tour
- **Travelers:** 2
- **Use Case:** High-value bookings, premium service

### Group Tour
- **Customer:** Adventure Club Group
- **Team Member:** Marcus Johnson
- **Tour:** Himalayan Trekking Expedition
- **Travelers:** 12
- **Use Case:** Large group bookings, coordinated logistics

### Budget Tour
- **Customer:** College Friends
- **Team Member:** Aisha Patel
- **Tour:** Backpacker's India Circuit
- **Travelers:** 5
- **Use Case:** Budget-conscious customers, group discounts

### Honeymoon Tour
- **Customer:** James & Sophie Mitchell
- **Team Member:** Emma Watson
- **Tour:** Romantic Kerala Honeymoon
- **Travelers:** 2
- **Use Case:** Romantic packages, special occasions

### Family Tour
- **Customer:** The Anderson Family
- **Team Member:** Priya Sharma
- **Tour:** Family-Friendly India Adventure
- **Travelers:** 4
- **Use Case:** Family packages, kid-friendly activities

## Notification Types

### 1. Enquiry Assignment
**When:** New enquiry routed to team member
**Includes:** Customer details, tour info, matching score, quick-action buttons

### 2. Enquiry Update
**When:** Customer updates enquiry details
**Includes:** Update type, message, customer info, action link

### 3. Enquiry Completion
**When:** Booking confirmed
**Includes:** Booking details, confirmation badge, performance metrics

### 4. Team Message
**When:** Internal team communication
**Includes:** Sender info, message content, reply link

### 5. System Alert
**When:** System maintenance or important updates
**Includes:** Alert type, severity, timeline, affected services

## Template Fields

### Enquiry Assignment Fields
```
Customer Information:
- customerName
- customerEmail
- customerPhone
- customerCountry

Tour & Booking:
- tourName
- numberOfTravelers
- preferredStartDate
- preferredEndDate
- specialRequests
- tourCategory
- matchingScore

Links & URLs:
- actionUrl
- acceptUrl
- deferUrl
- viewUrl
- settingsUrl
```

### Enquiry Update Fields
```
Customer Information:
- customerName
- customerEmail
- customerPhone

Update Details:
- updateType
- updateMessage

Links & URLs:
- actionUrl
```

### Enquiry Completion Fields
```
Tour & Booking:
- tourName
- numberOfTravelers
- startDate
- endDate
- bookingValue
- bookingId
- conversionRate

Links & URLs:
- actionUrl
```

### Team Message Fields
```
Message Details:
- senderName
- message
- channel

Links & URLs:
- actionUrl
```

### System Alert Fields
```
Alert Details:
- alertType
- alertMessage
- alertColor
- startTime
- endTime
- duration
- affectedServices
- impact

Links & URLs:
- actionUrl
```

## Best Practices

### 1. Test All Combinations
- Test each template type with multiple scenarios
- Verify rendering across different email clients
- Check mobile responsiveness

### 2. Customize for Your Needs
- Edit sample data to match your actual use cases
- Test with realistic customer names and tour details
- Verify all links work correctly

### 3. Validate Before Sending
- Always validate data before sending test emails
- Check for missing required fields
- Review email content for accuracy

### 4. Test Email Delivery
- Send test emails to verify delivery
- Check spam folder
- Test with different email providers

### 5. Download for External Testing
- Download HTML templates for testing in different clients
- Test in Gmail, Outlook, Apple Mail, etc.
- Check rendering on various devices

## Troubleshooting

### Email Not Rendering
**Issue:** Email appears broken or unstyled
**Solution:**
1. Check validation errors
2. Verify all required fields are filled
3. Try different preview mode
4. Download and test in email client

### Missing Data in Preview
**Issue:** Some fields appear empty
**Solution:**
1. Check if field is optional
2. Edit data and fill in field
3. Refresh preview
4. Verify data was saved

### Test Email Not Received
**Issue:** Test email not arriving
**Solution:**
1. Check email address is correct
2. Check spam folder
3. Verify notification service is running
4. Check server logs for errors

### Validation Errors
**Issue:** Fields showing validation errors
**Solution:**
1. Ensure all required fields are filled
2. Check field format (email, URL, etc.)
3. Review field type (text, number, date, etc.)
4. Clear error and re-enter data

## Advanced Features

### Compare Templates
Compare two email templates side by side to verify consistency

### Email Statistics
View email size metrics and content statistics

### Scenario Details
View detailed information about each test scenario

### Field Information
See list of all available fields for each template type

## API Reference

### tRPC Procedures

#### `emailPreview.getPreview`
Get email preview with sample data
```typescript
Input: {
  type: "enquiry_assigned" | "enquiry_updated" | "enquiry_completed" | "team_message" | "system_alert"
  scenario?: string
  customData?: Record<string, any>
}

Output: {
  success: boolean
  email: { subject: string, html: string, text: string }
  data: Record<string, any>
  validation: { valid: boolean, errors: string[] }
}
```

#### `emailPreview.getScenarios`
Get list of available scenarios
```typescript
Output: {
  scenarios: string[]
  details: Record<string, any>
}
```

#### `emailPreview.getNotificationTypes`
Get list of notification types
```typescript
Output: {
  types: string[]
}
```

#### `emailPreview.validateData`
Validate template data
```typescript
Input: {
  type: string
  data: Record<string, any>
}

Output: {
  valid: boolean
  errors: string[]
}
```

#### `emailTest.sendTestEmail`
Send test email
```typescript
Input: {
  type: string
  data: Record<string, any>
  recipientEmail?: string
}

Output: {
  success: boolean
  message?: string
  error?: string
}
```

## File References

- **Dashboard Page:** `/client/src/pages/admin/EmailTemplatePreview.tsx`
- **Preview Component:** `/client/src/components/EmailPreview.tsx`
- **Data Editor:** `/client/src/components/EmailDataEditor.tsx`
- **Sample Data:** `/server/email-sample-data.ts`
- **Preview Router:** `/server/routers/email-preview.ts`
- **Test Router:** `/server/routers/email-test.ts`
- **Tests:** `/server/email-preview.test.ts`

## Performance

- **Average Preview Load:** 50-100ms
- **Sample Data Generation:** 5-10ms
- **Email Rendering:** 10-20ms
- **Test Email Sending:** 100-500ms

## Future Enhancements

1. **Email History Tracking** - Track all test emails sent
2. **A/B Testing** - Compare different email versions
3. **Analytics Integration** - Track opens, clicks, conversions
4. **Template Versioning** - Manage multiple template versions
5. **Localization** - Support multiple languages
6. **Custom Branding** - Edit email branding elements
7. **Scheduled Sending** - Schedule test emails for later
8. **Bulk Testing** - Test multiple combinations at once

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review test cases in `/server/email-preview.test.ts`
3. Check server logs for errors
4. Contact development team with error details
