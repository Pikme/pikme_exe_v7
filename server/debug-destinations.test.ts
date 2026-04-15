import { describe, it, expect } from 'vitest';
import { getCountryBySlug, getCountryDetails } from './db-destinations';

describe('Destinations Debug', () => {
  it('should fetch country by slug', async () => {
    const country = await getCountryBySlug('india');
    console.log('Country by slug:', JSON.stringify(country, null, 2));
    expect(country).toBeDefined();
    expect(country?.slug).toBe('india');
  });

  it('should fetch country details with states and cities', async () => {
    const country = await getCountryBySlug('india');
    if (!country) {
      throw new Error('India country not found');
    }

    const details = await getCountryDetails(country.id);
    console.log('Country details:', JSON.stringify(details, null, 2));
    
    expect(details).toBeDefined();
    expect(details?.country).toBeDefined();
    expect(details?.states).toBeDefined();
    expect(details?.locations).toBeDefined();
    expect(Array.isArray(details?.states)).toBe(true);
    expect(Array.isArray(details?.locations)).toBe(true);
    
    if (details?.states && details.states.length > 0) {
      console.log(`Found ${details.states.length} states`);
      console.log('First state:', JSON.stringify(details.states[0], null, 2));
    }
    
    if (details?.locations && details.locations.length > 0) {
      console.log(`Found ${details.locations.length} locations`);
      console.log('First location:', JSON.stringify(details.locations[0], null, 2));
    }
  });
});
