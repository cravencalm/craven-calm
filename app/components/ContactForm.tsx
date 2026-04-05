"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(`Error: ${data.error || "Failed to send message."}`);
      } else {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage("A network error occurred. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="contact-form-container" style={{ textAlign: "center", padding: "3rem", background: "var(--card-bg)", border: "1px solid var(--accent-color)" }}>
        <h3 style={{ fontFamily: "var(--font-heading)", color: "var(--accent-color)", marginBottom: "1rem" }}>Your whisper has been carried away.</h3>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--text-color)" }}>We will respond to your inquiry shortly.</p>
        <button 
          onClick={() => setStatus("idle")} 
          className="btn-action" 
          style={{ marginTop: "2rem", padding: "0.5rem 1.5rem", fontSize: "0.9rem" }}
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <div className="contact-form-container">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
             <label style={{ display: "block", marginBottom: "0.5rem", fontFamily: "var(--font-body)", color: "var(--text-color)" }}>Your Name</label>
             <input 
                type="text" 
                required 
                placeholder="The wandering soul..." 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="contact-input"
             />
          </div>
          <div style={{ flex: "1 1 200px" }}>
             <label style={{ display: "block", marginBottom: "0.5rem", fontFamily: "var(--font-body)", color: "var(--text-color)" }}>Contact Email</label>
             <input 
                type="email" 
                required 
                placeholder="Insert your e-mail..." 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="contact-input"
             />
          </div>
        </div>
        
        <div>
           <label style={{ display: "block", marginBottom: "0.5rem", fontFamily: "var(--font-body)", color: "var(--text-color)" }}>Your Inquiry</label>
           <textarea 
              required
              rows={5}
              placeholder="Speak your mind into the void..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="contact-input"
              style={{ resize: "vertical" }}
           />
        </div>

        {status === "error" && (
           <p style={{ color: "#d9534f", fontFamily: "var(--font-body)" }}>{errorMessage}</p>
        )}

        <button type="submit" className="btn-action" disabled={status === "loading"} style={{ alignSelf: "flex-start" }}>
          {status === "loading" ? "Casting into the abyss..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
