import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App Component', () => {
  it('renders the application', () => {
    render(<App />);
    
    expect(screen.getByText('EcoLens')).toBeInTheDocument();
  });

  it('displays navigation menu', () => {
    render(<App />);
    
    expect(screen.getByText('Calculator')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('starts with calculator view active', () => {
    render(<App />);
    
    const calculatorLink = screen.getByText('Calculator');
    expect(calculatorLink).toHaveClass('active');
  });

  it('switches to dashboard view when clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const dashboardLink = screen.getByText('Dashboard');
    await user.click(dashboardLink);
    
    expect(dashboardLink).toHaveClass('active');
    expect(screen.getByText('📊 Carbon Dashboard')).toBeInTheDocument();
  });

  it('switches to history view when clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const historyLink = screen.getByText('History');
    await user.click(historyLink);
    
    expect(historyLink).toHaveClass('active');
    expect(screen.getByText('📜 Calculation History')).toBeInTheDocument();
  });

  it('displays hero section on calculator view', () => {
    render(<App />);
    
    expect(screen.getByText(/Know Your/)).toBeInTheDocument();
    expect(screen.getByText(/Carbon Impact/)).toBeInTheDocument();
  });

  it('displays calculator component', () => {
    render(<App />);
    
    expect(screen.getByText('Carbon Footprint Calculator')).toBeInTheDocument();
  });

  it('has skip link for accessibility', () => {
    render(<App />);
    
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('has proper navigation role', () => {
    render(<App />);
    
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('displays footer with information', () => {
    render(<App />);
    
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText(/EcoLens Carbon Calculator/)).toBeInTheDocument();
  });

  it('displays ambient background elements', () => {
    const { container } = render(<App />);
    
    const ambientBg = container.querySelector('.ambient-bg');
    expect(ambientBg).toBeInTheDocument();
  });

  it('shows empty history message when no entries', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const historyLink = screen.getByText('History');
    await user.click(historyLink);
    
    expect(screen.getByText(/No history yet/)).toBeInTheDocument();
  });

  it('maintains navigation state across view switches', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Go to dashboard
    await user.click(screen.getByText('Dashboard'));
    expect(screen.getByText('Dashboard')).toHaveClass('active');
    
    // Go back to calculator
    await user.click(screen.getByText('Calculator'));
    expect(screen.getByText('Calculator')).toHaveClass('active');
    
    // Go to history
    await user.click(screen.getByText('History'));
    expect(screen.getByText('History')).toHaveClass('active');
  });
});
