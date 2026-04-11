document.addEventListener('DOMContentLoaded', () => {

    // --- Audio Player Logic ---
    const players = document.querySelectorAll('.audio-player');
    
    // Create actual Audio objects for each player
    const audioObjects = new Map();
    // Keep track of currently playing audio to pause it if another starts
    let currentlyPlaying = null;

    players.forEach(player => {
        const src = player.getAttribute('data-src');
        const audio = new Audio(src);
        audioObjects.set(player, audio);

        const playBtn = player.querySelector('.play-btn');
        const progressBar = player.querySelector('.progress-bar');
        const progressContainer = player.querySelector('.progress-container');
        const timeDisplay = player.querySelector('.time-display');

        // Formats seconds into M:SS
        const formatTime = (secs) => {
            if (isNaN(secs)) return '0:00';
            const m = Math.floor(secs / 60);
            const s = Math.floor(secs % 60);
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        };

        const updateTimeDisplay = () => {
            const current = audio.currentTime || 0;
            const duration = (!isNaN(audio.duration) && audio.duration !== Infinity) ? audio.duration : 0;
            timeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
        };

        // When audio metadata is loaded
        audio.addEventListener('loadedmetadata', updateTimeDisplay);
        
        // When audio plays/pauses, update button icon
        audio.addEventListener('play', () => { playBtn.textContent = '⏸'; });
        audio.addEventListener('pause', () => { playBtn.textContent = '▶'; });
        
        // Update progress bar as audio plays
        audio.addEventListener('timeupdate', () => {
            if(audio.duration) {
                const percent = (audio.currentTime / audio.duration) * 100;
                progressBar.style.width = `${percent}%`;
            }
            updateTimeDisplay();
        });

        // Click progress bar to seek
        progressContainer.addEventListener('click', (e) => {
            if(audio.duration) {
                const rect = progressContainer.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;
                const percent = clickX / width;
                audio.currentTime = percent * audio.duration;
            }
        });

        // Play/Pause button click
        playBtn.addEventListener('click', () => {
            if(audio.paused) {
                // Pause currently playing if it's not this one
                if(currentlyPlaying && currentlyPlaying !== audio) {
                    currentlyPlaying.pause();
                }
                audio.play();
                currentlyPlaying = audio;
            } else {
                audio.pause();
                currentlyPlaying = null;
            }
        });
    });

    // --- Mock Stripe Checkout Logic ---
    const buyBtns = document.querySelectorAll('.stripe-buy');
    buyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.getAttribute('data-product');
            // This is where you would put your actual Stripe Payment Link
            // e.g. window.location.href = `https://buy.stripe.com/abc123xyz`;
            alert(`Mock Stripe Checkout Initialized for: ${productId}\n\nIn production, this would redirect to your Stripe Payment Link where the user can check out with Apple/Google Pay or their card, without needing an account.`);
        });
    });

    // Initial time display update just in case metadata loads instantly
    players.forEach(player => {
        const audio = audioObjects.get(player);
        if(audio.readyState >= 1) { // HAVE_METADATA or greater
            const timeDisplay = player.querySelector('.time-display');
            const duration = (!isNaN(audio.duration) && audio.duration !== Infinity) ? audio.duration : 0;
            const current = audio.currentTime || 0;
            const mDur = Math.floor(duration / 60);
            const sDur = Math.floor(duration % 60);
            const durStr = `${mDur}:${sDur < 10 ? '0' : ''}${sDur}`;
            timeDisplay.textContent = `0:00 / ${durStr}`;
        }
    });

    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Change icon to 'X' when open
            menuToggle.innerHTML = navLinks.classList.contains('active') ? '&times;' : '&#9776;';
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                if (menuToggle) menuToggle.innerHTML = '&#9776;';
            });
        });
    }
});
