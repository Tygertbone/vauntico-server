import { formatPrice } from '../utils/pricing';

describe('formatPrice', () => {
  it('formats ZAR prices correctly', () => {
    expect(formatPrice(1234, 'ZAR')).toBe('R1,234');
  });

  it('formats USD prices correctly', () => {
    expect(formatPrice(1234, 'USD')).toBe('$1,234');
  });

  it('handles the "custom" price value', () => {
    expect(formatPrice('custom')).toBe('Custom Pricing');
  });
});
