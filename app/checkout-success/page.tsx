"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = {
  name: string;
  mp3_preview_url: string;
  zip_file_url: string;
};

import { Suspense } from "react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const productId = searchParams.get("product_id");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDownloadLinks() {
      if (!productId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("name, mp3_preview_url, zip_file_url")
        .eq("id", productId)
        .single();

      if (data) {
        setProduct(data);
      }
      setLoading(false);
    }
    
    if (sessionId) {
      fetchDownloadLinks();
    } else {
      setLoading(false);
    }
  }, [productId, sessionId]);

  return (
    <div style={{ padding: "4rem", maxWidth: "800px", margin: "0 auto", textAlign: "center", fontFamily: "var(--font-heading)", color: "var(--text-color)" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Payment Successful</h1>
      <div style={{ height: "1px", background: "radial-gradient(circle, var(--accent-color) 0%, transparent 80%)", margin: "1.5rem 0" }}></div>
      <p style={{ fontFamily: "var(--font-body)", color: "var(--accent-color)", fontSize: "1.2rem", marginBottom: "3rem" }}>
        Your transaction is complete. Welcome to the sanctuary.
      </p>

      {loading ? (
        <p style={{ fontStyle: "italic", fontFamily: "var(--font-body)" }}>Conjuring your files...</p>
      ) : product ? (
        <div style={{ background: "var(--card-bg)", padding: "3rem", border: "1px solid var(--border-color)", boxShadow: "0 0 30px rgba(0,0,0,0.8)" }}>
          <h2 style={{ marginBottom: "2rem" }}>Downloads for: {product.name}</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" }}>
            
            {product.zip_file_url && (
              <a 
                href={product.zip_file_url} 
                download 
                target="_blank" 
                rel="noreferrer"
                className="btn-action" 
                style={{ textDecoration: "none", width: "100%", maxWidth: "300px", background: "var(--accent-color)", color: "#000" }}
              >
                Download High-Res ZIP
              </a>
            )}

          </div>

          <p style={{ fontFamily: "var(--font-body)", color: "#888", marginTop: "3rem", fontSize: "0.9rem" }}>
            Please bookmark or download these immediately. 
          </p>
        </div>
      ) : (
        <p style={{ color: "#d9534f" }}>Invalid session or product missing. Contact support if you bought something.</p>
      )}

      <a href="/" style={{ display: "inline-block", marginTop: "4rem", color: "var(--text-color)", textDecoration: "none", fontFamily: "var(--font-body)", fontStyle: "italic" }}>
        ← Return back to the shadows (Home)
      </a>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "4rem" }}>Conjuring...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
