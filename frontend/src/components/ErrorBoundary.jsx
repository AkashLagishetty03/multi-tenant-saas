import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected app error',
    }
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
          <div className="w-full max-w-xl rounded-xl border border-red-200 bg-white p-6 shadow-md">
            <h1 className="text-lg font-semibold text-red-700">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-700">
              The app failed to render. Open browser console for details.
            </p>
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              {this.state.errorMessage}
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
