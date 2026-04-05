"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

type Product = {
  id: number;
  name: string;
  price_cents: number;
  youtube_id: string | null;
  mp3_preview_url: string | null;
  zip_file_url: string | null;
  image_url: string | null;
  audio_length: string | null;
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection state
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [audioLength, setAudioLength] = useState("");
  const [status, setStatus] = useState("");
  
  // Track uploaded file URLs
  const [mp3Url, setMp3Url] = useState("");
  const [zipUrl, setZipUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Auth state
  const [session, setSession] = useState<Session | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProducts();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProducts();
      else setProducts([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleSelectProduct = (product: Product | null) => {
    setStatus("");
    if (product) {
      setEditingId(product.id);
      setProductName(product.name);
      setProductPrice((product.price_cents / 100).toString());
      setYoutubeId(product.youtube_id || "");
      setMp3Url(product.mp3_preview_url || "");
      setZipUrl(product.zip_file_url || "");
      setImageUrl(product.image_url || "");
      setAudioLength(product.audio_length || "");
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setProductName("");
    setProductPrice("");
    setYoutubeId("");
    setAudioLength("");
    setMp3Url("");
    setZipUrl("");
    setImageUrl("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: "mp3" | "zip" | "image") => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus(`Uploading ${fileType}...`);
    
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await supabase.storage
      .from("products_media")
      .upload(filePath, file);

    if (error) {
      setStatus(`Upload failed: ${error.message}`);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("products_media")
      .getPublicUrl(filePath);

    const uploadedUrl = publicUrlData.publicUrl;

    if (fileType === "mp3") setMp3Url(uploadedUrl);
    if (fileType === "zip") setZipUrl(uploadedUrl);
    if (fileType === "image") setImageUrl(uploadedUrl);

    setStatus(`Successfully uploaded ${file.name}`);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Saving product to database...");

    const payload = { 
      name: productName, 
      price_cents: Math.round(Number(productPrice) * 100), 
      youtube_id: youtubeId,
      audio_length: audioLength,
      mp3_preview_url: mp3Url,
      zip_file_url: zipUrl,
      image_url: imageUrl
    };

    if (editingId) {
      // Update existing
      const { error } = await supabase.from('products').update(payload).eq("id", editingId);
      if (error) {
        setStatus(`Failed to update: ${error.message}`);
      } else {
        setStatus(`Product "${productName}" updated successfully!`);
        fetchProducts(); // Refresh list
        resetForm(); // Return to 'Add New' mode
      }
    } else {
      // Insert new
      const { error } = await supabase.from('products').insert([payload]);
      if (error) {
        setStatus(`Failed to save: ${error.message}`);
      } else {
        setStatus(`Product "${productName}" created successfully!`);
        fetchProducts(); // Refresh list
        resetForm();
      }
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    
    // Only allow sign in, signup is disabled in the UI
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) setAuthError(error.message);
    
    setAuthLoading(false);
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return (
      <div style={{ padding: "4rem", maxWidth: "500px", margin: "0 auto", fontFamily: "var(--font-heading)", color: "var(--text-color)" }}>
        <a href="/" style={{ display: "inline-block", color: "var(--accent-color)", textDecoration: "none", marginBottom: "2rem", fontFamily: "var(--font-body)", fontStyle: "italic" }}>
          ← Return to Storefront
        </a>
        <div style={{ background: "var(--card-bg)", padding: "2rem", border: "1px solid var(--border-color)", boxShadow: "0 10px 30px rgba(0,0,0,0.8)" }}>
          <h2 style={{ marginBottom: "1rem" }}>Admin Login</h2>
          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
              <input 
                type="email" 
                required 
                value={authEmail} 
                onChange={e => setAuthEmail(e.target.value)} 
                style={{ width: "100%", padding: "0.8rem", background: "#111", color: "#fff", border: "1px solid var(--border-color)" }} 
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Password</label>
              <input 
                type="password" 
                required 
                value={authPassword} 
                onChange={e => setAuthPassword(e.target.value)} 
                style={{ width: "100%", padding: "0.8rem", background: "#111", color: "#fff", border: "1px solid var(--border-color)" }} 
              />
            </div>
            {authError && <p style={{ color: "var(--accent-hover)", fontStyle: "italic", fontSize: "0.9rem", fontFamily: "var(--font-body)" }}>{authError}</p>}
            <button type="submit" disabled={authLoading} className="btn-action" style={{ marginTop: "1rem", padding: "0.8rem" }}>
              {authLoading ? "Authenticating..." : "Sign In to CMS"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "4rem", maxWidth: "800px", margin: "0 auto", fontFamily: "var(--font-heading)", color: "var(--text-color)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <a href="/" style={{ display: "inline-block", color: "var(--accent-color)", textDecoration: "none", fontFamily: "var(--font-body)", fontStyle: "italic" }}>
          ← Return to Storefront
        </a>
        <button onClick={handleLogout} style={{ background: "transparent", color: "var(--text-color)", border: "1px solid #444", padding: "0.4rem 1rem", cursor: "pointer", fontFamily: "var(--font-heading)" }}>
          Sign Out
        </button>
      </div>
      <h2>Craven Calm - Content Management System</h2>
      <p style={{ fontFamily: "var(--font-body)", color: "var(--accent-color)" }}>
        Manage your digital products, upload secure files, and link YouTube embeds.
      </p>

      {/* Product Selection List */}
      <div style={{ background: "#0a0a0c", padding: "1.5rem", border: "1px solid #333", marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Edit Existing Products</h3>
        {loading ? (
           <p style={{ fontStyle: "italic", fontSize: "0.9rem" }}>Loading products...</p>
        ) : products.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button 
              onClick={() => handleSelectProduct(null)} 
              style={{ background: editingId === null ? "var(--accent-color)" : "#222", color: editingId === null ? "#000" : "#fff", border: "1px solid #444", padding: "0.4rem 1rem", cursor: "pointer" }}
            >
              + Create New Product
            </button>
            {products.map(p => (
              <button 
                key={p.id} 
                onClick={() => handleSelectProduct(p)} 
                style={{ background: editingId === p.id ? "var(--accent-color)" : "transparent", color: editingId === p.id ? "#000" : "var(--accent-color)", border: `1px solid ${editingId === p.id ? "var(--accent-color)" : "#444"}`, padding: "0.4rem 1rem", cursor: "pointer" }}
              >
                {p.name}
              </button>
            ))}
          </div>
        ) : (
          <p style={{ fontStyle: "italic", fontSize: "0.9rem" }}>No products found. Create your first one below!</p>
        )}
      </div>

      <div style={{ background: "var(--card-bg)", padding: "2rem", border: "1px solid var(--border-color)", marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1.5rem", borderBottom: "1px solid #333", paddingBottom: "0.5rem" }}>
           {editingId ? `Editing: ${productName}` : "Create New Product"}
        </h3>
        <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Product Name</label>
            <input 
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", background: "#111", color: "#fff", border: "1px solid var(--border-color)" }} 
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Price (USD)</label>
            <input 
              required
              type="number"
              step="0.01"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", background: "#111", color: "#fff", border: "1px solid var(--border-color)" }} 
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Audio Length (e.g. 60 Minutes)</label>
            <input 
              value={audioLength}
              onChange={(e) => setAudioLength(e.target.value)}
              placeholder="e.g. 1 Hour 15 Minutes"
              style={{ width: "100%", padding: "0.5rem", background: "#111", color: "#fff", border: "1px solid var(--border-color)" }} 
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>YouTube Embed ID (Optional)</label>
            <input 
              value={youtubeId}
              onChange={(e) => setYoutubeId(e.target.value)}
              placeholder="e.g. dQw4w9WgXcQ"
              style={{ width: "100%", padding: "0.5rem", background: "#111", color: "#fff", border: "1px solid var(--border-color)" }} 
            />
          </div>

          <div style={{ padding: "1rem", background: "#0a0a0c", border: "1px dashed #333" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Upload Album Artwork (Image) {imageUrl && "- Current File Active"}</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "image")} style={{ color: "var(--accent-color)", width: "100%" }} />
            {imageUrl && <p style={{ color: "#4caf50", fontSize: "0.8rem", marginTop: "0.5rem" }}>{editingId ? "Image is set. Choosing a file above will overwrite it." : "Image ready!"}</p>}
          </div>

          <div style={{ padding: "1rem", background: "#0a0a0c", border: "1px dashed #333" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Upload MP3 Preview (Public) {mp3Url && "- Current File Active"}</label>
            <input type="file" accept=".mp3" onChange={(e) => handleFileUpload(e, "mp3")} style={{ color: "var(--accent-color)", width: "100%" }} />
            {mp3Url && <p style={{ color: "#4caf50", fontSize: "0.8rem", marginTop: "0.5rem" }}>{editingId ? "MP3 is set. Choosing a file above will overwrite it." : "MP3 ready!"}</p>}
          </div>

          <div style={{ padding: "1rem", background: "#0a0a0c", border: "1px dashed #333" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>External ZIP File Link (Google Drive, Dropbox, etc.)</label>
            <input 
              type="url" 
              value={zipUrl} 
              onChange={(e) => setZipUrl(e.target.value)} 
              placeholder="e.g. https://drive.google.com/file/d/..." 
              style={{ width: "100%", padding: "0.5rem", background: "#111", color: "#fff", border: "1px solid var(--border-color)" }} 
            />
            {zipUrl && <p style={{ color: "#4caf50", fontSize: "0.8rem", marginTop: "0.5rem" }}>Link attached!</p>}
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
             <button type="submit" className="btn-action" disabled={!productName || !productPrice}>
                {editingId ? "Update Product" : "Save New Product"}
             </button>
             {editingId && (
                <button type="button" onClick={() => handleSelectProduct(null)} style={{ background: "transparent", color: "#888", border: "1px solid #444", padding: "0.8rem 2.5rem", cursor: "pointer", fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>Cancel Edit</button>
             )}
          </div>

          {status && <p style={{ color: "var(--accent-hover)", fontStyle: "italic", fontFamily: "var(--font-body)", marginTop: "1rem" }}>{status}</p>}

        </form>
      </div>
    </div>
  );
}
