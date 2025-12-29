import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Pricing from '../pages/Pricing';

describe('Pricing', () => {
  it('includes all plans in the structured data', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <Pricing />
        </MemoryRouter>
      </HelmetProvider>
    );

    // Wait for the structured data script to be added to the head
    await new Promise(resolve => setTimeout(resolve, 0));

    const script = document.querySelector('head script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();

    const structuredData = JSON.parse(script.textContent);

    expect(structuredData).toHaveProperty('offers');
    expect(Array.isArray(structuredData.offers)).toBe(true);

    const offerNames = structuredData.offers.map(offer => offer.name);

    expect(offerNames).toContain('Free');
    expect(offerNames).toContain('Creator Pass');
  });
});
