"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "@/lib/supabase";
import { resolveAudioUrl } from "@/lib/audioUtils";

interface RadioTrack {
  name: string;
  url: string;
  albumId: number;
  albumName: string;
  albumImage: string;
  priceCents: number;
  category?: string | null;
}

const DEFAULT_SANCTUARY_TRACKS: RadioTrack[] = [
  {
    name: "Dark Calm - Session 1",
    url: "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/8sj6j9j9cf_1775559294046.mp3",
    albumId: 101,
    albumName: "Dark Calm Session 1",
    albumImage: "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/rhrqj1wju5a_1775559282929.png",
    priceCents: 200,
    category: "Gothic, Sanctuary",
  },
  {
    name: "Dark Calm - Session 2",
    url: "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/ww85dxqerce_1775720715108.mp3",
    albumId: 102,
    albumName: "Dark Calm Session 2",
    albumImage: "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/3a8e4tqulfc_1775720324292.jpg",
    priceCents: 200,
    category: "Gothic, Sleep",
  },
  {
    name: "Gothic Meditation - Volume 1",
    url: "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/160s7b0hwey_1776506557261.mp3",
    albumId: 103,
    albumName: "Gothic Meditation - Volume 1",
    albumImage: "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/6fwmj0vierr_1776506554531.png",
    priceCents: 200,
    category: "Gothic, Meditation",
  },
  {
    name: "Gothic Meditation - Volume 2",
    url: "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/78g9965doyd_1776687690220.mp3",
    albumId: 104,
    albumName: "Gothic Meditation - Volume 2",
    albumImage: "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/wxmrk39eay_1776687620772.png",
    priceCents: 200,
    category: "Gothic, Meditation",
  },
  {
    name: "Ruins In The Rain",
    url: "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/0taahmj8nr3p_1775727607615.mp3",
    albumId: 105,
    albumName: "Ruins In The Rain",
    albumImage: "/assets/album_art_1_1775220324510.png",
    priceCents: 200,
    category: "Gothic, Rain",
  },
  {
    name: "The Fallen Sanctuary - Volume 1",
    url: "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/1z5gpjx5a0g_1775740609122.mp3",
    albumId: 106,
    albumName: "The Fallen Sanctuary",
    albumImage: "/assets/album_art_2_1775220324510.png",
    priceCents: 200,
    category: "Sanctuary, Neoclassical",
  },
  {
    name: "Through The Hallways",
    url: "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/2yr5liyeav8_1775465413219.mp3",
    albumId: 107,
    albumName: "Through The Hallways",
    albumImage: "/assets/album_art_1_1775220324510.png",
    priceCents: 200,
    category: "Ambient, Dark Academia",
  },
  {
    name: "Where Time Softens",
    url: "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/704p55sfkzw_1775394408560.mp3",
    albumId: 108,
    albumName: "Where Time Softens",
    albumImage: "/assets/album_art_2_1775220324510.png",
    priceCents: 200,
    category: "Ambient, Meditation",
  },
  {
    name: "Moonlight Calm",
    url: "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/9ao6m7mef2l_1776274148730.mp3",
    albumId: 109,
    albumName: "Moonlight Calm",
    albumImage: "/assets/album_art_1_1775220324510.png",
    priceCents: 200,
    category: "Sleep, Ambient",
  },
  {
    name: "Dead Calm",
    url: "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/b436xzhqzwc_1776336520396.mp3",
    albumId: 110,
    albumName: "Dead Calm",
    albumImage: "/assets/album_art_2_1775220324510.png",
    priceCents: 200,
    category: "Dark Calm, Meditation",
  },
];

export default function SanctuaryRadioPage() {
  const [tracks, setTracks] = useState<RadioTrack[]>(DEFAULT_SANCTUARY_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>("0:00");
  const [duration, setDuration] = useState<string>("0:00");
  const [history, setHistory] = useState<RadioTrack[]>([]);
  const [streamError, setStreamError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Parse time utility
  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Fisher-Yates Shuffle
  const shuffleArray = <T,>(array: T[]): T[] => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Fetch products and build playlist
  useEffect(() => {
    async function loadRadio() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_physical", false);

        if (error) throw error;

        if (data && data.length > 0) {
          const fetchedTracks: RadioTrack[] = [];
          data.forEach((product: any) => {
            if (product.tracks && Array.isArray(product.tracks)) {
              product.tracks.forEach((track: any) => {
                const finalUrl = resolveAudioUrl(track.url, track.name || product.name, product.category);
                fetchedTracks.push({
                  name: track.name || product.name || "Untitled Track",
                  url: finalUrl,
                  albumId: product.id,
                  albumName: product.name,
                  albumImage: product.image_url || "/assets/album_art_1_1775220324510.png",
                  priceCents: product.price_cents,
                  category: product.category,
                });
              });
            } else if (product.mp3_preview_url || product.name) {
              const finalUrl = resolveAudioUrl(product.mp3_preview_url, product.name, product.category);
              fetchedTracks.push({
                name: `${product.name} (Preview)`,
                url: finalUrl,
                albumId: product.id,
                albumName: product.name,
                albumImage: product.image_url || "/assets/album_art_1_1775220324510.png",
                priceCents: product.price_cents,
                category: product.category,
              });
            }
          });

          // Combine with default sanctuary tracks to guarantee working audio streams
          const combinedPlaylist = [...DEFAULT_SANCTUARY_TRACKS, ...fetchedTracks];
          setTracks(shuffleArray(combinedPlaylist));
          setCurrentTrackIndex(0);
        }
      } catch (err) {
        console.warn("Using default sanctuary tracks due to Supabase query response:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRadio();
  }, []);

  const currentTrack = tracks[currentTrackIndex] || DEFAULT_SANCTUARY_TRACKS[0];

  // Add a track to played history (max 4)
  const addToHistory = useCallback((track: RadioTrack) => {
    setHistory((prev) => {
      if (prev.length > 0 && prev[0].url === track.url) return prev;
      const filtered = prev.filter((t) => t.url !== track.url);
      return [track, ...filtered].slice(0, 4);
    });
  }, []);

  // Play next track
  const handleNext = useCallback(() => {
    if (tracks.length === 0) return;
    if (currentTrack) {
      addToHistory(currentTrack);
    }
    
    setCurrentTrackIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= tracks.length) {
        const reshuffled = shuffleArray(tracks);
        setTracks(reshuffled);
        return 0;
      }
      return nextIndex;
    });
    setStreamError(null);
    setIsPlaying(true);
  }, [tracks, currentTrack, addToHistory]);

  // Handle audio loading or network errors gracefully without infinite auto-skipping loops
  const handleAudioError = useCallback(() => {
    console.warn("Sanctuary Radio Stream Error on track:", currentTrack?.name);
    setIsPlaying(false);
    setStreamError("Audio stream temporarily offline. Click skip ⏭ to try another track.");
  }, [currentTrack?.name]);

  // Play a specific track directly
  const playTrackDirectly = (track: RadioTrack) => {
    const idx = tracks.findIndex((t) => t.url === track.url);
    if (idx !== -1) {
      if (currentTrack) {
        addToHistory(currentTrack);
      }
      setStreamError(null);
      setCurrentTrackIndex(idx);
      setIsPlaying(true);
    }
  };

  // Sync state to HTML5 Audio Element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const promise = audio.play();
      if (promise !== undefined) {
        promise.catch((err) => {
          console.warn("Audio play blocked or failed:", err);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  // Sync volume and mute state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Checkout flow integration
  const handleCheckout = async (productId: number) => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productId.toString() }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Navbar />

      <div className="music-page-header radio-header">
        <div className="live-pill">
          <span className="live-dot"></span>
          LIVE FROM THE SANCTUARY
        </div>
        <h1 className="music-page-title">Sanctuary Radio</h1>
        <p className="music-page-subtitle">A continuous stream of healing shadows and candlelight frequencies</p>
      </div>

      <main className="radio-main-layout">
        {/* HTML5 Audio Core */}
        {currentTrack && (
          <audio
            ref={audioRef}
            src={currentTrack.url}
            onLoadedMetadata={(e) => {
              setDuration(formatTime(e.currentTarget.duration));
              setStreamError(null);
            }}
            onTimeUpdate={(e) => {
              setCurrentTime(formatTime(e.currentTarget.currentTime));
              if (e.currentTarget.duration) {
                setProgress((e.currentTarget.currentTime / e.currentTarget.duration) * 100);
              }
            }}
            onEnded={handleNext}
            onError={handleAudioError}
          />
        )}

        <div className="radio-grid">
          {/* LEFT SIDE: Now Playing & Main controls */}
          <div className="radio-player-card">
            {loading ? (
              <div className="radio-loading">
                <span className="ornament left">&#10086;</span>
                <p>Summoning the frequencies...</p>
                <span className="ornament right">&#10086;</span>
              </div>
            ) : currentTrack ? (
              <div className="now-playing-container">
                <div className="now-playing-cover-wrapper">
                  <img
                    key={currentTrack.url}
                    src={currentTrack.albumImage}
                    alt={currentTrack.albumName}
                    className={`now-playing-cover ${isPlaying ? "playing" : ""}`}
                  />
                  <div className="now-playing-glow"></div>
                </div>

                <div className="now-playing-details">
                  <span className="track-album-subtitle">Album: {currentTrack.albumName}</span>
                  <h2 className="track-title-large">{currentTrack.name}</h2>
                  
                  {streamError && (
                    <div className="stream-error-badge">
                      <span>⚠️ {streamError}</span>
                    </div>
                  )}

                  {currentTrack.category && (
                    <div className="track-genres">
                      {currentTrack.category.split(",").map((cat) => (
                        <span key={cat} className="radio-tag">
                          {cat.trim().replace(/-/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* CSS Animated Audio Visualizer */}
                <div className="visualizer-container">
                  <div className={`visualizer-bars ${isPlaying ? "active" : ""}`}>
                    {Array.from({ length: 24 }).map((_, i) => {
                      const delay = (i % 5) * 0.15 + (i % 3) * 0.08;
                      const duration = 0.8 + (i % 4) * 0.15;
                      return (
                        <div
                          key={i}
                          className="v-bar"
                          style={{
                            animationDelay: isPlaying ? `${delay}s` : "0s",
                            animationDuration: isPlaying ? `${duration}s` : "0s",
                          }}
                        ></div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="radio-progress-area">
                  <div
                    className="radio-progress-bar-container"
                    onClick={(e) => {
                      const audio = audioRef.current;
                      if (!audio || !audio.duration) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const width = rect.width;
                      const percent = clickX / width;
                      audio.currentTime = percent * audio.duration;
                      setProgress(percent * 100);
                    }}
                  >
                    <div className="radio-progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="radio-time-display">
                    <span>{currentTime}</span>
                    <span>{duration}</span>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="radio-control-hud">
                  <button
                    className="radio-control-btn mute-btn"
                    onClick={() => setIsMuted(!isMuted)}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? "🔇" : "🔊"}
                  </button>

                  <div className="volume-slider-container">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setVolume(val);
                        setIsMuted(false);
                      }}
                      className="volume-slider"
                      title="Adjust Volume"
                    />
                  </div>

                  <button
                    className="radio-play-btn-circle"
                    onClick={() => setIsPlaying(!isPlaying)}
                    title={isPlaying ? "Pause Stream" : "Tune In"}
                  >
                    <span className="play-icon-span">{isPlaying ? "⏸" : "▶"}</span>
                  </button>

                  <button
                    className="radio-control-btn skip-btn"
                    onClick={handleNext}
                    title="Skip to Next Melody"
                  >
                    ⏭
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ textAlign: "center", fontStyle: "italic" }}>No tracks available in the radio sanctum.</p>
            )}
          </div>

          {/* RIGHT SIDE: Sidebar (Support Artist & Recently Played) */}
          <div className="radio-sidebar">
            {currentTrack && (
              <div className="support-card">
                <h3>Support the Artist</h3>
                <p>
                  Deeply moved by the melodies of <em>{currentTrack.albumName}</em>? Bring this complete sanctuary to your library permanently.
                </p>
                <div className="support-buy-row">
                  <span className="support-price">${(currentTrack.priceCents / 100).toFixed(2)}</span>
                  <button
                    className="btn-buy support-buy-btn"
                    onClick={() => handleCheckout(currentTrack.albumId)}
                  >
                    Buy Album
                  </button>
                </div>
              </div>
            )}

            <div className="history-card">
              <h3>Recently Played</h3>
              {history.length > 0 ? (
                <div className="history-list">
                  {history.map((track, i) => (
                    <div
                      key={i}
                      className="history-item"
                      onClick={() => playTrackDirectly(track)}
                      title={`Tune in: ${track.name}`}
                    >
                      <img src={track.albumImage} alt={track.albumName} className="history-thumb" />
                      <div className="history-item-details">
                        <span className="history-track-name">{track.name}</span>
                        <span className="history-album-name">{track.albumName}</span>
                      </div>
                      <span className="history-play-icon">▶</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-history-text">Melodies played will materialize here...</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Styled JSX Stylesheet */}
      <style>{`
        .radio-header {
          padding-top: 8rem;
          padding-bottom: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .live-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(227, 169, 104, 0.05);
          color: var(--accent-color);
          border: 1px solid rgba(227, 169, 104, 0.3);
          border-radius: 50px;
          padding: 0.3rem 1.2rem;
          font-family: var(--font-heading);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
          box-shadow: 0 0 15px rgba(227, 169, 104, 0.05);
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background-color: #f44336;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 10px #f44336;
          animation: pulse-dot 1.8s infinite;
        }

        @keyframes pulse-dot {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 15px #f44336; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }

        .radio-main-layout {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 4% 5rem;
          font-family: var(--font-body);
        }

        .radio-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        .radio-player-card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          box-shadow: inset 0 0 25px rgba(0, 0, 0, 0.9), 0 15px 40px rgba(0, 0, 0, 0.7);
          border-top: 2px solid var(--accent-color);
          border-radius: 6px;
          padding: 3rem;
          position: relative;
          overflow: hidden;
        }

        .radio-player-card::before {
          content: "";
          position: absolute;
          top: -10%;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 40%;
          background: radial-gradient(circle, rgba(227, 169, 104, 0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .radio-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.5rem;
          height: 350px;
          color: var(--accent-color);
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-style: italic;
        }

        .now-playing-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .now-playing-cover-wrapper {
          position: relative;
          width: 260px;
          height: 260px;
          margin-bottom: 2rem;
        }

        .now-playing-cover {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid rgba(227, 169, 104, 0.4);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.9);
          filter: sepia(0.2) contrast(1.2) brightness(0.85);
          transition: opacity 0.4s ease;
          animation: spin-cover 28s linear infinite paused;
        }

        .now-playing-cover.playing {
          animation-play-state: running;
        }

        .now-playing-glow {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(227, 169, 104, 0.15) 0%, transparent 70%);
          pointer-events: none;
          z-index: -1;
          animation: breathe-glow 4s ease-in-out infinite alternate;
        }

        @keyframes breathe-glow {
          0% { transform: scale(0.98); opacity: 0.6; }
          100% { transform: scale(1.05); opacity: 1; }
        }

        @keyframes spin-cover {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .now-playing-details {
          text-align: center;
          margin-bottom: 1.5rem;
          width: 100%;
        }

        .track-album-subtitle {
          display: block;
          font-family: var(--font-subheading);
          font-style: italic;
          color: #888;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .track-title-large {
          font-family: var(--font-heading);
          font-size: 2.2rem;
          color: var(--accent-color);
          letter-spacing: 0.05em;
          margin: 0 0 0.8rem 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
          line-height: 1.25;
        }

        .stream-error-badge {
          display: inline-block;
          background: rgba(220, 53, 69, 0.15);
          border: 1px solid rgba(220, 53, 69, 0.4);
          color: #ff6b6b;
          font-size: 0.85rem;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          margin-bottom: 0.8rem;
        }

        .track-genres {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }

        .radio-tag {
          font-size: 0.7rem;
          background: rgba(227, 169, 104, 0.07);
          color: var(--accent-color);
          padding: 2px 8px;
          border: 1px solid rgba(227, 169, 104, 0.2);
          border-radius: 2px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* simulated dynamic visualizer style */
        .visualizer-container {
          width: 100%;
          height: 40px;
          margin-bottom: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .visualizer-bars {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 100%;
        }

        .v-bar {
          width: 4px;
          height: 3px;
          background-color: var(--accent-color);
          box-shadow: 0 0 4px rgba(227, 169, 104, 0.4);
          transition: height 0.2s ease, opacity 0.2s ease;
          opacity: 0.5;
        }

        .visualizer-bars.active .v-bar {
          animation: bounce-bar 1.2s infinite ease-in-out alternate;
          opacity: 0.9;
        }

        @keyframes bounce-bar {
          0% { height: 4px; }
          100% { height: 35px; }
        }

        /* custom progress bars */
        .radio-progress-area {
          width: 100%;
          margin-bottom: 2rem;
        }

        .radio-progress-bar-container {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.02);
          border-radius: 4px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .radio-progress-fill {
          height: 100%;
          background: var(--accent-color);
          box-shadow: 0 0 8px var(--accent-color);
          border-radius: 4px;
          transition: width 0.1s linear;
        }

        .radio-time-display {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-heading);
          font-size: 0.85rem;
          color: #777;
          margin-top: 0.5rem;
        }

        /* media HUD controls */
        .radio-control-hud {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          width: 100%;
        }

        .radio-control-btn {
          background: transparent;
          border: none;
          color: var(--text-color);
          font-size: 1.3rem;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.2s, transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
        }

        .radio-control-btn:hover {
          opacity: 1;
          color: var(--accent-color);
          transform: scale(1.05);
        }

        .volume-slider-container {
          display: flex;
          align-items: center;
          width: 100px;
        }

        .volume-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
          cursor: pointer;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--accent-color);
          box-shadow: 0 0 6px var(--accent-color);
          cursor: pointer;
        }

        .radio-play-btn-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: transparent;
          border: 1px solid var(--accent-color);
          box-shadow: inset 0 0 10px rgba(227, 169, 104, 0.1), 0 0 15px rgba(227, 169, 104, 0.05);
          color: var(--accent-color);
          font-size: 1.6rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          position: relative;
        }

        .radio-play-btn-circle:hover {
          background: var(--accent-color);
          color: #000;
          box-shadow: 0 0 20px rgba(227, 169, 104, 0.3);
          transform: scale(1.05);
        }

        .play-icon-span {
          display: inline-block;
          transform: translate(0.5px, 0.5px);
        }

        /* SIDEBAR STYLINGS */
        .radio-sidebar {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .support-card, .history-card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 2rem;
          box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.8);
        }

        .support-card h3, .history-card h3 {
          font-family: var(--font-heading);
          color: var(--accent-color);
          font-size: 1.2rem;
          margin-top: 0;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(227, 169, 104, 0.1);
          padding-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }

        .support-card p {
          color: #a4a195;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .support-buy-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .support-price {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.3rem;
          color: var(--text-color);
        }

        .support-buy-btn {
          width: auto;
          padding: 0.5rem 1.8rem;
        }

        /* Recents list style */
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.6rem;
          border: 1px solid rgba(255, 255, 255, 0.02);
          background: rgba(0, 0, 0, 0.15);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
        }

        .history-item:hover {
          border-color: rgba(227, 169, 104, 0.2);
          background: rgba(227, 169, 104, 0.03);
        }

        .history-thumb {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 3px;
          filter: sepia(0.2) contrast(1.1) brightness(0.8);
        }

        .history-item-details {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          min-width: 0; /* truncate text fix */
        }

        .history-track-name {
          font-family: var(--font-heading);
          font-size: 0.9rem;
          color: var(--text-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .history-album-name {
          font-family: var(--font-subheading);
          font-style: italic;
          font-size: 0.8rem;
          color: #777;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 0.1rem;
        }

        .history-play-icon {
          color: var(--accent-color);
          opacity: 0;
          font-size: 0.8rem;
          transition: opacity 0.2s;
          margin-right: 0.3rem;
        }

        .history-item:hover .history-play-icon {
          opacity: 0.8;
        }

        .no-history-text {
          font-style: italic;
          color: #555;
          text-align: center;
          font-size: 0.9rem;
          margin: 1.5rem 0;
        }

        /* RESPONSIVE BREAKPOINTS */
        @media (max-width: 1024px) {
          .radio-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 768px) {
          .radio-player-card {
            padding: 1.5rem;
          }

          .track-title-large {
            font-size: 1.6rem;
          }

          .now-playing-cover-wrapper {
            width: 200px;
            height: 200px;
          }

          .radio-control-hud {
            gap: 1rem;
          }

          .volume-slider-container {
            width: 70px;
          }
        }
      `}</style>
    </>
  );
}
