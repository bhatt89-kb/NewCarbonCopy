/**
 * EcoLens — Carbon Offset Marketplace (Educational)
 */
import './OffsetMarketplace.css';

const OFFSET_PROJECTS = [
  {
    id: 'trees', icon: '🌳', title: 'Plant Trees',
    description: 'Reforestation absorbs CO₂ from the atmosphere. One mature tree absorbs ~22kg CO₂/year.',
    impact: '22 kg CO₂/tree/year', category: 'trees',
    link: 'https://onetreeplanted.org', provider: 'One Tree Planted', verified: true,
    actions: ['Plant native species in your area', 'Support tropical reforestation', 'Maintain existing forests']
  },
  {
    id: 'solar', icon: '☀️', title: 'Renewable Energy Credits',
    description: 'Support solar and wind energy projects that displace fossil fuels from the grid.',
    impact: '~450 kg CO₂/MWh offset', category: 'renewable',
    link: 'https://www.green-e.org', provider: 'Green-e Certified', verified: true,
    actions: ['Switch to green energy provider', 'Purchase RECs', 'Install rooftop solar']
  },
  {
    id: 'community', icon: '🏘️', title: 'Community Projects',
    description: 'Support local sustainability: community gardens, bike lanes, and clean water projects.',
    impact: 'Varies by project', category: 'community',
    link: 'https://www.goldstandard.org', provider: 'Gold Standard', verified: true,
    actions: ['Join local clean-up drives', 'Support community gardens', 'Advocate for bike infrastructure']
  },
  {
    id: 'ocean', icon: '🌊', title: 'Ocean Conservation',
    description: 'Oceans absorb 30% of CO₂. Protect marine ecosystems and reduce ocean acidification.',
    impact: '~50 kg CO₂/year via kelp', category: 'conservation',
    link: 'https://www.oceanconservancy.org', provider: 'Ocean Conservancy', verified: true,
    actions: ['Reduce plastic consumption', 'Support marine protected areas', 'Choose sustainable seafood']
  },
  {
    id: 'cookstoves', icon: '🔥', title: 'Clean Cookstoves',
    description: 'Replace wood-burning stoves in developing regions. Reduces emissions and improves health.',
    impact: '~2-4 tonnes CO₂/year', category: 'community',
    link: 'https://www.cleancookingalliance.org', provider: 'Clean Cooking Alliance', verified: true,
    actions: ['Donate to cookstove programs', 'Spread awareness', 'Support energy access initiatives']
  },
  {
    id: 'wetlands', icon: '🌿', title: 'Wetland Restoration',
    description: 'Wetlands store 2x more carbon than forests per hectare. Restoration is critical for climate.',
    impact: '~5-10 tonnes CO₂/hectare/year', category: 'conservation',
    link: 'https://www.ramsar.org', provider: 'Ramsar Convention', verified: true,
    actions: ['Support local wetland conservation', 'Reduce water pollution', 'Volunteer for restoration']
  }
];

export default function OffsetMarketplace() {
  const getCatColor = (cat) => {
    const map = { trees: '#10b981', renewable: '#f59e0b', community: '#818cf8', conservation: '#06b6d4' };
    return map[cat] || '#818cf8';
  };

  return (
    <section className="marketplace-section">
      <div className="section-header">
        <h2>🌍 Carbon Offset Marketplace</h2>
        <p className="section-desc">Educational resources and verified offset projects to neutralize your footprint</p>
      </div>

      <div className="marketplace-info glass-card">
        <p>💡 <strong>Important:</strong> The best offset is <em>avoiding emissions</em> in the first place. Use these resources to complement your reduction efforts, not replace them.</p>
      </div>

      <div className="offset-grid">
        {OFFSET_PROJECTS.map(project => (
          <div key={project.id} className="offset-card" style={{ '--cat-color': getCatColor(project.category) }}>
            <div className="offset-header">
              <span className="offset-icon">{project.icon}</span>
              {project.verified && <span className="verified-badge">✓ Verified</span>}
            </div>
            <h3 className="offset-title">{project.title}</h3>
            <p className="offset-desc">{project.description}</p>
            <div className="offset-impact">
              <span className="impact-label">Impact:</span>
              <span className="impact-value">{project.impact}</span>
            </div>
            <div className="offset-actions">
              <span className="actions-label">What you can do:</span>
              <ul>{project.actions.map((a, i) => <li key={i}>{a}</li>)}</ul>
            </div>
            <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm offset-link">
              Learn more at {project.provider} →
            </a>
          </div>
        ))}
      </div>

      <div className="marketplace-sources glass-card">
        <h3>📚 Trusted Sources & Standards</h3>
        <div className="sources-grid">
          <a href="https://www.goldstandard.org" target="_blank" rel="noopener noreferrer">Gold Standard</a>
          <a href="https://verra.org" target="_blank" rel="noopener noreferrer">Verra (VCS)</a>
          <a href="https://www.green-e.org" target="_blank" rel="noopener noreferrer">Green-e</a>
          <a href="https://www.ipcc.ch" target="_blank" rel="noopener noreferrer">IPCC</a>
          <a href="https://www.epa.gov/ghgemissions" target="_blank" rel="noopener noreferrer">US EPA</a>
          <a href="https://onetreeplanted.org" target="_blank" rel="noopener noreferrer">One Tree Planted</a>
        </div>
      </div>
    </section>
  );
}
