import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </HelmetProvider>
    );

    // App renders successfully
    const appElement = document.querySelector('.min-h-screen');
    expect(appElement).toBeInTheDocument();
  });
});
