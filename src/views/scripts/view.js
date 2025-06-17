document.addEventListener('DOMContentLoaded', () => {
    const mediaDisplayArea = document.querySelector('.media-display-area');
    const filenameDisplay = document.querySelector('.filename-display');
    const loadingSpinnerArea = document.querySelector('.loading-spinner-area');

    const fileName = filenameDisplay ? filenameDisplay.dataset.fileName : '';
    const apiLink = mediaDisplayArea ? mediaDisplayArea.dataset.apiLink : '';

    console.log('view.js loaded.');
    console.log('File Name from HTML:', fileName);
    console.log('API Link from HTML:', apiLink);

    if (!mediaDisplayArea || !fileName || !apiLink) {
        console.error("Missing essential elements or data for media viewer. Aborting.");
        if (mediaDisplayArea) {
             mediaDisplayArea.innerHTML = `
                <div class="media-unsupported" style="color: var(--md-sys-color-error);">
                    <i class="bi bi-x-circle-fill unsupported-icon"></i>
                    <p>Viewer data missing. Cannot display preview.</p>
                </div>
            `;
            mediaDisplayArea.style.minHeight = '100px';
            mediaDisplayArea.style.maxHeight = 'unset';
        }
        return;
    }

    const fileExtension = fileName.split('.').pop().toLowerCase();
    let mediaElement = null;
    let typeDetected = false;

    if (loadingSpinnerArea) {
        loadingSpinnerArea.style.display = 'none'; // Hide initial spinner
    }

    // --- Function to update meta tags ---
    const updateMetaTags = (type, contentUrl, contentType = '', width = '', height = '') => {
        // Clear previous video tags if switching to image, or vice versa
        const ogImageMeta = document.getElementById('ogImageMeta');
        const twitterImageMeta = document.getElementById('twitterImageMeta');
        const ogVideoMeta = document.getElementById('ogVideoMeta');
        const ogVideoType = document.getElementById('ogVideoType');
        const twitterPlayerMeta = document.getElementById('twitterPlayerMeta');
        const twitterCard = document.getElementById('twitterCard');

        // Clear all previous video/image content
        if (ogImageMeta) ogImageMeta.content = '';
        if (twitterImageMeta) twitterImageMeta.content = '';
        if (ogVideoMeta) ogVideoMeta.content = '';
        if (ogVideoType) ogVideoType.content = '';
        if (twitterPlayerMeta) twitterPlayerMeta.content = '';

        if (type === 'image') {
            if (ogImageMeta) ogImageMeta.content = contentUrl;
            if (twitterImageMeta) twitterImageMeta.content = contentUrl;
            if (twitterCard) twitterCard.content = 'summary_large_image'; // Default for images
            console.log('Meta tags updated for image:', contentUrl);
        } else if (type === 'video') {
            if (ogVideoMeta) ogVideoMeta.content = contentUrl;
            if (ogVideoType) ogVideoType.content = contentType; // e.g., video/mp4
            if (twitterPlayerMeta) twitterPlayerMeta.content = contentUrl; // Often direct URL or embed route
            if (twitterCard) twitterCard.content = 'player'; // For video players
            console.log('Meta tags updated for video:', contentUrl, contentType);
        }
        // You might need to set width/height based on actual media dimensions for crawlers,
        // but that's harder without server-side knowledge or pre-analysis.
        // For now, use placeholder dimensions from EJS or set a default.
        if (width && document.getElementById('ogImageWidth')) document.getElementById('ogImageWidth').content = width;
        if (height && document.getElementById('ogImageHeight')) document.getElementById('ogImageHeight').content = height;
        if (width && document.getElementById('ogVideoWidth')) document.getElementById('ogVideoWidth').content = width;
        if (height && document.getElementById('ogVideoHeight')) document.getElementById('ogVideoHeight').content = height;
        if (width && document.getElementById('twitterImageWidth')) document.getElementById('twitterImageWidth').content = width;
        if (height && document.getElementById('twitterImageHeight')) document.getElementById('twitterImageHeight').content = height;
        if (width && document.getElementById('twitterPlayerWidth')) document.getElementById('twitterPlayerWidth').content = width;
        if (height && document.getElementById('twitterPlayerHeight')) document.getElementById('twitterPlayerHeight').content = height;
    };

    // Function to handle media loading errors
    const handleMediaError = (element, specificMessage = 'Unknown error') => {
        console.error(`Error loading media resource for ${fileName}: ${element.src}. Message: ${specificMessage}`);
        mediaDisplayArea.innerHTML = `
            <div class="media-unsupported">
                <i class="bi bi-exclamation-triangle-fill unsupported-icon" style="color: var(--md-sys-color-error);"></i>
                <p>Could not load preview.</p>
                <p>Possible issues: File missing, server error, or browser security settings (CORS).</p>
                <p>Error details: ${specificMessage}</p>
                <p>Please use the download button to access the file.</p>
            </div>
        `;
        mediaDisplayArea.style.minHeight = '150px';
        mediaDisplayArea.style.maxHeight = 'unset';
        mediaDisplayArea.style.justifyContent = 'center';
        mediaDisplayArea.style.alignItems = 'center';
        mediaDisplayArea.style.flexDirection = 'column';
    };

    // Determine media type and create element
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension)) {
        mediaElement = document.createElement('img');
        mediaElement.className = 'media-content image-viewer';
        mediaElement.src = apiLink;
        mediaElement.alt = 'Image File';
        mediaElement.onload = () => {
            console.log('Image loaded successfully.');
            // Only update meta if image loads
            updateMetaTags('image', apiLink); // Width/Height could be retrieved here if image is loaded, but unreliable for crawlers
        };
        mediaElement.addEventListener('error', () => handleMediaError(mediaElement, 'Image load failed.'));
        typeDetected = true;
    } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) { // Video formats
        mediaElement = document.createElement('video');
        mediaElement.className = 'media-content video-viewer';
        mediaElement.src = apiLink;
        mediaElement.controls = true;
        mediaElement.autoplay = true;
        mediaElement.muted = true;
        mediaElement.setAttribute('playsinline', '');
        mediaElement.addEventListener('loadeddata', () => {
            console.log('Video loaded successfully (at least some data).');
            // Only update meta if video loads
            updateMetaTags('video', apiLink, `video/${fileExtension}`);
        });
        mediaElement.addEventListener('error', (e) => handleMediaError(mediaElement, `Video error: ${e.message || 'Unknown'}`));
        typeDetected = true;
    } else if (['mp3', 'wav', 'aac', 'ogg', 'flac'].includes(fileExtension)) { // Audio formats
        mediaElement = document.createElement('audio');
        mediaElement.className = 'media-content audio-viewer';
        mediaElement.src = apiLink;
        mediaElement.controls = true;
        mediaElement.autoplay = true;
        mediaElement.addEventListener('loadeddata', () => {
            console.log('Audio loaded successfully (at least some data).');
        });
        mediaElement.addEventListener('error', (e) => handleMediaError(mediaElement, `Audio error: ${e.message || 'Unknown'}`));
        // Audio doesn't typically have og:video or og:image unless it's a "visualized" audio or album art
        typeDetected = true;
    } else if (['txt', 'md', 'log', 'json', 'html', 'css', 'js', 'xml', 'pdf'].includes(fileExtension)) { // Text/Document formats
        mediaElement = document.createElement('iframe');
        mediaElement.className = 'media-content text-viewer';
        mediaElement.src = apiLink;
        mediaElement.frameBorder = '0';
        mediaElement.addEventListener('load', () => {
            console.log('Iframe content attempted to load.');
            // No specific OG/Twitter tag update for generic text/PDF
        });
        mediaElement.addEventListener('error', (e) => handleMediaError(mediaElement, `Iframe error: ${e.message || 'Unknown'}`));
        typeDetected = true;
    }

    if (typeDetected && mediaElement) {
        mediaDisplayArea.innerHTML = ''; // Clear loading spinner
        mediaDisplayArea.appendChild(mediaElement);
        mediaElement.style.display = 'block';

        mediaDisplayArea.style.flexDirection = 'row';
        mediaDisplayArea.style.justifyContent = 'center';
        mediaDisplayArea.style.alignItems = 'center';

    } else {
        console.warn(`No specific viewer found for .${fileExtension} or type not detected. Displaying fallback.`);
        mediaDisplayArea.innerHTML = `
            <div class="media-unsupported">
                <i class="bi bi-file-earmark-fill unsupported-icon"></i>
                <p>File type not directly viewable in browser.</p>
                <p>Please use the download button.</p>
            </div>
        `;
        mediaDisplayArea.style.minHeight = '150px';
        mediaDisplayArea.style.maxHeight = 'unset';
        mediaDisplayArea.style.justifyContent = 'center';
        mediaDisplayArea.style.alignItems = 'center';
        mediaDisplayArea.style.flexDirection = 'column';
    }
});
