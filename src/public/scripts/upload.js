// Helper function to get CSS variable values
function varCssValue(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

// Helper function to format bytes for display
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Function to attach handlers for dynamically loaded content (share/download buttons)
// This function needs to be exported if it's called from other modules/dynamic content.
export function attachLinkHandlers() {
    const shareBtn = document.getElementById('shareButton');
    if (shareBtn) {
        shareBtn.onclick = () => {
            const link = shareBtn.getAttribute('data-download-link');
            shareOrCopyLink(link, shareBtn, "<i class='bi bi-share-fill'></i> Share Download Link");
        };
    }

    const viewBtn = document.getElementById('viewButton');
    if (viewBtn) {
        viewBtn.onclick = () => {
            const link = viewBtn.getAttribute('data-view-link');
            shareOrCopyLink(link, viewBtn, "<i class='bi bi-eye-fill'></i> View Link");
        };
    }

    const cdnBtn = document.getElementById('cdnButton');
    if (cdnBtn) {
        cdnBtn.onclick = () => {
            const link = cdnBtn.getAttribute('data-cdn-link');
            shareOrCopyLink(link, cdnBtn, "<i class='bi bi-code-slash'></i> CDN Link");
        };
    }
}

// Function to handle sharing or copying link
// This function needs to be exported if it's called from other modules.
export function shareOrCopyLink(link, button, defaultHtml) {
    if (!link) {
        alert("Link is missing!");
        return;
    }

    if (navigator.canShare && navigator.canShare({ url: link })) {
        navigator.share({
            url: link,
            title: 'Phoenix XShare',
        }).catch((error) => {
            console.error('Share failed:', error);
        });
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        button.innerHTML = "<i class='bi bi-clipboard-check-fill'></i> Copied!";
        setTimeout(() => {
            button.innerHTML = defaultHtml;
        }, 2000);
    }
}


// Main logic for the upload page
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const fileSelectionArea = document.getElementById('fileSelectionArea');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const dragDropText = fileSelectionArea.querySelector('.drag-drop-text');

    const progressBarContainer = document.getElementById('progressBarContainer');
    const progressBar = document.getElementById('progressBar');
    const progressMessage = document.getElementById('progressMessage');
    const uploadStatus = document.getElementById('uploadStatus');
    const mainContainer = document.getElementById('mainContainer'); // Assuming this is the main content wrapper

    // Initial state: hide progress bar and file name display
    progressBarContainer.classList.add('hidden');
    fileNameDisplay.classList.add('hidden');

    // Update file name display when a file is chosen
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name;
            fileNameDisplay.classList.remove('hidden'); // Show file name
            dragDropText.classList.add('hidden'); // Hide "Drag & Drop" text
        } else {
            fileNameDisplay.textContent = "No file chosen";
            fileNameDisplay.classList.add('hidden'); // Hide file name
            dragDropText.classList.remove('hidden'); // Show "Drag & Drop" text
        }
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (fileInput.files.length === 0) {
            alert("Please select a file to upload.");
            return;
        }

        // --- Show Progress Bar, Hide Form ---
        form.classList.add('hidden'); // Hide the upload form
        progressBarContainer.classList.remove('hidden'); // Show the progress bar container

        // Reset progress bar state
        progressBar.style.width = '0%';
        progressBar.style.backgroundColor = varCssValue('--md-sys-color-primary'); // Reset color in case of previous error
        progressMessage.textContent = 'Preparing upload...';
        uploadStatus.textContent = ''; // Clear previous status

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        // Using XMLHttpRequest for progress tracking
        const xhr = new XMLHttpRequest();

        xhr.open('POST', '/upload', true); // 'true' for asynchronous

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                progressBar.style.width = percentComplete + '%';
                progressMessage.textContent = `Uploading: ${Math.round(percentComplete)}%`;
                uploadStatus.textContent = `Uploaded ${formatBytes(event.loaded)} of ${formatBytes(event.total)}`;
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) { // Check for success status codes
                progressBar.style.width = '100%';
                progressMessage.textContent = 'Upload Complete!';
                uploadStatus.textContent = 'File uploaded successfully.';

                // Replace the entire main container's content with the server response
                // This assumes your server responds with the HTML for the "uploaded" page.
                if (mainContainer) {
                    mainContainer.innerHTML = xhr.responseText;
                    // Important: Since mainContainer's content is replaced,
                    // event listeners (like for share/view/cdn buttons) need to be reattached.
                    // This attachLinkHandlers is for those new elements.
                    attachLinkHandlers();
                } else {
                    console.error("mainContainer not found to update content.");
                    // Fallback, if mainContainer replacement isn't the desired behavior.
                    // You might just show success message and hide progress bar here.
                }

            } else {
                // Handle server-side errors (e.g., 500, 404)
                progressMessage.textContent = 'Upload Failed!';
                uploadStatus.textContent = `Error: ${xhr.status} - ${xhr.statusText || 'Upload failed'}`;
                progressBar.style.backgroundColor = varCssValue('--md-sys-color-error'); // Red for error
                setTimeout(() => {
                    progressBarContainer.classList.add('hidden');
                    form.classList.remove('hidden');
                    // Reset styling on error
                    progressBar.style.backgroundColor = varCssValue('--md-sys-color-primary');
                    fileNameDisplay.textContent = "No file chosen";
                    fileNameDisplay.classList.add('hidden'); // Hide filename display
                    dragDropText.classList.remove('hidden'); // Show drag drop text
                    fileInput.value = ''; // Clear file input
                }, 3000); // Show error for 3 seconds, then revert
            }
        };

        xhr.onerror = () => {
            // Handle network errors (e.g., no internet connection)
            progressMessage.textContent = 'Network Error!';
            uploadStatus.textContent = 'Please check your internet connection.';
            progressBar.style.backgroundColor = varCssValue('--md-sys-color-error'); // Red for error
            setTimeout(() => {
                progressBarContainer.classList.add('hidden');
                form.classList.remove('hidden');
                progressBar.style.backgroundColor = varCssValue('--md-sys-color-primary');
                fileNameDisplay.textContent = "No file chosen";
                fileNameDisplay.classList.add('hidden'); // Hide filename display
                dragDropText.classList.remove('hidden'); // Show drag drop text
                fileInput.value = '';
            }, 3000);
        };

        xhr.send(formData);
    });

    // Drag & Drop functionality for the new fileSelectionArea
    fileSelectionArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        fileSelectionArea.classList.add('dragging');
    });

    fileSelectionArea.addEventListener('dragleave', () => {
        fileSelectionArea.classList.remove('dragging');
    });

    fileSelectionArea.addEventListener('drop', (event) => {
        event.preventDefault();
        fileSelectionArea.classList.remove('dragging');
        if (event.dataTransfer.files.length > 0) {
            fileInput.files = event.dataTransfer.files;
            fileNameDisplay.textContent = fileInput.files[0].name; // Update display
            fileNameDisplay.classList.remove('hidden'); // Show filename
            dragDropText.classList.add('hidden'); // Hide drag drop text
        }
    });

    // Initial attachment of handlers in case dynamic content exists on first load
    // This assumes the initial page load might already contain elements needing handlers.
    attachLinkHandlers();
});
