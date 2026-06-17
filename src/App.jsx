
import { useFootprint } from './hooks/useFootprint'
import Calculator from './components/Calculator'
import Results from './components/Results'
import './App.css'

export default function App() {
  const { result, insights, loading, calculate, save } = useFootprint();

  return (
    <div className="app-shell">
      <header className="hero">
        <h1>🌱 EcoTrack Carbon Dashboard</h1>
        <p>Track, analyze and reduce your carbon footprint with a modern React experience.</p>
      </header>

      <div className="grid">
        <div className="card">
          <Calculator onCalculate={calculate} loading={loading} />
        </div>

        <div className="card">
          {result ? (
            <Results
              result={result}
              insights={insights}
              onSave={save}
              onRecalculate={() => window.location.reload()}
            />
          ) : (
            <div>
              <h2>Dashboard Preview</h2>
              <p>Complete the calculator to generate footprint analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
