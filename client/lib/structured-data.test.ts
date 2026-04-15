import { describe, it, expect } from 'vitest';
import {
  generateTourSchema,
  generateAttractionSchema,
  generateLocationSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
} from './structured-data';

describe('Structured Data Generation', () => {
  describe('generateTourSchema', () => {
    it('should generate a valid Tour schema with all fields', () => {
      const tour = {
        id: 1,
        name: 'Kerala Backwaters Tour',
        description: 'Experience the serene backwaters of Kerala',
        slug: 'kerala-backwaters',
        image: 'https://example.com/kerala.jpg',
        duration: 5,
        price: 25000,
        rating: 4.8,
        reviewCount: 150,
      };

      const schema = generateTourSchema(tour);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Tour');
      expect(schema.name).toBe('Kerala Backwaters Tour');
      expect(schema.description).toBe('Experience the serene backwaters of Kerala');
      expect(schema.url).toBe('https://www.pikmeusa.com/tour/kerala-backwaters');
      expect(schema.image).toBe('https://example.com/kerala.jpg');
      expect(schema.duration).toBe('P5D');
      expect(schema.priceCurrency).toBe('INR');
      expect(schema.price).toBe('25000');
      expect(schema.aggregateRating.ratingValue).toBe(4.8);
      expect(schema.aggregateRating.reviewCount).toBe(150);
      expect(schema.author.name).toBe('Pikme Travel');
    });

    it('should handle missing optional fields', () => {
      const tour = {
        id: 1,
        name: 'Simple Tour',
        description: 'A simple tour',
        slug: 'simple-tour',
      };

      const schema = generateTourSchema(tour);

      expect(schema.name).toBe('Simple Tour');
      expect(schema.image).toBeUndefined();
      expect(schema.duration).toBeUndefined();
      expect(schema.price).toBeUndefined();
      expect(schema.aggregateRating).toBeUndefined();
    });
  });

  describe('generateAttractionSchema', () => {
    it('should generate a valid TouristAttraction schema', () => {
      const attraction = {
        id: 1,
        name: 'Taj Mahal',
        description: 'A white marble mausoleum',
        slug: 'taj-mahal',
        image: 'https://example.com/taj-mahal.jpg',
        latitude: 27.1751,
        longitude: 78.0421,
        city: 'Agra',
        state: 'Uttar Pradesh',
        country: 'India',
        rating: 4.9,
        reviewCount: 5000,
      };

      const schema = generateAttractionSchema(attraction);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('TouristAttraction');
      expect(schema.name).toBe('Taj Mahal');
      expect(schema.geo.latitude).toBe(27.1751);
      expect(schema.geo.longitude).toBe(78.0421);
      expect(schema.address.addressLocality).toBe('Agra');
      expect(schema.address.addressRegion).toBe('Uttar Pradesh');
      expect(schema.address.addressCountry).toBe('India');
      expect(schema.aggregateRating.ratingValue).toBe(4.9);
    });
  });

  describe('generateLocationSchema', () => {
    it('should generate a valid Place schema for locations', () => {
      const location = {
        id: 1,
        name: 'Kerala',
        description: 'God\'s Own Country',
        slug: 'kerala',
        image: 'https://example.com/kerala.jpg',
        latitude: 10.8505,
        longitude: 76.2711,
        country: 'India',
        rating: 4.7,
        reviewCount: 2000,
      };

      const schema = generateLocationSchema(location);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Place');
      expect(schema.name).toBe('Kerala');
      expect(schema.geo.latitude).toBe(10.8505);
      expect(schema.address.addressCountry).toBe('India');
      expect(schema.aggregateRating.ratingValue).toBe(4.7);
    });
  });

  describe('generateBreadcrumbSchema', () => {
    it('should generate a valid BreadcrumbList schema', () => {
      const items = [
        { name: 'Home', url: 'https://www.pikmeusa.com' },
        { name: 'Tours', url: 'https://www.pikmeusa.com/tours' },
        { name: 'Kerala Tour', url: 'https://www.pikmeusa.com/tour/kerala' },
      ];

      const schema = generateBreadcrumbSchema(items);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(3);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[0].name).toBe('Home');
      expect(schema.itemListElement[2].position).toBe(3);
      expect(schema.itemListElement[2].name).toBe('Kerala Tour');
    });

    it('should handle single item breadcrumb', () => {
      const items = [{ name: 'Home', url: 'https://www.pikmeusa.com' }];

      const schema = generateBreadcrumbSchema(items);

      expect(schema.itemListElement).toHaveLength(1);
      expect(schema.itemListElement[0].position).toBe(1);
    });
  });

  describe('generateOrganizationSchema', () => {
    it('should generate a valid Organization schema', () => {
      const org = {
        name: 'Pikme Travel',
        url: 'https://www.pikmeusa.com',
        logo: 'https://www.pikmeusa.com/logo.png',
        description: 'Premium travel experiences from India',
        sameAs: [
          'https://facebook.com/pikme',
          'https://twitter.com/pikme',
        ],
      };

      const schema = generateOrganizationSchema(org);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('Pikme Travel');
      expect(schema.url).toBe('https://www.pikmeusa.com');
      expect(schema.logo).toBe('https://www.pikmeusa.com/logo.png');
      expect(schema.sameAs).toHaveLength(2);
    });
  });

  describe('Schema URL generation', () => {
    it('should generate correct URLs for tours', () => {
      const tour = {
        id: 1,
        name: 'Test Tour',
        description: 'Test',
        slug: 'test-tour',
      };

      const schema = generateTourSchema(tour);

      expect(schema.url).toBe('https://www.pikmeusa.com/tour/test-tour');
    });

    it('should generate correct URLs for attractions', () => {
      const attraction = {
        id: 1,
        name: 'Test Attraction',
        description: 'Test',
        slug: 'test-attraction',
      };

      const schema = generateAttractionSchema(attraction);

      expect(schema.url).toBe('https://www.pikmeusa.com/attraction/test-attraction');
    });

    it('should generate correct URLs for locations', () => {
      const location = {
        id: 1,
        name: 'Test Location',
        description: 'Test',
        slug: 'test-location',
      };

      const schema = generateLocationSchema(location);

      expect(schema.url).toBe('https://www.pikmeusa.com/destination/test-location');
    });
  });

  describe('Price and Duration formatting', () => {
    it('should format duration in ISO 8601 format', () => {
      const tour = {
        id: 1,
        name: 'Test',
        description: 'Test',
        slug: 'test',
        duration: 7,
      };

      const schema = generateTourSchema(tour);

      expect(schema.duration).toBe('P7D');
    });

    it('should include pricing information when provided', () => {
      const tour = {
        id: 1,
        name: 'Test',
        description: 'Test',
        slug: 'test',
        price: 50000,
      };

      const schema = generateTourSchema(tour);

      expect(schema.priceCurrency).toBe('INR');
      expect(schema.price).toBe('50000');
      expect(schema.offers).toBeDefined();
      expect(schema.offers.priceCurrency).toBe('INR');
      expect(schema.offers.availability).toBe('https://schema.org/InStock');
    });
  });
});
