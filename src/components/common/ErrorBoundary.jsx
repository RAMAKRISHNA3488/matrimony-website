import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("TeluguBandham Caught UI Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FAF7F2',
            padding: '2rem',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              border: '1.5px solid rgba(201, 162, 74, 0.3)',
              boxShadow: '0 10px 30px -4px rgba(91, 18, 41, 0.1)'
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(122, 22, 53, 0.08)',
                color: '#7A1635',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: '1.75rem'
              }}
            >
              ⚠️
            </div>
            <h2 style={{ color: '#5B1229', fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>
              Something Went Wrong
            </h2>
            <p style={{ color: '#665E68', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              We encountered an unexpected issue rendering this section. Please refresh the page to restore your session.
            </p>
            {this.state.error && (
              <details style={{ textAlign: 'left', margin: '0 0 1.5rem 0', background: '#F8F9FA', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.75rem', color: '#DC2626', wordBreak: 'break-all' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#4B5563', marginBottom: '4px' }}>View Error Details</summary>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{this.state.error.toString()}{'\n'}{this.state.error.stack}</pre>
              </details>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#7A1635',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.7rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Refresh Page
              </button>
              <a
                href="/"
                style={{
                  backgroundColor: '#FAF7F2',
                  color: '#29242A',
                  border: '1.5px solid rgba(201, 162, 74, 0.35)',
                  borderRadius: '9999px',
                  padding: '0.7rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
