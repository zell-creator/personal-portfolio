// Open a full-size image when a client product is selected.
const imageViewer = document.querySelector('.image-viewer');
const imageViewerImage = document.querySelector('.image-viewer-img');
const imageViewerCaption = document.querySelector('.image-viewer-caption');

document.querySelectorAll('.product-image-link').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();

    const previewImage = link.querySelector('img');
    imageViewerImage.src = link.href;
    imageViewerImage.alt = previewImage.alt;
    imageViewerCaption.textContent = previewImage.alt;
    imageViewer.showModal();
  });
});

document.querySelector('.image-viewer-close').addEventListener('click', () => {
  imageViewer.close();
});

imageViewer.addEventListener('click', (event) => {
  if (event.target === imageViewer) imageViewer.close();
});
