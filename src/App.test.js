import { render, screen } from '@testing-library/react';
import App from './App';

// ── VaaniFinance smoke tests ──────────────────────────────────────────────
// These replace the default CRA placeholder test which checks for "learn react"
// and would always fail since this is VaaniFinance, not a CRA demo app.

test('renders without crashing', () => {
  render(<App />);
  // The splash screen shows "VaaniFinance" in the title
  const title = screen.getByText(/VaaniFinance/i);
  expect(title).toBeInTheDocument();
});

test('splash screen has language selector buttons', () => {
  render(<App />);
  // Hindi button should always be present on splash
  const hindiBtn = screen.getByText(/हिन्दी/i);
  expect(hindiBtn).toBeInTheDocument();
});

test('splash screen has English language option', () => {
  render(<App />);
  const englishBtn = screen.getByText(/English/i);
  expect(englishBtn).toBeInTheDocument();
});