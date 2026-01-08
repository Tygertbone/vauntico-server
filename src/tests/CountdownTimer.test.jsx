import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import CountdownTimer from '../components/CountdownTimer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear any stored deadline
    localStorage.removeItem('vauntico_countdown_deadline');
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.removeItem('vauntico_countdown_deadline');
  });

  it('renders countdown with time units', async () => {
    // Set a deadline 1 minute from now for testing
    const testDeadline = new Date();
    testDeadline.setMinutes(testDeadline.getMinutes() + 1);

    render(<CountdownTimer deadline={testDeadline.toISOString()} />);

    // Should show countdown with numbers (not expired state)
    expect(screen.getByText('01')).toBeInTheDocument(); // 1 minute
    const zeroElements = screen.getAllByText('00');
    expect(zeroElements.length).toBeGreaterThanOrEqual(2); // hours and days should be 00 (may also include seconds)

    // Advance timers by 1 second
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Seconds should decrease (59 seconds left)
    expect(screen.getByText('59')).toBeInTheDocument();
  });
});
