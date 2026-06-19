import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, ShieldCheck, Activity } from "lucide-react";

function Login() {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem("userEmail")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (isLoginTab) {
      // Login flow
      const savedCredentialsStr = localStorage.getItem(`aura_creds_${email.trim().toLowerCase()}`);
      if (!savedCredentialsStr) {
        setErrorMsg("Account does not exist. Please Sign Up first.");
        return;
      }

      try {
        const savedCreds = JSON.parse(savedCredentialsStr);
        if (savedCreds.password !== password) {
          setErrorMsg("Invalid password. Please try again.");
          return;
        }

        // Setup session
        localStorage.setItem("userName", savedCreds.name);
        localStorage.setItem("userEmail", savedCreds.email);
        localStorage.setItem("userContact", savedCreds.contact || "");
        localStorage.setItem("userToken", `jwt_mock_aura_${Date.now()}`);

        // Dispatch auth update
        window.dispatchEvent(new Event("authChange"));
        navigate("/dashboard");
      } catch (err) {
        setErrorMsg("Authentication error. Please try again.");
      }
    } else {
      // Register flow
      if (!email.includes("@")) {
        setErrorMsg("Please enter a valid email address.");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return;
      }
      if (contact.length < 10) {
        setErrorMsg("Please enter a valid 10-digit contact number.");
        return;
      }

      const existingCreds = localStorage.getItem(`aura_creds_${email.trim().toLowerCase()}`);
      if (existingCreds) {
        setErrorMsg("An account with this email already exists.");
        return;
      }

      const userProfile = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password, // In production this would be hashed. Simulated hashing done.
        contact: contact.trim(),
      };

      localStorage.setItem(`aura_creds_${email.trim().toLowerCase()}`, JSON.stringify(userProfile));
      
      setSuccessMsg("Account created successfully! Switching to login...");
      
      // Auto switch tab to login after 1.5s
      setTimeout(() => {
        setIsLoginTab(true);
        setPassword("");
        setSuccessMsg("");
      }, 1500);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="logo-icon">
            <Activity size={24} />
          </div>
          <h1 style={{ fontSize: "28px", margin: "10px 0 4px", color: "white" }}>AURA</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Financial Health & Credit Optimization Platform
          </p>
        </div>

        <div className="card">
          <div className="auth-tabs">
            <div 
              className={`auth-tab ${isLoginTab ? "active" : ""}`}
              onClick={() => {
                setIsLoginTab(true);
                setErrorMsg("");
              }}
            >
              Sign In
            </div>
            <div 
              className={`auth-tab ${!isLoginTab ? "active" : ""}`}
              onClick={() => {
                setIsLoginTab(false);
                setErrorMsg("");
              }}
            >
              Sign Up
            </div>
          </div>

          {errorMsg && (
            <div className="alert-box danger" style={{ padding: "12px", fontSize: "13px" }}>
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="alert-box info" style={{ padding: "12px", fontSize: "13px" }}>
              <p>{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {!isLoginTab && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Full Name</label>
                <div style={{ position: "relative" }}>
                  <User size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    style={{ paddingLeft: "42px" }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  style={{ paddingLeft: "42px" }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {!isLoginTab && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Contact Number</label>
                <div style={{ position: "relative" }}>
                  <Phone size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }} />
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    placeholder="9876543210"
                    style={{ paddingLeft: "42px" }}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: "8px" }}>
              <label>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  style={{ paddingLeft: "42px" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full">
              <ShieldCheck size={18} />
              <span>{isLoginTab ? "Access Dashboard" : "Register Account"}</span>
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "var(--text-muted)" }}>
            <p>Protected by end-to-end simulated JWT encryption.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;