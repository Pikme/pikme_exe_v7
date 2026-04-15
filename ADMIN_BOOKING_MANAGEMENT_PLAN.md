# Admin Booking Management Dashboard - Implementation Plan

## 📋 Overview
Create a comprehensive admin dashboard for managing customer booking enquiries with full CRUD operations, filtering, status tracking, and communication features.

---

## 🎯 Objectives

1. **View All Enquiries** - Display all booking enquiries in a data table with pagination
2. **Filter & Search** - Filter by status, date range, tour, and search by customer name/email
3. **Enquiry Details** - Show complete enquiry information in a detailed modal
4. **Status Management** - Update enquiry status (new → contacted → booked → rejected)
5. **Notes & Communication** - Add internal notes and track communication history
6. **Bulk Actions** - Mark multiple enquiries as contacted, delete, export
7. **Analytics** - Show enquiry statistics and conversion metrics
8. **Email Templates** - Provide response email templates for quick replies

---

## 📊 Data Structure

### Existing bookingEnquiries Table
```
- id (primary key)
- tourId (foreign key)
- firstName
- lastName
- email
- phone
- country
- numberOfTravelers
- preferredStartDate
- preferredEndDate
- specialRequests
- status (new, contacted, booked, rejected)
- createdAt
- updatedAt
```

### Additional Fields Needed
- `adminNotes` (text) - Internal notes from admin
- `assignedTo` (userId) - Admin assigned to handle enquiry
- `lastContactedAt` (timestamp) - When admin last contacted customer
- `responseTemplate` (text) - Email template used for response

---

## 🔧 Implementation Steps

### Phase 1: Data Structure Analysis
**Status:** ✅ Complete
- Review existing bookingEnquiries table schema
- Identify missing fields for admin management
- Plan database migrations if needed

### Phase 2: tRPC Procedures
**Status:** ⏳ In Progress
Create the following procedures:

```typescript
// List all enquiries with filters
bookingEnquiries.list(filters: {
  status?: 'new' | 'contacted' | 'booked' | 'rejected',
  tourId?: number,
  dateFrom?: Date,
  dateTo?: Date,
  search?: string,
  limit: number,
  offset: number
})

// Get enquiry details
bookingEnquiries.getById(id: number)

// Update enquiry status
bookingEnquiries.updateStatus(id: number, status: string)

// Add admin notes
bookingEnquiries.addNote(id: number, note: string)

// Assign enquiry to admin
bookingEnquiries.assign(id: number, adminId: number)

// Delete enquiry
bookingEnquiries.delete(id: number)

// Bulk update status
bookingEnquiries.bulkUpdateStatus(ids: number[], status: string)

// Export enquiries to CSV
bookingEnquiries.exportCSV(filters: object)

// Get enquiry statistics
bookingEnquiries.getStats()
```

### Phase 3: Admin Page Component
**Status:** ⏳ In Progress
Create `AdminBookingManagement.tsx` with:
- Data table with columns: ID, Customer, Tour, Status, Date, Actions
- Pagination controls
- Row selection for bulk actions
- Status badge with color coding
- Quick action buttons (View, Edit, Delete)

### Phase 4: Filtering & Search
**Status:** ⏳ Pending
Implement:
- Status filter dropdown (New, Contacted, Booked, Rejected)
- Tour filter dropdown (populated from tours list)
- Date range picker (From/To dates)
- Search input for customer name/email
- Filter reset button
- Active filter count badge

### Phase 5: Enquiry Detail Modal
**Status:** ⏳ Pending
Display:
- Customer information (Name, Email, Phone, Country)
- Tour information (Tour name, link to tour)
- Travel details (Dates, Number of travelers)
- Special requests
- Current status with timestamp
- Admin notes section with add/edit capability
- Communication history (who contacted, when)
- Email template selector and send button

### Phase 6: Status Management
**Status:** ⏳ Pending
Features:
- Status dropdown in detail modal
- Status update with timestamp
- Automatic "lastContactedAt" update
- Status change history/audit trail
- Confirmation dialog before status change

### Phase 7: Bulk Actions
**Status:** ⏳ Pending
Implement:
- Checkbox for each row
- "Select All" checkbox in header
- Bulk action toolbar (appears when rows selected)
- Bulk status update
- Bulk delete with confirmation
- Bulk export to CSV

### Phase 8: Integration & Testing
**Status:** ⏳ Pending
- Add menu item to admin sidebar
- Test all CRUD operations
- Test filtering and search
- Test bulk actions
- Verify email notifications work
- Performance test with large dataset

---

## 📱 UI Components Needed

### Main Page
- Header with title and stats
- Filter toolbar
- Data table with sorting
- Pagination
- Bulk action toolbar

### Detail Modal
- Customer info section
- Tour info section
- Travel details section
- Status section with dropdown
- Notes section with add/edit
- Communication history section
- Email template selector
- Send email button

### Statistics Cards
- Total Enquiries
- New Enquiries (this week)
- Conversion Rate (booked/total)
- Average Response Time

---

## 🎨 Design Specifications

### Status Colors
- **New** - Blue (#3B82F6)
- **Contacted** - Yellow (#FBBF24)
- **Booked** - Green (#10B981)
- **Rejected** - Red (#EF4444)

### Table Columns
1. Checkbox (for selection)
2. ID (sortable)
3. Customer Name (sortable, searchable)
4. Tour (sortable)
5. Status (filterable, color-coded)
6. Date Created (sortable)
7. Actions (View, Edit, Delete)

### Responsive Behavior
- Desktop: Full table with all columns
- Tablet: Hide some columns, show more in detail
- Mobile: Card-based view instead of table

---

## 🧪 Testing Checklist

- [ ] Create enquiry appears in list
- [ ] Filter by status works correctly
- [ ] Search by name/email works
- [ ] Date range filter works
- [ ] Detail modal opens and shows all info
- [ ] Status update saves correctly
- [ ] Notes can be added and edited
- [ ] Bulk select/deselect works
- [ ] Bulk status update works
- [ ] Bulk delete works with confirmation
- [ ] CSV export contains correct data
- [ ] Statistics calculate correctly
- [ ] Email template sends correctly
- [ ] Performance acceptable with 1000+ enquiries

---

## ⏱️ Estimated Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Analysis | 30 min |
| 2 | tRPC Procedures | 1.5 hours |
| 3 | Page Component | 1.5 hours |
| 4 | Filtering & Search | 1 hour |
| 5 | Detail Modal | 1.5 hours |
| 6 | Status Management | 1 hour |
| 7 | Bulk Actions | 1 hour |
| 8 | Integration & Testing | 1.5 hours |
| **Total** | | **9-10 hours** |

---

## 📝 Notes

- The bookingEnquiries table already exists with basic structure
- Email notifications are already implemented via notifyOwner
- Need to add adminNotes, assignedTo, lastContactedAt fields to schema
- Consider pagination for large datasets (1000+ enquiries)
- Implement soft delete instead of hard delete for audit trail

---

## 🚀 Success Criteria

✅ Admins can view all booking enquiries in a table
✅ Admins can filter by status, tour, and date range
✅ Admins can search by customer name/email
✅ Admins can view full enquiry details in modal
✅ Admins can update enquiry status
✅ Admins can add/edit internal notes
✅ Admins can perform bulk actions (select, update, delete)
✅ Admins can export enquiries to CSV
✅ Statistics show key metrics (total, new, conversion rate)
✅ Page is responsive on mobile/tablet
✅ All tests passing
✅ Performance acceptable with large datasets
