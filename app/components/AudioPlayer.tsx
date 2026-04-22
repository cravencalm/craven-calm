"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Track {
  name: string;
  url: string;
  duration?: string;
}

interface AudioPlayerProps {
  src?: string; // Fallback for single track
  tracks?: Track[]; // New multi-track support
}

export default function AudioPlayer({ src, tracks = [] }: AudioPlayerProps) {
  // Normalize tracks: if only src is provided, wrap it in a track object
  const playlist: Track[] = tracks.length > 0 ? tracks : src ? [{ name: "Preview", url: src }] : [];
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [showTracklist, setShowTracklist] = useState(false);

  const currentTrack = playlist[currentTrackIndex];

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const playTrack = useCallback((index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  }, []);

  const handleNext = useCallback(() => {
    if (currentTrackIndex < playlist.length - 1) {
      playTrack(currentTrackIndex + 1);
    } else {
      // Loop back to start or just stop
      playTrack(0);
    }
  }, [currentTrackIndex, playlist, playTrack]);

  const handlePrev = useCallback(() => {
    if (currentTrackIndex > 0) {
      playTrack(currentTrackIndex - 1);
    } else {
      playTrack(playlist.length - 1);
    }
  }, [currentTrackIndex, playlist, playTrack]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(err => console.log("Playback error:", err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex, currentTrack?.url]);

  const handleEnded = useCallback(() => {
    if (currentTrackIndex < playlist.length - 1) {
      handleNext();
    } else {
      setIsPlaying(false);
    }
  }, [currentTrackIndex, playlist.length, handleNext]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = clickX / width;
    audio.currentTime = percent * audio.duration;
    setProgress(percent * 100);
  };

  if (playlist.length === 0) return null;

  return (
    <div className="audio-player-container">
      <audio 
        ref={audioRef}
        src={currentTrack?.url}
        onLoadedMetadata={(e) => {
          setDuration(formatTime(e.currentTarget.duration));
          setCurrentTime(formatTime(e.currentTarget.currentTime));
        }}
        onTimeUpdate={(e) => {
          setCurrentTime(formatTime(e.currentTarget.currentTime));
          if (e.currentTarget.duration) {
            setProgress((e.currentTarget.currentTime / e.currentTarget.duration) * 100);
          }
        }}
        onEnded={handleEnded}
        onError={(e) => console.log("Audio error:", e)}
      />
      <div className="audio-player">
        <div className="player-controls">
          <button className="nav-btn" onClick={handlePrev} title="Previous Track" disabled={playlist.length <= 1}>
            ⏮
          </button>
          <button className="play-btn" onClick={togglePlayPause}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button className="nav-btn" onClick={handleNext} title="Next Track" disabled={playlist.length <= 1}>
            ⏭
          </button>
        </div>
        
        <div className="player-main">
          <div className="track-info-mini">
            <span className="current-track-name">{currentTrack.name}</span>
          </div>
          <div className="progress-container" onClick={handleProgressClick}>
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="time-display">
            {currentTime} / {duration}
          </div>
        </div>

        {playlist.length > 1 && (
          <button 
            className={`tracklist-toggle ${showTracklist ? "active" : ""}`}
            onClick={() => setShowTracklist(!showTracklist)}
          >
            {showTracklist ? "Close Tracks" : "View Tracks"}
          </button>
        )}
      </div>

      {showTracklist && playlist.length > 1 && (
        <div className="tracklist-dropdown">
          {playlist.map((track, idx) => (
            <div 
              key={idx} 
              className={`tracklist-item ${idx === currentTrackIndex ? "active" : ""}`}
              onClick={() => playTrack(idx)}
            >
              <span className="track-number">{idx + 1}</span>
              <span className="track-name">{track.name}</span>
              {idx === currentTrackIndex && isPlaying && <span className="playing-indicator">vol...</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
