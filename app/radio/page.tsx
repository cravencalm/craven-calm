"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "@/lib/supabase";

interface RadioTrack {
  name: string;
  url: string;
  albumId: number;
  albumName: string;
  albumImage: string;
  priceCents: number;
  category?: string | null;
}

export default function SanctuaryRadioPage() {
  const [tracks, setTracks] = useState<RadioTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>("0:00");
  const [duration, setDuration] = useState<string>("0:00");
  const [history, setHistory] = useState<RadioTrack[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Parse time utility
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
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

        if (data) {
          const allTracks: RadioTrack[] = [];
          data.forEach((product: any) => {
            if (product.tracks && Array.isArray(product.tracks)) {
              product.tracks.forEach((track: any) => {
                if (track.url) {
                  allTracks.push({
                    name: track.name || "Untitled Track",
                    url: track.url,
                    albumId: product.id,
                    albumName: product.name,
                    albumImage: product.image_url || "/assets/album_art_1_1775220324510.png",
                    priceCents: product.price_cents,
                    category: product.category,
                  });
                }
              });
            } else if (product.mp3_preview_url) {
              allTracks.push({
                name: `${product.name} (Preview)`,
                url: product.mp3_preview_url,
                albumId: product.id,
                albumName: product.name,
                albumImage: product.image_url || "/assets/album_art_1_1775220324510.png",
                priceCents: product.price_cents,
                category: product.category,
              });
            }
          });

          if (allTracks.length > 0) {
            const shuffled = shuffleArray(allTracks);
            setTracks(shuffled);
            setCurrentTrackIndex(0);
          }
        }
      } catch (err) {
        console.error("Failed to load radio playlist:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRadio();
  }, []);

  const currentTrack = tracks[currentTrackIndex];

  // Add a track to played history (max 4)
  const addToHistory = useCallback((track: RadioTrack) => {
    setHistory((prev) => {
      // Don't duplicate the immediate previous entry
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
    
    // Pick a new index: either increment or shuffle again
    setCurrentTrackIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= tracks.length) {
        // reshuffle to keep it fresh
        const reshuffled = shuffleArray(tracks);
        setTracks(reshuffled);
        return 0;
      }
      return nextIndex;
    });
    setIsPlaying(true);
  }, [tracks, currentTrack, addToHistory]);

  // Play a specific track directly
  const playTrackDirectly = (track: RadioTrack) => {
    const idx = tracks.findIndex((t) => t.url === track.url);
    if (idx !== -1) {
      if (currentTrack) {
        addToHistory(currentTrack);
      }
      setCurrentTrackIndex(idx);
      setIsPlaying(true);
    }
  };

  // Sync state to HTML5 Audio Element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.log("Audio autoplay block or failure:", err);
        setIsPlaying(false);
      });
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
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadedMetadata={(e) => {
              setDuration(formatTime(e.currentTarget.duration));
            }}
            onTimeUpdate={(e) => {
              setCurrentTime(formatTime(e.currentTarget.currentTime));
              if (e.currentTarget.duration) {
                setProgress((e.currentTarget.currentTime / e.currentTarget.duration) * 100);
              }
            }}
            onEnded={handleNext}
            onError={(e) => {
              console.log("Audio stream error, skipping...", e);
              handleNext();
            }}
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
                    src={currentTrack.albumImage}
                    alt={currentTrack.albumName}
                    className={`now-playing-cover ${isPlaying ? "playing" : ""}`}
                  />
                  <div className="now-playing-glow"></div>
                </div>

                <div className="now-playing-details">
                  <span className="track-album-subtitle">Album: {currentTrack.albumName}</span>
                  <h2 className="track-title-large">{currentTrack.name}</h2>
                  
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
          transition: transform 0.5s ease;
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
