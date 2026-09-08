import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Hermes workspace shell', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /hermes/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
});
