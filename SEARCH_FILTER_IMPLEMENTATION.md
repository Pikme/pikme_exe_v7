# Search & Filtering Implementation Guide

This document provides a comprehensive guide for integrating search and filtering functionality into admin management pages.

## Components Created

### 1. SearchBar Component (`client/src/components/SearchBar.tsx`)

A reusable search input component with clear functionality.

**Features:**
- Search icon indicator
- Clear button (X) to reset search
- Customizable placeholder text
- Real-time search as user types

**Usage:**
```tsx
import { SearchBar } from "@/components/SearchBar";

const [searchQuery, setSearchQuery] = useState("");

<SearchBar
  placeholder="Search tours..."
  value={searchQuery}
  onChange={setSearchQuery}
  onClear={() => console.log("Cleared")}
/>
```

### 2. FilterPanel Component (`client/src/components/FilterPanel.tsx`)

A collapsible filter panel with multi-select checkbox options.

**Features:**
- Expandable/collapsible filter groups
- Multi-select checkboxes for each filter option
- Clear all filters button with count
- Smooth animations and transitions

**Usage:**
```tsx
import { FilterPanel, FilterOption } from "@/components/FilterPanel";

const filterOptions: FilterOption[] = [
  {
    id: "difficulty",
    label: "Difficulty Level",
    options: [
      { value: "easy", label: "Easy" },
      { value: "moderate", label: "Moderate" },
      { value: "challenging", label: "Challenging" },
    ],
  },
];

const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

<FilterPanel
  filters={filterOptions}
  selectedFilters={selectedFilters}
  onFilterChange={(filterId, values) =>
    setSelectedFilters({ ...selectedFilters, [filterId]: values })
  }
  onClearFilters={() => setSelectedFilters({})}
/>
```

## Integration Steps

### Step 1: Add Imports

```tsx
import { SearchBar } from "@/components/SearchBar";
import { FilterPanel, FilterOption } from "@/components/FilterPanel";
```

### Step 2: Add State Variables

```tsx
const [searchQuery, setSearchQuery] = useState("");
const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
const [showFilters, setShowFilters] = useState(false);
```

### Step 3: Define Filter Options

```tsx
const filterOptions: FilterOption[] = [
  {
    id: "difficulty",
    label: "Difficulty Level",
    options: [
      { value: "easy", label: "Easy" },
      { value: "moderate", label: "Moderate" },
      { value: "challenging", label: "Challenging" },
    ],
  },
  {
    id: "category",
    label: "Category",
    options: (categories || []).map((cat: any) => ({
      value: String(cat.id),
      label: cat.name,
    })),
  },
];
```

### Step 4: Implement Filtering Logic

```tsx
// Filter data based on search and filters
const filteredData = data?.filter((item: any) => {
  // Search filter
  const matchesSearch = searchQuery === "" || 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase());

  // Difficulty filter
  const matchesDifficulty = selectedFilters.difficulty?.length === 0 || 
    !selectedFilters.difficulty ||
    selectedFilters.difficulty.includes(item.difficulty || "easy");

  // Category filter
  const matchesCategory = selectedFilters.category?.length === 0 || 
    !selectedFilters.category ||
    selectedFilters.category.includes(String(item.categoryId));

  return matchesSearch && matchesDifficulty && matchesCategory;
}) || [];
```

### Step 5: Add UI Components

```tsx
{/* Search and Filter Bar */}
<div className="mb-6 space-y-4">
  <div className="flex gap-4">
    <div className="flex-1">
      <SearchBar
        placeholder="Search tours..."
        value={searchQuery}
        onChange={setSearchQuery}
      />
    </div>
    <Button
      variant={showFilters ? "default" : "outline"}
      onClick={() => setShowFilters(!showFilters)}
      className="gap-2"
    >
      <ChevronDown className="w-4 h-4" />
      Filters
    </Button>
  </div>
  
  {showFilters && (
    <FilterPanel
      filters={filterOptions}
      selectedFilters={selectedFilters}
      onFilterChange={(filterId, values) =>
        setSelectedFilters({ ...selectedFilters, [filterId]: values })
      }
      onClearFilters={() => {
        setSelectedFilters({});
        setSearchQuery("");
      }}
    />
  )}
</div>

{/* Results Count */}
<div className="mb-4 text-sm text-gray-600">
  Showing {filteredData.length} of {data?.length || 0} items
</div>

{/* Render filtered data */}
{filteredData?.map((item) => (
  // Your item rendering here
))}
```

## Integration Checklist

For each admin management page (Tours, Locations, States, Cities, Categories):

- [ ] Import SearchBar and FilterPanel components
- [ ] Add search and filter state variables
- [ ] Define filterOptions for the page
- [ ] Implement filtering logic
- [ ] Add search/filter UI to JSX
- [ ] Replace data rendering with filteredData
- [ ] Test search functionality
- [ ] Test filter functionality
- [ ] Test clear filters functionality

## Example: AdminToursManagement

Here's a complete example of how to integrate search and filtering into the Tours management page:

```tsx
import { SearchBar } from "@/components/SearchBar";
import { FilterPanel, FilterOption } from "@/components/FilterPanel";

export default function AdminToursManagement() {
  // ... existing state ...
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data: tours } = trpc.tours.list.useQuery({ limit: 100 });
  const { data: categories } = trpc.categories.list.useQuery({ limit: 500 });

  const filterOptions: FilterOption[] = [
    {
      id: "difficulty",
      label: "Difficulty Level",
      options: [
        { value: "easy", label: "Easy" },
        { value: "moderate", label: "Moderate" },
        { value: "challenging", label: "Challenging" },
      ],
    },
    {
      id: "category",
      label: "Category",
      options: (categories || []).map((cat: any) => ({
        value: String(cat.id),
        label: cat.name,
      })),
    },
  ];

  const filteredTours = tours?.filter((tour: any) => {
    const matchesSearch = searchQuery === "" || 
      tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDifficulty = selectedFilters.difficulty?.length === 0 || 
      !selectedFilters.difficulty ||
      selectedFilters.difficulty.includes(tour.difficulty || "easy");

    const matchesCategory = selectedFilters.category?.length === 0 || 
      !selectedFilters.category ||
      selectedFilters.category.includes(String(tour.categoryId));

    return matchesSearch && matchesDifficulty && matchesCategory;
  }) || [];

  return (
    <AdminLayout title="Tours Management">
      {/* Search and Filter UI */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search tours..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </div>
        
        {showFilters && (
          <FilterPanel
            filters={filterOptions}
            selectedFilters={selectedFilters}
            onFilterChange={(filterId, values) =>
              setSelectedFilters({ ...selectedFilters, [filterId]: values })
            }
            onClearFilters={() => {
              setSelectedFilters({});
              setSearchQuery("");
            }}
          />
        )}
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredTours.length} of {tours?.length || 0} tours
      </div>

      {/* Tours List */}
      {filteredTours?.map((tour) => (
        // Render tour item
      ))}
    </AdminLayout>
  );
}
```

## Customization

### Add More Filters

To add additional filters, simply extend the `filterOptions` array:

```tsx
const filterOptions: FilterOption[] = [
  // ... existing filters ...
  {
    id: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
];
```

### Update Filtering Logic

Add corresponding filter checks in the filtering logic:

```tsx
const matchesStatus = selectedFilters.status?.length === 0 || 
  !selectedFilters.status ||
  selectedFilters.status.includes(item.status);

return matchesSearch && matchesDifficulty && matchesCategory && matchesStatus;
```

## Performance Considerations

- Search and filtering are done client-side on the current data set
- For large datasets (1000+ items), consider implementing server-side filtering via tRPC procedures
- Use `useMemo` to optimize filtering calculations if needed

## Testing

Test the following scenarios:

1. **Search:** Type in search box and verify results filter correctly
2. **Filters:** Select filter options and verify results update
3. **Combined:** Use search + filters together
4. **Clear:** Click "Clear all" and verify all filters reset
5. **Empty Results:** Search for non-existent term and verify empty state
6. **Toggle Filters:** Click Filters button to show/hide filter panel

---

**Status:** Ready for integration
**Components:** SearchBar, FilterPanel
**Files:** `/client/src/components/SearchBar.tsx`, `/client/src/components/FilterPanel.tsx`
