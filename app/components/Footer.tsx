import { FaFacebook, FaInstagram, FaTiktok, FaYoutube, FaSpotify } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer>
      <div className="social-links">
        <a href="https://www.facebook.com/cravencalm" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <FaFacebook size={24} />
        </a>
        <a href="https://www.instagram.com/craven_calm" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <FaInstagram size={24} />
        </a>
        <a href="https://www.tiktok.com/@cravencalm" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
          <FaTiktok size={24} />
        </a>
        <a href="https://www.youtube.com/@cravencalm" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
          <FaYoutube size={24} />
        </a>
        <a href="https://open.spotify.com/artist/4FpDnKrTaERTj08P4hIBNW?si=HroDHVcOS5SXFnTcNQ5cAA" target="_blank" rel="noopener noreferrer" aria-label="Spotify">
          <FaSpotify size={24} />
        </a>
      </div>
      <p>&copy; 2026 Craven Calm. All rights reserved.</p>
    </footer>
  );
}
