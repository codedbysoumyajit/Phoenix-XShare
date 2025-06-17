document.addEventListener('DOMContentLoaded', () => {
  const downloadLink = document.getElementById('downloadLink');
  const errorElement = document.getElementById('Error');

  // Ensure error message is hidden by default
  if (errorElement) {
    errorElement.classList.add('hidden');
  }

  if (downloadLink) {
    downloadLink.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent the default link behavior

        const fileName = downloadLink.getAttribute('data-file-name'); // Corrected attribute name

        // Make a GET request to download the file
        try {
            const response = await fetch(`/cdn/${fileName}`);

            if (response.ok) {
                // If successful, trigger native browser download or open in new tab
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = fileName; // Suggest filename for download
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url); // Clean up the URL object

                // Hide any previous error message
                if (errorElement) {
                    errorElement.classList.add('hidden');
                    errorElement.textContent = ''; // Clear text
                }
            } else {
                // Form submission failed, display the error message from the response
                const errorData = await response.text();
                if (errorElement) {
                    errorElement.textContent = `Error: ${errorData || 'File not found or access denied.'}`;
                    errorElement.classList.remove('hidden');
                }
                console.error('Download failed:', response.status, response.statusText);
            }
        } catch (error) {
            // Handle any network or other errors
            console.error('Network or client error during download:', error);
            if (errorElement) {
                errorElement.textContent = 'An error occurred during download. Please try again.';
                errorElement.classList.remove('hidden');
            }
        }
    });
  } else {
    console.warn("Download link element not found on the page.");
  }
});
