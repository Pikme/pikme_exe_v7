import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DestinationCard {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  destinationLink: string;
  categoryId: number;
  displayOrder: number;
  isHidden: boolean;
}

interface Category {
  id: number;
  name: string;
}

export default function DestinationGalleryMasonry() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categoryScrollPosition, setCategoryScrollPosition] = useState(0);

  // Fetch gallery settings
  const { data: gallerySettings, isLoading: settingsLoading } = trpc.destinationGalleryMasonry.getSettings.useQuery();

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = trpc.destinationGalleryMasonry.getCategories.useQuery();

  // Set default category on first load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId])

  // Fetch destinations for selected category
  const { data: destinations = [], isLoading: destinationsLoading } = trpc.destinationGalleryMasonry.getByCategory.useQuery(
    { categoryId: selectedCategoryId || 0 },
    { enabled: !!selectedCategoryId }
  );

  const visibleDestinations = destinations.filter((d: DestinationCard) => !d.isHidden);

  const scrollCategories = (direction: "left" | "right") => {
    const container = document.getElementById("category-scroll-container");
    if (!container) return;

    const scrollAmount = 200;
    const newPosition = direction === "left" 
      ? Math.max(0, categoryScrollPosition - scrollAmount)
      : categoryScrollPosition + scrollAmount;

    container.scrollLeft = newPosition;
    setCategoryScrollPosition(newPosition);
  };

  if (settingsLoading || categoriesLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Centered Container */}
        <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            {gallerySettings?.sectionTitle || "Discover Beautiful Places Around the World"}
          </h2>
          <p className="text-gray-600 text-lg">
            {gallerySettings?.sectionDescription || "Explore amazing destinations across the world"}
          </p>
        </div>

        {/* Category Tabs - Centered */}
        <div className="flex items-center gap-4 mb-12 relative justify-center">
          {/* Left Scroll Button */}
          {categoryScrollPosition > 0 && (
            <button
              onClick={() => scrollCategories("left")}
              className="absolute left-0 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Categories Container */}
          <div
            id="category-scroll-container"
            className="flex gap-3 overflow-x-auto scroll-smooth flex-1 px-12"
            style={{ scrollBehavior: "smooth" }}
          >
            {categories.map((category: Category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition ${
                  selectedCategoryId === category.id
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Right Scroll Button */}
          {visibleDestinations.length > 0 && (
            <button
              onClick={() => scrollCategories("right")}
              className="absolute right-0 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Masonry Grid - Reference Layout Pattern - Centered */}
        {destinationsLoading ? (
          <div className="text-center py-12">Loading destinations...</div>
        ) : visibleDestinations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No destinations available for this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 auto-rows-max justify-center mx-auto">
            {visibleDestinations.map((destination: DestinationCard, index: number) => {
              // Reference layout pattern with varied sizes
              let height = "h-56";
              
              if (index === 1 || index === 6) {
                height = "h-80"; // Taller cards at positions 1 and 6
              }

              return (
                <a
                  key={destination.id}
                  href={destination.destinationLink}
                  target={destination.destinationLink.startsWith("http") ? "_blank" : "_self"}
                  rel={destination.destinationLink.startsWith("http") ? "noopener noreferrer" : ""}
                  className={`group relative overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition transform hover:scale-105 cursor-pointer ${height}`}
                >
                  {/* Image */}
                  <img
                    src={destination.imageUrl}
                    alt={destination.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />

                  {/* Overlay - Always visible */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Content - Always visible at bottom */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                    <h3 className="text-lg font-bold mb-1">
                      {destination.title}
                    </h3>
                    <p className="text-xs text-gray-200">
                      {destination.description}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Footer Info */}
        {visibleDestinations.length > 0 && (
          <div className="text-center mt-8 text-gray-600">
            Showing {visibleDestinations.length} destination{visibleDestinations.length !== 1 ? 's' : ''}
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
