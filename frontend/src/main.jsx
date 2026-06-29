import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.jsx';
import './index.css';
import { AuthProvider } from './authContext.jsx';
import ProjectRoutes from './Routes.jsx';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@primer/react';
import ReactGA from 'react-ga4';

ReactGA.initialize("G-Y7R07NBPWQ");

console.log("MAIN.JSX IS EXECUTING!");
const rootElement = document.getElementById('root');
console.log("Root element:", rootElement);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
    ReactGA.send({ hitType: "exception", exDescription: error.toString(), exFatal: true });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#ffebee', color: '#c62828', fontFamily: 'monospace' }}>
          <h2>React App Crashed:</h2>
          <p><strong>{this.state.error && this.state.error.toString()}</strong></p>
          <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(rootElement).render(
  <ErrorBoundary>
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ProjectRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
);