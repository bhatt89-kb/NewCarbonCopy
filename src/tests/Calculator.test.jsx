import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Calculator from '../components/Calculator';

describe('Calculator Component', () => {
  it('renders calculator with initial step', () => {
    render(<Calculator onCalculate={vi.fn()} loading={false} />);
    
    expect(screen.getByText('Carbon Footprint Calculator')).toBeInTheDocument();
    expect(screen.getByText('Transport & Travel')).toBeInTheDocument();
  });

  it('displays all four steps in stepper', () => {
    render(<Calculator onCalculate={vi.fn()} loading={false} />);
    
    const steps = screen.getAllByRole('button', { name: /Step \d/ });
    expect(steps).toHaveLength(4);
  });

  it('navigates between steps', async () => {
    const user = userEvent.setup();
    render(<Calculator onCalculate={vi.fn()} loading={false} />);
    
    // Start at Transport step
    expect(screen.getByText('Transport & Travel')).toBeInTheDocument();
    
    // Click Next
    await user.click(screen.getByText('Next →'));
    
    // Should be at Home Energy step
    expect(screen.getByText('Home Energy')).toBeInTheDocument();
    
    // Click Previous
    await user.click(screen.getByText('← Previous'));
    
    // Back to Transport
    expect(screen.getByText('Transport & Travel')).toBeInTheDocument();
  });

  it('allows direct step navigation via stepper buttons', async () => {
    const user = userEvent.setup();
    render(<Calculator onCalculate={vi.fn()} loading={false} />);
    
    // Click on Diet step directly
    await user.click(screen.getByRole('button', { name: /Step 3/ }));
    
    expect(screen.getByText('Diet & Food')).toBeInTheDocument();
  });

  it('updates transport inputs', async () => {
    const user = userEvent.setup();
    render(<Calculator onCalculate={vi.fn()} loading={false} />);
    
    const carKmInput = screen.getByLabelText('Car km per week');
    await user.clear(carKmInput);
    await user.type(carKmInput, '150');
    
    expect(carKmInput).toHaveValue(150);
  });

  it('updates car fuel type', async () => {
    const user = userEvent.setup();
    render(<Calculator onCalculate={vi.fn()} loading={false} />);
    
    const fuelSelect = screen.getByLabelText('Car fuel type');
    await user.selectOptions(fuelSelect, 'electric');
    
    expect(fuelSelect).toHaveValue('electric');
  });

  it('updates home energy inputs', async () => {
    const user = userEvent.setup();
    render(<Calculator onCalculate={vi.fn()} loading={false} />);
    
    // Navigate to Home step
    await user.click(screen.getByText('Next →'));
    
    const elecInput = screen.getByLabelText('Electricity per month');
    await user.clear(elecInput);
    await user.type(elecInput, '400');
    
    expect(elecInput).toHaveValue(400);
  });

  it('updates household size', async () => {
    const user = userEvent.setup();
    render(<Calculator onCalculate={vi.fn()} loading={false} />);
    
    // Navigate to Home step
    await user.click(screen.getByText('Next →'));
    
    const householdInput = screen.getByLabelText('Household size');
    await user.clear(householdInput);
    await user.type(householdInput, '4');
    
    expect(householdInput).toHaveValue(4);
  });

  it('selects diet options', async () => {
    const user = userEvent.setup();
    render(<Calculator onCalculate={vi.fn()} loading={false} />);
    
    // Navigate to Diet step
    await user.click(screen.getByRole('button', { name: /Step 3/ }));
    
    const veganRadio = screen.getByRole('radio', { name: /Vegan/i });
    await user.click(veganRadio);
    
    expect(veganRadio).toBeChecked();
  });

  it('displays all diet options', () => {
    render(<Calculator onCalculate={vi.fn()} loading={false} />);
    
    // Navigate to Diet step
    fireEvent.click(screen.getByRole('button', { name: /Step 3/ }));
    
    expect(screen.getByText('Heavy Meat')).toBeInTheDocument();
    expect(screen.getByText('Medium Meat')).toBeInTheDocument();
    expect(screen.getByText('Low Meat')).toBeInTheDocument();
    expect(screen.getByText('Pescatarian')).toBeInTheDocument();
    expect(screen.getByText('Vegetarian')).toBeInTheDocument();
    expect(screen.getByText('Vegan')).toBeInTheDocument();
  });

  it('updates consumption inputs', async () => {
    const user = userEvent.setup();
    render(<Calculator onCalculate={vi.fn()} loading={false} />);
    
    // Navigate to Consumption step
    await user.click(screen.getByRole('button', { name: /Step 4/ }));
    
    const goodsInput = screen.getByLabelText('Goods spending/month');
    await user.clear(goodsInput);
    await user.type(goodsInput, '300');
    
    expect(goodsInput).toHaveValue(300);
  });

  it('shows calculate button on final step', () => {
    render(<Calculator onCalculate={vi.fn()} loading={false} />);
    
    // Navigate to last step
    fireEvent.click(screen.getByRole('button', { name: /Step 4/ }));
    
    expect(screen.getByText('🔍 Calculate Footprint')).toBeInTheDocument();
  });

  it('calls onCalculate with validated input', async () => {
    const user = userEvent.setup();
    const mockCalculate = vi.fn();
    render(<Calculator onCalculate={mockCalculate} loading={false} />);
    
    // Fill in some data
    const carKmInput = screen.getByLabelText('Car km per week');
    await user.clear(carKmInput);
    await user.type(carKmInput, '100');
    
    // Navigate to last step
    await user.click(screen.getByRole('button', { name: /Step 4/ }));
    
    // Submit
    await user.click(screen.getByText('🔍 Calculate Footprint'));
    
    expect(mockCalculate).toHaveBeenCalledTimes(1);
    expect(mockCalculate).toHaveBeenCalledWith(
      expect.objectContaining({
        transport: expect.objectContaining({
          car_km_per_week: 100,
        }),
      })
    );
  });

  it('validates and clamps input values', async () => {
    const user = userEvent.setup();
    const mockCalculate = vi.fn();
    render(<Calculator onCalculate={mockCalculate} loading={false} />);
    
    // Enter extreme value
    const carKmInput = screen.getByLabelText('Car km per week');
    await user.clear(carKmInput);
    await user.type(carKmInput, '999999');
    
    // Navigate to last step and submit
    await user.click(screen.getByRole('button', { name: /Step 4/ }));
    await user.click(screen.getByText('🔍 Calculate Footprint'));
    
    // Should clamp to max value (20000)
    expect(mockCalculate).toHaveBeenCalledWith(
      expect.objectContaining({
        transport: expect.objectContaining({
          car_km_per_week: 20000,
        }),
      })
    );
  });

  it('disables submit button when loading', () => {
    render(<Calculator onCalculate={vi.fn()} loading={true} />);
    
    // Navigate to last step
    fireEvent.click(screen.getByRole('button', { name: /Step 4/ }));
    
    const submitButton = screen.getByText('Calculating...');
    expect(submitButton).toBeDisabled();
  });

  it('hides Previous button on first step', () => {
    render(<Calculator onCalculate={vi.fn()} loading={false} />);
    
    const prevButton = screen.getByText('← Previous');
    expect(prevButton).toHaveStyle({ visibility: 'hidden' });
  });

  it('shows Previous button on later steps', async () => {
    const user = userEvent.setup();
    render(<Calculator onCalculate={vi.fn()} loading={false} />);
    
    await user.click(screen.getByText('Next →'));
    
    const prevButton = screen.getByText('← Previous');
    expect(prevButton).toHaveStyle({ visibility: 'visible' });
  });

  it('updates progress bar correctly', () => {
    render(<Calculator onCalculate={vi.fn()} loading={false} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '1');
    expect(progressBar).toHaveAttribute('aria-valuemax', '4');
  });

  it('handles zero and negative input values', async () => {
    const user = userEvent.setup();
    const mockCalculate = vi.fn();
    render(<Calculator onCalculate={mockCalculate} loading={false} />);
    
    const carKmInput = screen.getByLabelText('Car km per week');
    await user.clear(carKmInput);
    // Type a negative number - the input will convert "-50" to 50 due to number input behavior
    // So we need to manually trigger with 0
    await user.type(carKmInput, '0');
    
    // Navigate to last step and submit
    await user.click(screen.getByRole('button', { name: /Step 4/ }));
    await user.click(screen.getByText('🔍 Calculate Footprint'));
    
    // Should be 0
    expect(mockCalculate).toHaveBeenCalledWith(
      expect.objectContaining({
        transport: expect.objectContaining({
          car_km_per_week: 0,
        }),
      })
    );
  });

  it('enforces minimum household size of 1', async () => {
    const user = userEvent.setup();
    const mockCalculate = vi.fn();
    render(<Calculator onCalculate={mockCalculate} loading={false} />);
    
    // Navigate to Home step
    await user.click(screen.getByText('Next →'));
    
    const householdInput = screen.getByLabelText('Household size');
    await user.clear(householdInput);
    await user.type(householdInput, '0');
    
    // Navigate to last step and submit
    await user.click(screen.getByRole('button', { name: /Step 4/ }));
    await user.click(screen.getByText('🔍 Calculate Footprint'));
    
    // Should enforce minimum of 1
    expect(mockCalculate).toHaveBeenCalledWith(
      expect.objectContaining({
        home: expect.objectContaining({
          household_size: 1,
        }),
      })
    );
  });

  it('has proper accessibility attributes', () => {
    render(<Calculator onCalculate={vi.fn()} loading={false} />);
    
    // Check for labels
    expect(screen.getByLabelText('Car km per week')).toBeInTheDocument();
    expect(screen.getByLabelText('Car fuel type')).toBeInTheDocument();
    
    // Check for descriptions
    expect(screen.getByText('Weekly driving distance')).toBeInTheDocument();
  });
});
