import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RotateCcw, TriangleAlert } from 'lucide-react'
import './ErrorBoundary.css'

interface ErrorBoundaryProps {
  children: ReactNode
  resetKey?: string // მაგ. გვერდის მისამართი — სხვა გვერდზე გადასვლისას შეცდომა ქრება
}

interface ErrorBoundaryState {
  error: Error | null
}

// Error Boundary — თუ შიგნით რომელიმე კომპონენტი „გატყდება" (Runtime შეცდომა),
// მთელი აპლიკაცია თეთრ ეკრანად არ იქცევა: ჩანს Fallback UI და ღილაკი „სცადეთ ხელახლა".
// React-ში ეს მხოლოდ კლასის კომპონენტით კეთდება.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // რეალურ პროექტში აქ შეცდომა გაიგზავნებოდა მონიტორინგის სერვისში (მაგ. Sentry)
    console.error('ErrorBoundary დაიჭირა შეცდომა:', error, info.componentStack)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  handleRetry = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="error-boundary" role="alert">
        <TriangleAlert size={44} className="error-boundary__icon" aria-hidden="true" />
        <h2 className="error-boundary__title">რაღაც შეცდომა მოხდა</h2>
        <p className="error-boundary__text">
          ეს გვერდი დროებით ვერ ჩაიტვირთა. დანარჩენი სისტემა მუშაობს — სცადეთ ხელახლა ან გადადით
          სხვა გვერდზე.
        </p>
        {import.meta.env.DEV && (
          <pre className="error-boundary__details">{this.state.error.message}</pre>
        )}
        <button className="btn-primary" onClick={this.handleRetry}>
          <RotateCcw size={16} aria-hidden="true" />
          სცადეთ ხელახლა
        </button>
      </div>
    )
  }
}

export default ErrorBoundary
