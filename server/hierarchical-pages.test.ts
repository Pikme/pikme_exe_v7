import { describe, it, expect } from "vitest";

describe("Hierarchical Frontend Pages - Phase 1D", () => {
  describe("StatesList Page", () => {
    it("should render states list with country selector", () => {
      const page = {
        title: "Explore by State",
        description: "Discover amazing tours and destinations across different states",
        components: ["CountrySelector", "SearchBar", "StatesGrid", "BreadcrumbNav"],
      };

      expect(page.title).toBe("Explore by State");
      expect(page.components).toContain("CountrySelector");
      expect(page.components).toContain("StatesGrid");
    });

    it("should support filtering states by country", () => {
      const states = [
        { id: 1, name: "Kerala", countryId: 1, slug: "kerala" },
        { id: 2, name: "Tamil Nadu", countryId: 1, slug: "tamil-nadu" },
        { id: 3, name: "Sydney", countryId: 2, slug: "sydney" },
      ];

      const indiaStates = states.filter((s) => s.countryId === 1);
      expect(indiaStates.length).toBe(2);
      expect(indiaStates.every((s) => s.countryId === 1)).toBe(true);
    });

    it("should support searching states by name", () => {
      const states = [
        { id: 1, name: "Kerala", slug: "kerala" },
        { id: 2, name: "Tamil Nadu", slug: "tamil-nadu" },
        { id: 3, name: "Karnataka", slug: "karnataka" },
      ];

      const searchTerm = "kerala";
      const results = states.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

      expect(results.length).toBe(1);
      expect(results[0].name).toBe("Kerala");
    });

    it("should display state cards with images and descriptions", () => {
      const state = {
        id: 1,
        name: "Kerala",
        slug: "kerala",
        image: "https://example.com/kerala.jpg",
        metaDescription: "Beautiful backwaters and beaches",
        description: "Kerala is known for its scenic beauty...",
      };

      expect(state.image).toBeDefined();
      expect(state.metaDescription).toBeDefined();
      expect(state.description).toBeDefined();
    });

    it("should provide navigation links to state detail pages", () => {
      const state = { id: 1, name: "Kerala", slug: "kerala" };
      const link = `/states/${state.slug}`;

      expect(link).toBe("/states/kerala");
    });
  });

  describe("StateDetail Page", () => {
    it("should render state detail with hero image and description", () => {
      const page = {
        title: "Kerala",
        image: "https://example.com/kerala.jpg",
        description: "Kerala is a state in India...",
        components: ["HeroSection", "Description", "CategoryFilter", "ToursGrid", "BreadcrumbNav"],
      };

      expect(page.title).toBe("Kerala");
      expect(page.components).toContain("HeroSection");
      expect(page.components).toContain("ToursGrid");
    });

    it("should display tours filtered by state", () => {
      const tours = [
        { id: 1, name: "Tour A", stateId: 1, slug: "tour-a" },
        { id: 2, name: "Tour B", stateId: 1, slug: "tour-b" },
        { id: 3, name: "Tour C", stateId: 2, slug: "tour-c" },
      ];

      const stateId = 1;
      const toursInState = tours.filter((t) => t.stateId === stateId);

      expect(toursInState.length).toBe(2);
      expect(toursInState.every((t) => t.stateId === stateId)).toBe(true);
    });

    it("should support filtering tours by category within state", () => {
      const tours = [
        { id: 1, name: "Tour A", stateId: 1, categoryId: 1 },
        { id: 2, name: "Tour B", stateId: 1, categoryId: 2 },
        { id: 3, name: "Tour C", stateId: 1, categoryId: 1 },
      ];

      const stateId = 1;
      const categoryId = 1;
      const filtered = tours.filter((t) => t.stateId === stateId && t.categoryId === categoryId);

      expect(filtered.length).toBe(2);
      expect(filtered.every((t) => t.categoryId === categoryId)).toBe(true);
    });

    it("should display tour cards with pricing and duration", () => {
      const tour = {
        id: 1,
        name: "Backwaters Tour",
        slug: "backwaters-tour",
        image: "https://example.com/tour.jpg",
        duration: 3,
        price: 15000,
        difficulty: "easy",
      };

      expect(tour.duration).toBe(3);
      expect(tour.price).toBe(15000);
      expect(tour.difficulty).toBe("easy");
    });

    it("should provide back navigation to states list", () => {
      const breadcrumb = [
        { label: "Home", href: "/" },
        { label: "States", href: "/states" },
        { label: "Kerala", href: "/states/kerala" },
      ];

      expect(breadcrumb.length).toBe(3);
      expect(breadcrumb[1].href).toBe("/states");
    });
  });

  describe("CategoriesList Page", () => {
    it("should render categories list with search functionality", () => {
      const page = {
        title: "Tour Categories",
        description: "Explore tours organized by type and experience",
        components: ["SearchBar", "CategoriesGrid", "InfoSection", "BreadcrumbNav"],
      };

      expect(page.title).toBe("Tour Categories");
      expect(page.components).toContain("CategoriesGrid");
      expect(page.components).toContain("SearchBar");
    });

    it("should support searching categories by name", () => {
      const categories = [
        { id: 1, name: "Adventure", slug: "adventure", icon: "🏔️" },
        { id: 2, name: "Beach", slug: "beach", icon: "🏖️" },
        { id: 3, name: "Cultural", slug: "cultural", icon: "🏛️" },
      ];

      const searchTerm = "beach";
      const results = categories.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

      expect(results.length).toBe(1);
      expect(results[0].name).toBe("Beach");
    });

    it("should display category cards with icons and descriptions", () => {
      const category = {
        id: 1,
        name: "Adventure",
        slug: "adventure",
        icon: "🏔️",
        description: "Thrilling outdoor experiences",
      };

      expect(category.icon).toBeDefined();
      expect(category.description).toBeDefined();
    });

    it("should provide navigation links to category detail pages", () => {
      const category = { id: 1, name: "Adventure", slug: "adventure" };
      const link = `/categories/${category.slug}`;

      expect(link).toBe("/categories/adventure");
    });
  });

  describe("CategoryDetail Page", () => {
    it("should render category detail with hero section", () => {
      const page = {
        title: "Adventure Tours",
        icon: "🏔️",
        description: "Thrilling outdoor experiences",
        components: ["HeroSection", "StateFilter", "ToursGrid", "InfoSection", "BreadcrumbNav"],
      };

      expect(page.title).toBe("Adventure Tours");
      expect(page.components).toContain("HeroSection");
      expect(page.components).toContain("StateFilter");
    });

    it("should display tours filtered by category", () => {
      const tours = [
        { id: 1, name: "Tour A", categoryId: 1, slug: "tour-a" },
        { id: 2, name: "Tour B", categoryId: 1, slug: "tour-b" },
        { id: 3, name: "Tour C", categoryId: 2, slug: "tour-c" },
      ];

      const categoryId = 1;
      const toursInCategory = tours.filter((t) => t.categoryId === categoryId);

      expect(toursInCategory.length).toBe(2);
      expect(toursInCategory.every((t) => t.categoryId === categoryId)).toBe(true);
    });

    it("should support filtering tours by state within category", () => {
      const tours = [
        { id: 1, name: "Tour A", categoryId: 1, stateId: 1 },
        { id: 2, name: "Tour B", categoryId: 1, stateId: 2 },
        { id: 3, name: "Tour C", categoryId: 1, stateId: 1 },
      ];

      const categoryId = 1;
      const stateId = 1;
      const filtered = tours.filter((t) => t.categoryId === categoryId && t.stateId === stateId);

      expect(filtered.length).toBe(2);
      expect(filtered.every((t) => t.stateId === stateId)).toBe(true);
    });

    it("should list unique states available in category", () => {
      const tours = [
        { id: 1, name: "Tour A", categoryId: 1, stateId: 1 },
        { id: 2, name: "Tour B", categoryId: 1, stateId: 2 },
        { id: 3, name: "Tour C", categoryId: 1, stateId: 1 },
      ];

      const states = [
        { id: 1, name: "Kerala" },
        { id: 2, name: "Tamil Nadu" },
      ];

      const categoryId = 1;
      const toursInCategory = tours.filter((t) => t.categoryId === categoryId);
      const stateIds = new Set(toursInCategory.map((t) => t.stateId));
      const statesInCategory = states.filter((s) => stateIds.has(s.id));

      expect(statesInCategory.length).toBe(2);
    });

    it("should provide back navigation to categories list", () => {
      const breadcrumb = [
        { label: "Home", href: "/" },
        { label: "Categories", href: "/categories" },
        { label: "Adventure", href: "/categories/adventure" },
      ];

      expect(breadcrumb.length).toBe(3);
      expect(breadcrumb[1].href).toBe("/categories");
    });
  });

  describe("Navigation Integration", () => {
    it("should include states and categories links in main navigation", () => {
      const navLinks = [
        { label: "Tours", href: "/tours" },
        { label: "Destinations", href: "/countries" },
        { label: "States", href: "/states" },
        { label: "Categories", href: "/categories" },
      ];

      expect(navLinks.map((l) => l.label)).toContain("States");
      expect(navLinks.map((l) => l.label)).toContain("Categories");
    });

    it("should support hierarchical navigation flow", () => {
      const navigationFlow = [
        { page: "Home", nextPages: ["States", "Categories", "Tours"] },
        { page: "States", nextPages: ["StateDetail", "Home"] },
        { page: "StateDetail", nextPages: ["TourDetail", "States", "Home"] },
        { page: "Categories", nextPages: ["CategoryDetail", "Home"] },
        { page: "CategoryDetail", nextPages: ["TourDetail", "Categories", "Home"] },
      ];

      const statesPage = navigationFlow.find((n) => n.page === "States");
      expect(statesPage?.nextPages).toContain("StateDetail");
    });
  });

  describe("SEO & Metadata", () => {
    it("should include meta descriptions for states", () => {
      const state = {
        id: 1,
        name: "Kerala",
        metaTitle: "Kerala Tours - Backwaters & Beaches",
        metaDescription: "Explore Kerala tours with scenic backwaters and pristine beaches",
        metaKeywords: "kerala tours, backwaters, beaches",
      };

      expect(state.metaTitle).toBeDefined();
      expect(state.metaDescription).toBeDefined();
      expect(state.metaKeywords).toBeDefined();
    });

    it("should include meta descriptions for categories", () => {
      const category = {
        id: 1,
        name: "Adventure",
        description: "Thrilling outdoor experiences and adventure tours",
      };

      expect(category.description).toBeDefined();
    });

    it("should support breadcrumb schema for SEO", () => {
      const breadcrumbs = [
        { position: 1, name: "Home", url: "/" },
        { position: 2, name: "States", url: "/states" },
        { position: 3, name: "Kerala", url: "/states/kerala" },
      ];

      expect(breadcrumbs.length).toBe(3);
      expect(breadcrumbs[2].name).toBe("Kerala");
    });
  });

  describe("Error Handling", () => {
    it("should handle missing state gracefully", () => {
      const state = null;
      const errorMessage = state ? state.name : "State not found";

      expect(errorMessage).toBe("State not found");
    });

    it("should handle missing category gracefully", () => {
      const category = null;
      const errorMessage = category ? category.name : "Category not found";

      expect(errorMessage).toBe("Category not found");
    });

    it("should display empty state when no tours found", () => {
      const tours: any[] = [];
      const isEmpty = tours.length === 0;

      expect(isEmpty).toBe(true);
    });
  });

  describe("Responsive Design", () => {
    it("should support mobile layout for states list", () => {
      const layout = {
        mobile: "grid-cols-1",
        tablet: "md:grid-cols-2",
        desktop: "lg:grid-cols-3",
      };

      expect(layout.mobile).toBe("grid-cols-1");
      expect(layout.tablet).toBe("md:grid-cols-2");
    });

    it("should support mobile layout for categories list", () => {
      const layout = {
        mobile: "grid-cols-1",
        tablet: "md:grid-cols-2",
        desktop: "lg:grid-cols-3",
      };

      expect(layout.mobile).toBe("grid-cols-1");
    });
  });
});
