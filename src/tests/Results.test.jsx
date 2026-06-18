import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Results from '../components/Results';

const mockResult = {
  breakdown_kg: {
    transport: 1000,
    home: 800,
    diet: 1500,
    consumption: 500,
  },
  total_annual_kg: 3800,
  total_annual_tonnes: 3.8,
  comparison: {
    global_average_annual_kg: 4800,
    sustainable_target_annual_kg: 2000,
    ratio_to_global_average: 0.79,
    ratio_to_sustainable_target: 1.9,
  },
};

const mockInsights = {
  summary: 'Your estimated footprint is 3.8 t CO₂e/yr',
  recommendations: [
    {
      category: 'transport',
      action: 'Use public transit',
      estimated_annual_savings_kg: 500,
    },
    {
      category: 'diet',
      action: 'Reduce meat consumption',
      estimated_annual_savings_kg: 300,
    },
  ],
  source: 'rules',
};

describe('Results Component', () => {
  it('renders result when provided', () => {
    render(
      <Results
        result={mockResult}
        insights={mockInsights}
        onSave={vi.fn()}
        onRecalculate={vi.fn()}
        saved={false}
      />
    );

    expect(screen.getByText('Your Carbon Footprint')).toBeInTheDocument();
    expect(screen.getByText('3.80')).toBeInTheDocument(); // Total tonnes value
  });

  it('returns null when no result', () => {
    const { container } = render(
      <Results
        result={null}
        insights={null}
        onSave={vi.fn()}
        onRecalculate={vi.fn()}
        saved={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('displays breakdown by category', () => {
    render(
      <Results
        result={mockResult}
        insights={mockInsights}
        onSave={vi.fn()}
        onRecalculate={vi.fn()}
        saved={false}
      />
    );

    expect(screen.getByText('Breakdown by Category')).toBeInTheDocument();
    // Use getAllByText since categories appear in both the chart and accessible table
    expect(screen.getAllByText('Transport').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Home Energy').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Diet & Food').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Consumption').length).toBeGreaterThan(0);
  });

  it('displays comparison with targets', () => {
    render(
      <Results
        result={mockResult}
        insights={mockInsights}
        onSave={vi.fn()}
        onRecalculate={vi.fn()}
        saved={false}
      />
    );

    expect(screen.getByText(/Sustainable Target/)).toBeInTheDocument();
    expect(screen.getByText(/Global Average/)).toBeInTheDocument();
    expect(screen.getByText('1.9×')).toBeInTheDocument(); // Ratio to sustainable
    expect(screen.getByText('0.8×')).toBeInTheDocument(); // Ratio to global
  });

  it('calls onSave when save button clicked', async () => {
    const user = userEvent.setup();
    const mockSave = vi.fn();

    render(
      <Results
        result={mockResult}
        insights={mockInsights}
        onSave={mockSave}
        onRecalculate={vi.fn()}
        saved={false}
      />
    );

    const saveButton = screen.getByText('💾 Save to History');
    await user.click(saveButton);

    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('disables save button when already saved', () => {
    render(
      <Results
        result={mockResult}
        insights={mockInsights}
        onSave={vi.fn()}
        onRecalculate={vi.fn()}
        saved={true}
      />
    );

    const saveButton = screen.getByText('✓ Saved');
    expect(saveButton).toBeDisabled();
  });

  it('calls onRecalculate when recalculate button clicked', async () => {
    const user = userEvent.setup();
    const mockRecalculate = vi.fn();

    render(
      <Results
        result={mockResult}
        insights={mockInsights}
        onSave={vi.fn()}
        onRecalculate={mockRecalculate}
        saved={false}
      />
    );

    const recalcButton = screen.getByText('Recalculate');
    await user.click(recalcButton);

    expect(mockRecalculate).toHaveBeenCalledTimes(1);
  });

  it('displays insights summary', () => {
    render(
      <Results
        result={mockResult}
        insights={mockInsights}
        onSave={vi.fn()}
        onRecalculate={vi.fn()}
        saved={false}
      />
    );

    expect(screen.getByText(/Your estimated footprint is 3.8 t CO₂e\/yr/)).toBeInTheDocument();
  });

  it('displays recommendations', () => {
    render(
      <Results
        result={mockResult}
        insights={mockInsights}
        onSave={vi.fn()}
        onRecalculate={vi.fn()}
        saved={false}
      />
    );

    expect(screen.getByText('Use public transit')).toBeInTheDocument();
    expect(screen.getByText('Reduce meat consumption')).toBeInTheDocument();
  });

  it('shows over status when above sustainable target', () => {
    render(
      <Results
        result={mockResult}
        insights={mockInsights}
        onSave={vi.fn()}
        onRecalculate={vi.fn()}
        saved={false}
      />
    );

    const valueElement = screen.getByText('3.80');
    expect(valueElement).toHaveClass('over');
  });

  it('shows under status when below sustainable target', () => {
    const lowResult = {
      ...mockResult,
      total_annual_kg: 1800,
      total_annual_tonnes: 1.8,
    };

    render(
      <Results
        result={lowResult}
        insights={mockInsights}
        onSave={vi.fn()}
        onRecalculate={vi.fn()}
        saved={false}
      />
    );

    const valueElement = screen.getByText('1.80');
    expect(valueElement).toHaveClass('under');
  });

  it('displays AI Powered badge when insights from gemini', () => {
    const geminiInsights = { ...mockInsights, source: 'gemini' };

    render(
      <Results
        result={mockResult}
        insights={geminiInsights}
        onSave={vi.fn()}
        onRecalculate={vi.fn()}
        saved={false}
      />
    );

    expect(screen.getByText('AI Powered')).toBeInTheDocument();
  });

  it('displays Rule Engine badge when insights from rules', () => {
    render(
      <Results
        result={mockResult}
        insights={mockInsights}
        onSave={vi.fn()}
        onRecalculate={vi.fn()}
        saved={false}
      />
    );

    expect(screen.getByText('Rule Engine')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <Results
        result={mockResult}
        insights={mockInsights}
        onSave={vi.fn()}
        onRecalculate={vi.fn()}
        saved={false}
      />
    );

    // Check for aria-label on list
    expect(screen.getByRole('list', { name: 'Recommended actions' })).toBeInTheDocument();
    
    // Check for live region
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
