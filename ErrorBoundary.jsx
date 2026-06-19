import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * CO4 & CO2: JavaScript and React Error Boundary Engineering
 * In modern front-end frameworks, runtime exceptions in rendering loops could completely dismantle 
 * the DOM tree, causing a blank screen. ErrorBoundary acts as a declarative catch block that intercept 
 * crashes in child components using the static method `getDerivedStateFromError` and the lifecycle method `componentDidCatch`.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // CO1: Declarative state update upon catching rendering errors
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // CO2 & CO6: Log crash telemetry to external monitoring service simulation
    console.error("ErrorBoundary trapped exception:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#090a0f",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          padding: "20px"
        }}>
          <div className="card" style={{ maxWidth: "500px", width: "100%", textAlign: "center", border: "1px solid var(--danger)" }}>
            <AlertTriangle size={48} style={{ color: "var(--danger)", marginBottom: "16px" }} />
            <h2 style={{ marginBottom: "10px" }}>UI Rendering Error Trapped</h2>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: "1.5" }}>
              An unexpected Javascript execution exception occurred inside the React reconciliation cycle. The Virtual DOM has gracefully recovered.
            </p>
            <div style={{ background: "#151822", padding: "12px", borderRadius: "8px", textAlign: "left", fontSize: "12px", fontFamily: "monospace", color: "#fca5a5", marginBottom: "20px", overflowX: "auto" }}>
              {this.state.error && this.state.error.toString()}
            </div>
            <button className="btn btn-primary btn-full" onClick={this.handleReset}>
              <RefreshCw size={14} />
              Reset Application State
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
