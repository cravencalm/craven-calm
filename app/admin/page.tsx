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
  is_physical?: boolean;
  category?: string | null;
};

type FeaturedVideo = {
  id: number;
  title: string;
  youtube_url: string;
  sort_order: number;
};

type Subscriber = {
  id: number;
  email: string;
  created_at: string;
};

type Book = {
  id: number;
  title: string;
  author: string;
  description: string | null;
  image_url: string | null;
  bookshop_url: string;
  category: "Horror" | "Meditation" | "Mystery" | "Western" | null;
  is_featured: boolean;
  sort_order: number;
};

/** Extract the 11-char YouTube video ID from any common URL format */
function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [audioLength, setAudioLength] = useState("");
  const [status, setStatus] = useState("");
  const [mp3Url, setMp3Url] = useState("");
  const [zipUrl, setZipUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Gelato / Physical state
  const [isPhysical, setIsPhysical] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["gothic"]);

  const CATEGORIES = [
    { id: "gothic", label: "Gothic", group: "Music Releases" },
    { id: "sleep-relaxation", label: "Sleep & Relaxation", group: "Music Releases" },
    { id: "western", label: "Western / Folk", group: "Music Releases" },
    { id: "world-music", label: "World Music", group: "Music Releases" },
    { id: "uplifting", label: "Uplifting", group: "Music Releases" },
    { id: "meditation", label: "Meditation", group: "Music Releases" },
    { id: "wall-art", label: "Wall-Art", group: "Artwork" },
    { id: "mobile-wallpaper", label: "Mobile Wallpapers", group: "Artwork" },
    { id: "limited-print", label: "Limited Print", group: "Artwork" },
    { id: "sculpture", label: "Sculpture", group: "Artwork" },
    { id: "session-dark-calm", label: "Dark Calm", group: "Guided Sessions" },
  ];

  // Featured Videos state
  const [videos, setVideos] = useState<FeaturedVideo[]>([]);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoStatus, setVideoStatus] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);

  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);

  // Books state
  const [books, setBooks] = useState<Book[]>([]);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [bookShopUrl, setBookShopUrl] = useState("");
  const [bookImageUrl, setBookImageUrl] = useState("");
  const [bookCategory, setBookCategory] = useState<"Horror" | "Meditation" | "Mystery" | "Western" | "">("");
  const [isBookFeatured, setIsBookFeatured] = useState(false);
  const [bookStatus, setBookStatus] = useState("");
  const [bookLoading, setBookLoading] = useState(false);
  const [bookEditingId, setBookEditingId] = useState<number | null>(null);

  // Auth state
  const [session, setSession] = useState<Session | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) { fetchProducts(); fetchVideos(); fetchSubscribers(); fetchBooks(); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) { fetchProducts(); fetchVideos(); fetchSubscribers(); fetchBooks(); }
      else { setProducts([]); setVideos([]); setSubscribers([]); setBooks([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const fetchVideos = async () => {
    const { data } = await supabase.from("featured_videos").select("*").order("sort_order", { ascending: true });
    if (data) setVideos(data);
  };

  const fetchSubscribers = async () => {
    setSubscribersLoading(true);
    const { data } = await supabase.from("subscribers").select("*").order("created_at", { ascending: false });
    if (data) setSubscribers(data);
    setSubscribersLoading(false);
  };

  const fetchBooks = async () => {
    setBookLoading(true);
    const { data } = await supabase.from("books").select("*").order("sort_order", { ascending: true });
    if (data) setBooks(data);
    setBookLoading(false);
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
      setIsPhysical(product.is_physical || false);
      const catArray = product.category ? product.category.split(',').map(c => c.trim()) : ["gothic"];
      setSelectedCategories(catArray);
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setYoutubeId(""); setAudioLength(""); setMp3Url(""); setZipUrl(""); setImageUrl("");
    setIsPhysical(false);
    setSelectedCategories(["gothic"]);
    setEditingId(null);
    setProductName("");
    setProductPrice("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: "mp3" | "zip" | "image") => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus(`Uploading ${fileType}...`);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;
    const { error } = await supabase.storage.from("products_media").upload(filePath, file);
    if (error) { setStatus(`Upload failed: ${error.message}`); return; }
    const { data: publicUrlData } = supabase.storage.from("products_media").getPublicUrl(filePath);
    const uploadedUrl = publicUrlData.publicUrl;
    if (fileType === "mp3") setMp3Url(uploadedUrl);
    if (fileType === "zip") setZipUrl(uploadedUrl);
    if (fileType === "image") setImageUrl(uploadedUrl);
    setStatus(`Successfully uploaded ${file.name}`);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Validating product details...");
    
    // 1. Basic Validation
    const priceNum = Number(productPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setStatus("❌ Invalid price. Please enter a positive number.");
      return;
    }

    if (isPhysical && !imageUrl) {
      setStatus("❌ For physical products, an image/artwork upload is recommended.");
      return;
    }

    setStatus("Saving product to database...");
    const payload = { 
      name: productName, 
      price_cents: Math.round(priceNum * 100), 
      youtube_id: youtubeId || null, 
      audio_length: audioLength || null, 
      mp3_preview_url: mp3Url || null, 
      zip_file_url: zipUrl || null, 
      image_url: imageUrl || null,
      is_physical: isPhysical,
      category: selectedCategories.join(",")
    };

    if (editingId) {
      const { error } = await supabase.from('products').update(payload).eq("id", editingId);
      if (error) {
        console.error("Supabase Save Error:", error);
        setStatus(`❌ Database error: ${error.message}${error.hint ? ` (${error.hint})` : ""}`);
      } else { 
        setStatus(`✅ Product "${productName}" updated successfully!`); 
        fetchProducts(); 
        resetForm(); 
      }
    } else {
      const { error } = await supabase.from('products').insert([payload]);
      if (error) {
        console.error("Supabase Save Error:", error);
        setStatus(`❌ Database error: ${error.message}${error.hint ? ` (${error.hint})` : ""}`);
      } else { 
        setStatus(`✅ Product "${productName}" created successfully!`); 
        fetchProducts(); 
        resetForm(); 
      }
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"? This action cannot be undone.`)) return;
    setStatus(`Deleting "${name}"...`);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error("Supabase Delete Error:", error);
      setStatus(`❌ Failed to delete: ${error.message}`);
    } else {
      setStatus(`✅ "${name}" has been removed from the sanctuary.`);
      fetchProducts();
      handleSelectProduct(null);
    }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setVideoStatus("Saving video...");
    setVideoLoading(true);
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      setVideoStatus("❌ Could not extract a YouTube video ID. Please check the link.");
      setVideoLoading(false);
      return;
    }
    const { error } = await supabase.from("featured_videos").insert([{ title: videoTitle, youtube_url: videoUrl, sort_order: videos.length }]);
    if (error) setVideoStatus(`❌ Failed to save: ${error.message}`);
    else { setVideoStatus(`✅ "${videoTitle}" added to Featured Visuals!`); setVideoTitle(""); setVideoUrl(""); fetchVideos(); }
    setVideoLoading(false);
  };

  const handleDeleteVideo = async (id: number, title: string) => {
    if (!confirm(`Remove "${title}" from Featured Visuals?`)) return;
    const { error } = await supabase.from("featured_videos").delete().eq("id", id);
    if (error) setVideoStatus(`❌ Failed to delete: ${error.message}`);
    else { setVideoStatus(`Removed "${title}".`); fetchVideos(); }
  };

  const handleDeleteSubscriber = async (id: number, email: string) => {
    if (!confirm(`Remove "${email}" from the subscriber list?`)) return;
    const { error } = await supabase.from("subscribers").delete().eq("id", id);
    if (error) alert(`Failed to delete: ${error.message}`);
    else fetchSubscribers();
  };

  const handleSelectBook = (book: Book | null) => {
    setBookStatus("");
    if (book) {
      setBookEditingId(book.id);
      setBookTitle(book.title);
      setBookAuthor(book.author);
      setBookDescription(book.description || "");
      setBookShopUrl(book.bookshop_url);
      setBookImageUrl(book.image_url || "");
      setBookCategory(book.category || "");
      setIsBookFeatured(book.is_featured);
    } else {
      resetBookForm();
    }
  };

  const resetBookForm = () => {
    setBookEditingId(null);
    setBookTitle("");
    setBookAuthor("");
    setBookDescription("");
    setBookShopUrl("");
    setBookImageUrl("");
    setBookCategory("");
    setIsBookFeatured(false);
    setBookStatus("");
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookStatus("Saving book...");
    const payload = {
      title: bookTitle,
      author: bookAuthor,
      description: bookDescription || null,
      bookshop_url: bookShopUrl,
      image_url: bookImageUrl || null,
      category: bookCategory || null,
      is_featured: isBookFeatured,
      sort_order: books.length
    };

    if (bookEditingId) {
      const { error } = await supabase.from("books").update(payload).eq("id", bookEditingId);
      if (error) setBookStatus(`❌ Error: ${error.message}`);
      else { setBookStatus("✅ Book updated!"); fetchBooks(); resetBookForm(); }
    } else {
      const { error } = await supabase.from("books").insert([payload]);
      if (error) setBookStatus(`❌ Error: ${error.message}`);
      else { setBookStatus("✅ Book added!"); fetchBooks(); resetBookForm(); }
    }
  };

  const handleDeleteBook = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) setBookStatus(`❌ Error: ${error.message}`);
    else { setBookStatus(`✅ "${title}" removed.`); fetchBooks(); handleSelectBook(null); }
  };

  const handleBookImageUrlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBookStatus("Uploading cover...");
    const fileExt = file.name.split('.').pop();
    const fileName = `book_${Math.random().toString(36).substring(2, 11)}_${Date.now()}.${fileExt}`;
    const filePath = `books/${fileName}`;
    const { error } = await supabase.storage.from("products_media").upload(filePath, file);
    if (error) { setBookStatus(`❌ Upload failed: ${error.message}`); return; }
    const { data: publicUrlData } = supabase.storage.from("products_media").getPublicUrl(filePath);
    setBookImageUrl(publicUrlData.publicUrl);
    setBookStatus(`✅ Cover uploaded: ${file.name}`);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true); setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };
  const previewId = videoUrl ? extractYouTubeId(videoUrl) : null;

  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem", background: "#111", color: "#fff", border: "1px solid var(--border-color)" };

  if (!session) {
    return (
      <div style={{ padding: "4rem", maxWidth: "500px", margin: "0 auto", fontFamily: "var(--font-heading)", color: "var(--text-color)" }}>
        <a href="/" style={{ display: "inline-block", color: "var(--accent-color)", textDecoration: "none", marginBottom: "2rem", fontFamily: "var(--font-body)", fontStyle: "italic" }}>← Return to Storefront</a>
        <div style={{ background: "var(--card-bg)", padding: "2rem", border: "1px solid var(--border-color)", boxShadow: "0 10px 30px rgba(0,0,0,0.8)" }}>
          <h2 style={{ marginBottom: "1rem" }}>Admin Login</h2>
          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
              <input type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} style={{ ...inputStyle, padding: "0.8rem" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Password</label>
              <input type="password" required value={authPassword} onChange={e => setAuthPassword(e.target.value)} style={{ ...inputStyle, padding: "0.8rem" }} />
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
        <a href="/" style={{ display: "inline-block", color: "var(--accent-color)", textDecoration: "none", fontFamily: "var(--font-body)", fontStyle: "italic" }}>← Return to Storefront</a>
        <button onClick={handleLogout} style={{ background: "transparent", color: "var(--text-color)", border: "1px solid #444", padding: "0.4rem 1rem", cursor: "pointer", fontFamily: "var(--font-heading)" }}>Sign Out</button>
      </div>

      <h2>Craven Calm — Content Management System</h2>
      <p style={{ fontFamily: "var(--font-body)", color: "var(--accent-color)" }}>Manage products, upload files, and curate Featured Visuals.</p>

      {/* ─── PRODUCTS ─── */}
      <div style={{ background: "#0a0a0c", padding: "1.5rem", border: "1px solid #333", marginTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0 }}>Existing Sanctuary Items</h3>
          <button onClick={() => handleSelectProduct(null)} style={{ background: editingId === null ? "var(--accent-color)" : "#222", color: editingId === null ? "#000" : "#fff", border: "1px solid #444", padding: "0.4rem 1rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}>+ ADD NEW PRODUCT</button>
        </div>

        {loading ? (
          <p style={{ fontStyle: "italic", fontSize: "0.9rem" }}>Loading products...</p>
        ) : products.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {["Music Releases", "Artwork", "Guided Sessions", "Uncategorized"].map(groupName => {
              const groupProducts = products.filter(p => {
                const cats = p.category?.split(',').map(c => c.trim()) || [];
                if (groupName === "Uncategorized") return cats.length === 0 || cats[0] === "";
                return CATEGORIES.filter(c => c.group === groupName).some(c => cats.includes(c.id));
              });

              if (groupProducts.length === 0) return null;

              return (
                <div key={groupName}>
                  <p style={{ fontSize: "0.7rem", color: "var(--accent-color)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.75rem", fontWeight: "bold", borderBottom: "1px solid #222", paddingBottom: "0.3rem" }}>{groupName}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {groupProducts.map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => handleSelectProduct(p)} 
                        style={{ 
                          background: editingId === p.id ? "var(--accent-color)" : "transparent", 
                          color: editingId === p.id ? "#000" : "var(--accent-color)", 
                          border: `1px solid ${editingId === p.id ? "var(--accent-color)" : "#444"}`, 
                          padding: "0.4rem 1rem", 
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          transition: "all 0.2s"
                        }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : <p style={{ fontStyle: "italic", fontSize: "0.9rem" }}>No products yet.</p>}
      </div>

      <div style={{ background: "var(--card-bg)", padding: "2rem", border: "1px solid var(--border-color)", marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1.5rem", borderBottom: "1px solid #333", paddingBottom: "0.5rem" }}>{editingId ? `Editing: ${productName}` : "Create New Product"}</h3>
        <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div><label style={{ display: "block", marginBottom: "0.5rem" }}>Product Name</label><input required value={productName} onChange={e => setProductName(e.target.value)} style={inputStyle} /></div>
          <div><label style={{ display: "block", marginBottom: "0.5rem" }}>Price (USD)</label><input required type="number" step="0.01" value={productPrice} onChange={e => setProductPrice(e.target.value)} style={inputStyle} /></div>
          <div><label style={{ display: "block", marginBottom: "0.5rem" }}>Audio Length (e.g. 60 Minutes)</label><input value={audioLength} onChange={e => setAudioLength(e.target.value)} placeholder="e.g. 1 Hour 15 Minutes" style={inputStyle} /></div>
          <div><label style={{ display: "block", marginBottom: "0.5rem" }}>YouTube Embed ID (Optional)</label><input value={youtubeId} onChange={e => setYoutubeId(e.target.value)} placeholder="e.g. dQw4w9WgXcQ" style={inputStyle} /></div>
          <div style={{ padding: "1rem", background: "#0a0a0c", border: "1px dashed #333" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Upload Album Artwork {imageUrl && "- Current File Active"}</label>
            <input type="file" accept="image/*" onChange={e => handleFileUpload(e, "image")} style={{ color: "var(--accent-color)", width: "100%" }} />
            {imageUrl && <p style={{ color: "#4caf50", fontSize: "0.8rem", marginTop: "0.5rem" }}>{editingId ? "Image is set. Upload a new one to overwrite." : "Image ready!"}</p>}
          </div>
          <div style={{ padding: "1rem", background: "#0a0a0c", border: "1px dashed #333" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Upload MP3 Preview {mp3Url && "- Current File Active"}</label>
            <input type="file" accept=".mp3" onChange={e => handleFileUpload(e, "mp3")} style={{ color: "var(--accent-color)", width: "100%" }} />
            {mp3Url && <p style={{ color: "#4caf50", fontSize: "0.8rem", marginTop: "0.5rem" }}>{editingId ? "MP3 is set. Upload a new one to overwrite." : "MP3 ready!"}</p>}
          </div>
          <div style={{ padding: "1rem", background: "#0a0a0c", border: "1px dashed #333" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>External ZIP File Link (Google Drive, Dropbox, etc.)</label>
            <input type="url" value={zipUrl} onChange={e => setZipUrl(e.target.value)} placeholder="e.g. https://drive.google.com/file/d/..." style={inputStyle} />
            {zipUrl && <p style={{ color: "#4caf50", fontSize: "0.8rem", marginTop: "0.5rem" }}>Link attached!</p>}
          </div>

          <div style={{ padding: "1.5rem", background: "var(--card-bg)", border: "1px solid #333" }}>
            <label style={{ display: "block", marginBottom: "1rem", fontWeight: "bold", borderBottom: "1px solid #333", paddingBottom: "0.5rem" }}>Product Categories</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
              {["Music Releases", "Artwork", "Guided Sessions"].map(group => (
                <div key={group} style={{ marginBottom: "1rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--accent-color)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem", fontWeight: "bold" }}>{group}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {CATEGORIES.filter(c => c.group === group).map(cat => (
                      <label key={cat.id} style={{ display: "flex", alignItems: "center", gap: "0.8rem", cursor: "pointer", fontSize: "0.9rem" }}>
                        <input 
                          type="checkbox" 
                          checked={selectedCategories.includes(cat.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, cat.id]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== cat.id));
                            }
                          }}
                          style={{ width: "16px", height: "16px", cursor: "pointer" }}
                        />
                        {cat.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "1rem", fontStyle: "italic" }}>A release can belong to multiple categories.</p>
          </div>

          <div style={{ padding: "1.5rem", background: isPhysical ? "#121216" : "#0d0d0f", border: `1px solid ${isPhysical ? "var(--accent-color)" : "#333"}`, transition: "all 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <input type="checkbox" id="isPhysical" checked={isPhysical} onChange={e => setIsPhysical(e.target.checked)} style={{ width: "20px", height: "20px", cursor: "pointer" }} />
              <label htmlFor="isPhysical" style={{ fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer", color: isPhysical ? "var(--accent-color)" : "inherit" }}>
                Physical Product (Manual Fulfillment)
              </label>
            </div>
            {isPhysical && (
              <p style={{ fontSize: "0.85rem", color: "#888", marginTop: "1rem", borderTop: "1px solid #333", paddingTop: "1rem" }}>
                Stripe will collect shipping addresses for this item. You will receive an email upon purchase to fulfill it manually.
              </p>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1rem" }}>
            <button type="submit" className="btn-action">{editingId ? "Update Product" : "Save New Product"}</button>
            {editingId && (
              <>
                <button type="button" onClick={() => handleSelectProduct(null)} style={{ background: "transparent", color: "#888", border: "1px solid #444", padding: "0.8rem 1.5rem", cursor: "pointer", fontFamily: "var(--font-heading)", textTransform: "uppercase", fontSize: "0.9rem" }}>Cancel Edit</button>
                <button 
                  type="button" 
                  onClick={() => handleDeleteProduct(editingId, productName)} 
                  style={{ background: "transparent", color: "#f44336", border: "1px solid #f44336", padding: "0.8rem 1.5rem", cursor: "pointer", fontFamily: "var(--font-heading)", textTransform: "uppercase", fontSize: "0.9rem", marginLeft: "auto" }}
                >
                  Delete Product
                </button>
              </>
            )}
          </div>
          {status && <p style={{ color: "var(--accent-hover)", fontStyle: "italic", fontFamily: "var(--font-body)", marginTop: "1rem" }}>{status}</p>}
        </form>
      </div>

      {/* ─── FEATURED VIDEOS ─── */}
      <div style={{ marginTop: "4rem", borderTop: "2px solid var(--border-color)", paddingTop: "2.5rem" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>📺 Featured Visuals</h2>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--text-color)", opacity: 0.7, marginBottom: "1.5rem", fontSize: "0.95rem" }}>
          Paste any YouTube URL. Videos appear on the home page Featured Visuals section in the order listed below.
        </p>

        {/* Add video form */}
        <div style={{ background: "var(--card-bg)", padding: "2rem", border: "1px solid var(--border-color)" }}>
          <h3 style={{ marginBottom: "1.5rem", borderBottom: "1px solid #333", paddingBottom: "0.5rem" }}>Add a Video</h3>
          <form onSubmit={handleSaveVideo} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Video Title</label>
              <input required value={videoTitle} onChange={e => setVideoTitle(e.target.value)} placeholder="e.g. Candlelit Reprieve — Official Visual" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>YouTube URL</label>
              <input required value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="e.g. https://www.youtube.com/watch?v=YPAsG5iXafE" style={inputStyle} />
              {videoUrl && !previewId && <p style={{ color: "#f44336", fontSize: "0.8rem", marginTop: "0.4rem" }}>⚠️ Could not detect a valid YouTube video ID — check the URL.</p>}
              {previewId && <p style={{ color: "#4caf50", fontSize: "0.8rem", marginTop: "0.4rem" }}>✅ Video ID detected: <code style={{ background: "#0a0a0c", padding: "0.1rem 0.4rem" }}>{previewId}</code></p>}
            </div>
            {/* Live preview */}
            {previewId && (
              <div style={{ background: "#0a0a0c", padding: "1rem", border: "1px dashed #333" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--accent-color)", marginBottom: "0.75rem", fontStyle: "italic" }}>Preview:</p>
                <iframe width="100%" height="280" src={`https://www.youtube.com/embed/${previewId}?controls=1&showinfo=0&rel=0`} title={videoTitle} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border: "none" }} />
              </div>
            )}
            <button type="submit" className="btn-action" disabled={videoLoading || !previewId || !videoTitle}>
              {videoLoading ? "Saving..." : "Add to Featured Visuals"}
            </button>
            {videoStatus && <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", color: "var(--accent-hover)" }}>{videoStatus}</p>}
          </form>
        </div>

        {/* Current videos list */}
        {videos.length > 0 && (
          <div style={{ background: "#0a0a0c", padding: "1.5rem", border: "1px solid #333", marginTop: "1.5rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Current Featured Visuals ({videos.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {videos.map(v => (
                <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#111", padding: "0.75rem 1rem", border: "1px solid #333" }}>
                  <div>
                    <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "0.9rem" }}>{v.title}</p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#888", fontFamily: "var(--font-body)", marginTop: "0.2rem" }}>{v.youtube_url}</p>
                  </div>
                  <button onClick={() => handleDeleteVideo(v.id, v.title)} style={{ background: "transparent", color: "#f44336", border: "1px solid #f44336", padding: "0.3rem 0.8rem", cursor: "pointer", fontFamily: "var(--font-heading)", fontSize: "0.8rem", flexShrink: 0, marginLeft: "1rem" }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── BOOKS ─── */}
      <div id="books-cms" style={{ marginTop: "4rem", borderTop: "2px solid var(--border-color)", paddingTop: "2.5rem" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>📚 Volumes of the Library</h2>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--text-color)", opacity: 0.7, marginBottom: "1.5rem", fontSize: "0.95rem" }}>
          Feature books from Bookshop.org. Books appear on the "Books" page and featured ones on the home page.
        </p>

        <div style={{ background: "#0a0a0c", padding: "1.5rem", border: "1px solid #333", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0 }}>Current Catalog</h3>
            <button onClick={() => handleSelectBook(null)} style={{ background: bookEditingId === null ? "var(--accent-color)" : "#222", color: bookEditingId === null ? "#000" : "#fff", border: "1px solid #444", padding: "0.4rem 1rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}>+ ADD NEW BOOK</button>
          </div>
          
          {bookLoading ? <p>Loading library...</p> : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {books.map(b => (
                <button 
                  key={b.id} 
                  onClick={() => handleSelectBook(b)}
                  style={{ 
                    background: bookEditingId === b.id ? "var(--accent-color)" : "transparent", 
                    color: bookEditingId === b.id ? "#000" : "var(--accent-color)", 
                    border: `1px solid ${bookEditingId === b.id ? "var(--accent-color)" : "#444"}`, 
                    padding: "0.4rem 1rem", 
                    cursor: "pointer",
                    fontSize: "0.85rem"
                  }}
                >
                  {b.title} {b.is_featured && "⭐"}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: "var(--card-bg)", padding: "2rem", border: "1px solid var(--border-color)" }}>
          <h3 style={{ marginBottom: "1.5rem", borderBottom: "1px solid #333", paddingBottom: "0.5rem" }}>{bookEditingId ? `Edit: ${bookTitle}` : "Feature a New Book"}</h3>
          <form onSubmit={handleSaveBook} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Title</label>
                <input required value={bookTitle} onChange={e => setBookTitle(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Author</label>
                <input required value={bookAuthor} onChange={e => setBookAuthor(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
              </div>
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Bookshop.org Affiliate URL</label>
              <input required type="url" value={bookShopUrl} onChange={e => setBookShopUrl(e.target.value)} placeholder="https://bookshop.org/a/..." style={{ ...inputStyle, width: "100%" }} />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Description (Optional)</label>
              <textarea value={bookDescription} onChange={e => setBookDescription(e.target.value)} rows={3} style={{ ...inputStyle, width: "100%", fontFamily: "var(--font-body)", resize: "vertical" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Category</label>
                <select required value={bookCategory} onChange={e => setBookCategory(e.target.value as any)} style={{ ...inputStyle, width: "100%" }}>
                  <option value="">Select Category</option>
                  <option value="Horror">Horror</option>
                  <option value="Meditation">Meditation</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Western">Western</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", paddingTop: "1.8rem" }}>
                <input type="checkbox" id="isBookFeatured" checked={isBookFeatured} onChange={e => setIsBookFeatured(e.target.checked)} style={{ width: "20px", height: "20px", cursor: "pointer" }} />
                <label htmlFor="isBookFeatured" style={{ cursor: "pointer", fontWeight: "bold", color: isBookFeatured ? "var(--accent-color)" : "inherit" }}>Feature on Homepage</label>
              </div>
            </div>

            <div style={{ padding: "1rem", background: "#0a0a0c", border: "1px dashed #333" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Upload Book Cover {bookImageUrl && "— File Active"}</label>
              <input type="file" accept="image/*" onChange={handleBookImageUrlUpload} style={{ color: "var(--accent-color)", width: "100%" }} />
              {bookImageUrl && <img src={bookImageUrl} alt="Preview" style={{ height: "100px", marginTop: "1rem", border: "1px solid #333" }} />}
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" className="btn-action" style={{ flex: 1 }}>{bookEditingId ? "Update Book" : "Add to Library"}</button>
              {bookEditingId && (
                <>
                  <button type="button" onClick={() => handleSelectBook(null)} style={{ background: "transparent", border: "1px solid #444", color: "#888", padding: "0 1.5rem" }}>Cancel</button>
                  <button type="button" onClick={() => handleDeleteBook(bookEditingId, bookTitle)} style={{ background: "transparent", border: "1px solid #f44336", color: "#f44336", padding: "0 1.5rem" }}>Delete</button>
                </>
              )}
            </div>
            {bookStatus && <p style={{ color: "var(--accent-hover)", fontStyle: "italic", textAlign: "center" }}>{bookStatus}</p>}
          </form>
        </div>
      </div>

      {/* ─── NEWSLETTER SUBSCRIBERS ─── */}
      <div style={{ marginTop: "4rem", borderTop: "2px solid var(--border-color)", paddingTop: "2.5rem", marginBottom: "4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ marginBottom: "0.5rem" }}>📧 Newsletter Subscribers</h2>
            <p style={{ fontFamily: "var(--font-body)", color: "var(--text-color)", opacity: 0.7, fontSize: "0.95rem" }}>
              A total of {subscribers.length} souls have joined the sanctuary.
            </p>
          </div>
          {subscribers.length > 0 && (
            <button 
              onClick={() => {
                const emails = subscribers.map(s => s.email).join(", ");
                navigator.clipboard.writeText(emails);
                alert("All subscriber emails copied to clipboard!");
              }}
              style={{ background: "transparent", color: "var(--accent-color)", border: "1px solid var(--accent-color)", padding: "0.5rem 1rem", cursor: "pointer", fontFamily: "var(--font-heading)", fontSize: "0.8rem" }}
            >
              Copy All Emails
            </button>
          )}
        </div>

        {subscribersLoading ? (
          <p style={{ fontStyle: "italic", fontSize: "0.9rem" }}>Loading subscribers...</p>
        ) : subscribers.length > 0 ? (
          <div style={{ background: "#0a0a0c", border: "1px solid #333", maxHeight: "400px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-body)", fontSize: "0.9rem" }}>
              <thead style={{ background: "#111", borderBottom: "1px solid #333" }}>
                <tr>
                  <th style={{ textAlign: "left", padding: "1rem" }}>Email Address</th>
                  <th style={{ textAlign: "right", padding: "1rem" }}>Signed Up On</th>
                  <th style={{ textAlign: "right", padding: "1rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map(s => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #222" }}>
                    <td style={{ padding: "0.8rem 1rem", color: "var(--accent-color)" }}>{s.email}</td>
                    <td style={{ padding: "0.8rem 1rem", textAlign: "right", opacity: 0.6 }}>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: "0.8rem 1rem", textAlign: "right" }}>
                      <button 
                        onClick={() => handleDeleteSubscriber(s.id, s.email)}
                        style={{ background: "transparent", color: "#f44336", border: "1px solid #f44336", padding: "0.2rem 0.6rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "var(--font-heading)" }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "2rem", background: "#0a0a0c", border: "1px solid #333", textAlign: "center" }}>
            <p style={{ fontStyle: "italic", color: "#666" }}>No subscribers yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
