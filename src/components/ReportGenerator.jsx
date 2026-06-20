/**
 * EcoLens — PDF Report Generator Component
 */
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { CATEGORY_LABELS, CATEGORY_ICONS, formatKg, SUSTAINABLE_TARGET, GLOBAL_AVG } from '../engine';
import './ReportGenerator.css';

export default function ReportGenerator({ result, entries, insights }) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generatePDF = () => {
    if (!result) return;
    setGenerating(true);

    try {
      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();
      let y = 20;

      // Header
      doc.setFillColor(15, 17, 23);
      doc.rect(0, 0, pageW, 45, 'F');
      doc.setTextColor(232, 234, 240);
      doc.setFontSize(24);
      doc.text('EcoLens', 20, 22);
      doc.setFontSize(12);
      doc.text('Carbon Footprint Report', 20, 32);
      doc.setFontSize(9);
      doc.setTextColor(139, 143, 163);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 40);

      y = 55;

      // Total Footprint
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(16);
      doc.text('Annual Carbon Footprint', 20, y);
      y += 10;
      doc.setFontSize(32);
      doc.setTextColor(99, 102, 241);
      doc.text(`${result.total_annual_tonnes.toFixed(2)} t CO₂e`, 20, y);
      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const status = result.total_annual_kg <= 2000 ? 'Below sustainable target' : `${((result.total_annual_kg / 2000 - 1) * 100).toFixed(0)}% above sustainable target (2.0t)`;
      doc.text(status, 20, y);
      y += 15;

      // Breakdown
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text('Breakdown by Category', 20, y);
      y += 8;

      const categories = Object.entries(result.breakdown_kg);
      const maxKg = Math.max(...categories.map(([_, v]) => v));

      categories.forEach(([cat, kg]) => {
        const pct = ((kg / result.total_annual_kg) * 100).toFixed(1);
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`${CATEGORY_LABELS[cat]}`, 20, y);
        doc.text(`${formatKg(kg)} (${pct}%)`, pageW - 60, y);

        // Bar
        y += 4;
        const barW = (pageW - 80) * (kg / maxKg);
        const colors = { transport: [99,102,241], home: [245,158,11], diet: [16,185,129], consumption: [244,63,94] };
        const c = colors[cat] || [129,140,248];
        doc.setFillColor(c[0], c[1], c[2]);
        doc.roundedRect(20, y - 3, barW, 5, 2, 2, 'F');
        y += 10;
      });

      y += 5;

      // Comparison
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text('How You Compare', 20, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`Your Footprint: ${result.total_annual_tonnes.toFixed(2)}t`, 20, y); y += 6;
      doc.text(`Sustainable Target: ${(SUSTAINABLE_TARGET/1000).toFixed(1)}t (${result.comparison.ratio_to_sustainable_target.toFixed(1)}x)`, 20, y); y += 6;
      doc.text(`Global Average: ${(GLOBAL_AVG/1000).toFixed(1)}t (${result.comparison.ratio_to_global_average.toFixed(1)}x)`, 20, y); y += 12;

      // Recommendations
      if (insights && insights.recommendations.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 30);
        doc.text('Personalized Recommendations', 20, y);
        y += 8;

        insights.recommendations.forEach((rec) => {
          if (y > 260) { doc.addPage(); y = 20; }
          doc.setFontSize(10);
          doc.setTextColor(99, 102, 241);
          doc.text(`${CATEGORY_LABELS[rec.category] || rec.category}`, 20, y);
          y += 5;
          doc.setTextColor(60, 60, 60);
          const lines = doc.splitTextToSize(rec.action, pageW - 40);
          doc.text(lines, 20, y);
          y += lines.length * 5;
          doc.setTextColor(16, 185, 129);
          doc.text(`Potential savings: ${formatKg(rec.estimated_annual_savings_kg)}/year`, 20, y);
          y += 10;
        });
      }

      // History summary
      if (entries && entries.length > 0) {
        if (y > 230) { doc.addPage(); y = 20; }
        y += 5;
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 30);
        doc.text('Tracking History', 20, y);
        y += 8;
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`Total calculations: ${entries.length}`, 20, y); y += 6;
        const vals = entries.map(e => e.result.total_annual_tonnes);
        doc.text(`Best result: ${Math.min(...vals).toFixed(2)}t`, 20, y); y += 6;
        doc.text(`Average: ${(vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(2)}t`, 20, y); y += 6;
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('EcoLens Carbon Tracker | Emission factors: DEFRA 2023, EPA, IPCC', 20, 285);
      doc.text('This report provides estimates. Actual emissions may vary.', 20, 290);

      doc.save(`ecolens-report-${new Date().toISOString().split('T')[0]}.pdf`);
      setGenerated(true);
      setTimeout(() => setGenerated(false), 3000);
    } catch (err) {
      console.error('PDF generation error:', err);
    }
    setGenerating(false);
  };

  return (
    <div className="report-generator">
      <div className="report-header">
        <h3>📄 Carbon Report</h3>
        <p className="report-desc">Generate a comprehensive PDF report of your carbon footprint</p>
      </div>
      <div className="report-preview">
        <div className="preview-item"><span>📊</span><span>Full breakdown by category</span></div>
        <div className="preview-item"><span>📈</span><span>Comparison with global averages</span></div>
        <div className="preview-item"><span>💡</span><span>Personalized recommendations</span></div>
        <div className="preview-item"><span>📉</span><span>Tracking history summary</span></div>
      </div>
      <button className="btn btn-primary report-btn" onClick={generatePDF} disabled={!result || generating}>
        {generating ? '⏳ Generating...' : generated ? '✅ Downloaded!' : '📥 Download PDF Report'}
      </button>
    </div>
  );
}
