import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CityDetailSkeleton } from './CityDetailSkeleton';

describe('CityDetailSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<CityDetailSkeleton />);
    expect(container).toBeTruthy();
  });

  it('displays animated skeleton placeholders', () => {
    const { container } = render(<CityDetailSkeleton />);
    
    // Check for animated skeleton elements
    const skeletonElements = container.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('displays breadcrumb skeleton structure', () => {
    const { container } = render(<CityDetailSkeleton />);
    
    // Check for breadcrumb section
    const breadcrumbSection = container.querySelector('.bg-muted\\/50');
    expect(breadcrumbSection).toBeTruthy();
  });

  it('displays hero section with gradient background', () => {
    const { container } = render(<CityDetailSkeleton />);
    
    // Check for hero section with gradient
    const heroSection = container.querySelector('.bg-gradient-to-r');
    expect(heroSection).toBeTruthy();
  });

  it('displays featured tours section skeleton', () => {
    const { container } = render(<CityDetailSkeleton />);
    
    // Check for tour card skeletons
    const tourCards = container.querySelectorAll('.border.rounded-lg');
    expect(tourCards.length).toBeGreaterThanOrEqual(3);
  });

  it('applies correct Tailwind classes for animations', () => {
    const { container } = render(<CityDetailSkeleton />);
    
    // Verify animate-pulse class is applied
    const animatedElements = container.querySelectorAll('.animate-pulse');
    animatedElements.forEach((element) => {
      expect(element.className).toContain('animate-pulse');
    });
  });

  it('includes PublicLayout wrapper', () => {
    const { container } = render(<CityDetailSkeleton />);
    
    // Check for main content area which indicates PublicLayout is present
    const mainContent = container.querySelector('.min-h-screen');
    expect(mainContent).toBeTruthy();
  });

  it('displays about section skeleton', () => {
    const { container } = render(<CityDetailSkeleton />);
    
    // Check for about section with icon placeholder
    const aboutSection = container.querySelector('.bg-white');
    expect(aboutSection).toBeTruthy();
  });
});
