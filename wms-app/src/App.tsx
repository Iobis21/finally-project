// დროებითი გვერდი — დიზაინ-სისტემის შემოწმებისთვის.
// შემდეგ დავალებებში აქ იქნება მარშრუტები (React Router).

const colors = [
  { name: 'Primary', className: 'bg-primary-600' },
  { name: 'Success', className: 'bg-success' },
  { name: 'Warning', className: 'bg-warning' },
  { name: 'Danger', className: 'bg-danger' },
  { name: 'Info', className: 'bg-info' },
]

function App() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-8">
      <header>
        <h1>WMS — საწყობის მართვის სისტემა</h1>
        <p className="text-muted">დიზაინ-სისტემის საწყისი გვერდი</p>
      </header>

      <section className="card space-y-3">
        <h2>ფერების პალიტრა</h2>
        <div className="flex flex-wrap gap-4">
          {colors.map((color) => (
            <div key={color.name} className="text-center">
              <div className={`h-16 w-16 rounded-lg ${color.className}`} />
              <span className="text-sm text-muted">{color.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card space-y-3">
        <h2>ღილაკები</h2>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary">შენახვა</button>
          <button className="btn-secondary">გაუქმება</button>
          <button className="btn-danger">წაშლა</button>
          <button className="btn-primary" disabled>დაბლოკილი</button>
        </div>
      </section>

      <section className="card space-y-3">
        <h2>სტატუსები</h2>
        <div className="flex flex-wrap gap-2">
          <span className="badge-success">მარაგშია</span>
          <span className="badge-warning">კრიტიკული მარაგი</span>
          <span className="badge-danger">ამოწურულია</span>
          <span className="badge-info">გზაშია</span>
        </div>
      </section>

      <section className="card space-y-3">
        <h2>ფორმის ველი</h2>
        <input className="input" placeholder="შტრიხკოდი ან SKU..." />
        <p className="font-mono text-sm text-muted">SKU: LAP-001 · 4860001234567</p>
      </section>
    </main>
  )
}

export default App
