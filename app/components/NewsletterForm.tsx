"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        if (data.error === "ALREADY_SUBSCRIBED") {
          setMessage("You are already subscribed to the sanctuary.");
        } else {
          setMessage(`Error: ${data.error || "Failed to subscribe"}`);
        }
      } else {
        setStatus("success");
        setEmail("");
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage("A network error occurred. Please try again.");
    }
  };

  return (
    <section className="newsletter-section" style={{ flexDirection: "column", alignItems: "center", gap: "1rem" }}>
      {status === "success" ? (
        <div style={{ textAlign: "center", padding: "2rem", border: "1px solid var(--accent-color)", background: "rgba(15, 15, 15, 0.85)" }}>
           <h3 style={{ fontFamily: "var(--font-heading)", color: "var(--accent-color)", marginBottom: "0.5rem" }}>Welcome to the Shadows</h3>
           <p style={{ fontFamily: "var(--font-body)", color: "var(--text-color)" }}>You have successfully joined the newsletter. Check your email.</p>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <input 
            type="email" 
            required 
            placeholder="Enter your email address..." 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              padding: "0.8rem 1.5rem", 
              background: "#111", 
              color: "#fff", 
              border: "1px solid var(--border-color)", 
              fontFamily: "var(--font-body)", 
              fontSize: "1rem",
              width: "300px"
            }} 
          />
          <button type="submit" className="btn-action" disabled={status === "loading"}>
            {status === "loading" ? "Entering..." : "Join Our Newsletter"}
          </button>
        </form>
      )}
      {status === "error" && (
         <p style={{ color: "#d9534f", fontFamily: "var(--font-body)", marginTop: "0.5rem" }}>{message}</p>
      )}
    </section>
  );
}
