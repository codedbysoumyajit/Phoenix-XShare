document.addEventListener('DOMContentLoaded', () => {
  // Upload form submission
  const form = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');
  const loading = document.getElementById('loading');
  const dragDropArea = document.getElementById('dragDropArea');
  const container = document.getElementById('container');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    loading.textContent = "File uploading is under progress.... Please don't close or refresh the tab";

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    fetch('/upload', {
      method: 'POST',
      body: formData
    })
      .then(response => response.text())
      .then(data => {
        container.innerHTML = data;
        form.reset();
        attachLinkHandlers(); // Reattach button handlers after dynamic content update
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });

  // Drag & Drop
  dragDropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dragDropArea.classList.add('dragging');
  });

  dragDropArea.addEventListener('dragleave', () => {
    dragDropArea.classList.remove('dragging');
  });

  dragDropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dragDropArea.classList.remove('dragging');
    fileInput.files = event.dataTransfer.files;
  });

  // Setup initial handlers
  attachLinkHandlers();
});

function attachLinkHandlers() {
  // Share / Download Link
  const shareBtn = document.getElementById('shareButton');
  if (shareBtn) {
    shareBtn.onclick = () => {
      const link = shareBtn.getAttribute('data-download-link');
      shareOrCopyLink(link, shareBtn, "Download Link");
    };
  }

  // View Link
  const viewBtn = document.getElementById('viewButton');
  if (viewBtn) {
    viewBtn.onclick = () => {
      const link = viewBtn.getAttribute('data-view-link');
      shareOrCopyLink(link, viewBtn, "View Link");
    };
  }

  // CDN Link
  const cdnBtn = document.getElementById('cdnButton');
  if (cdnBtn) {
    cdnBtn.onclick = () => {
      const link = cdnBtn.getAttribute('data-cdn-link');
      shareOrCopyLink(link, cdnBtn, "CDN Link");
    };
  }
}

function shareOrCopyLink(link, button, defaultText) {
  if (!link) {
    alert("Link is missing!");
    return;
  }

  if (navigator.canShare && navigator.canShare({ url: link })) {
    navigator.share({
      url: link,
      title: 'Phoenix XShare',
    });
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = link;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    button.textContent = "Link Copied!";
    setTimeout(() => {
      button.textContent = defaultText;
    }, 3000);
  }
}