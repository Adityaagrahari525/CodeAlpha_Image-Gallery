const imageGallery = document.querySelector(".image-gallery");
const imagePicker = document.getElementById("imagePicker");
const addImagesButton = document.getElementById("addImagesButton");
const imageCount = document.getElementById("imageCount");
const galleryStatus = document.getElementById("galleryStatus");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const imageCaption = document.getElementById("imageCaption");
const imageCounter = document.getElementById("imageCounter");
const closeButton = document.querySelector(".lightbox-close");
let activeIndex = 0;

function getGalleryItems() {
    return Array.from(imageGallery.querySelectorAll(".gallery-item"));
}

function updateGalleryDetails() {
    const items = getGalleryItems();
    imageCount.textContent = items.length;

    items.forEach((item, index) => {
        item.dataset.index = index;
        item.setAttribute("aria-label", `View image ${index + 1}`);
        item.querySelector(".image-index").textContent = String(index + 1).padStart(2, "0");
        item.parentElement.querySelector(".delete-image-button").setAttribute("aria-label", `Remove image ${index + 1} from gallery`);
    });
}

function showImage(index) {
    const items = getGalleryItems();
    if (items.length === 0) return;

    activeIndex = (index + items.length) % items.length;
    const selectedImage = items[activeIndex].querySelector("img");
    lightboxImage.src = selectedImage.src;
    lightboxImage.alt = selectedImage.alt;
    imageCaption.textContent = selectedImage.dataset.caption || selectedImage.alt;
    imageCounter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
}

function openLightbox(index) {
    showImage(index);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    closeButton.focus();
}

function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    getGalleryItems()[activeIndex]?.focus();
}

function removeImage(deleteButton) {
    const card = deleteButton.closest(".gallery-card");
    const items = getGalleryItems();
    const removedIndex = items.indexOf(card.querySelector(".gallery-item"));
    const image = card.querySelector("img");

    if (image.src.startsWith("blob:")) URL.revokeObjectURL(image.src);
    card.remove();
    updateGalleryDetails();
    galleryStatus.textContent = "Image removed from the gallery.";

    const remainingItems = getGalleryItems();
    const nextItem = remainingItems[Math.min(removedIndex, remainingItems.length - 1)];
    if (nextItem) nextItem.focus();
    else addImagesButton.focus();
}

function addImages(files) {
    const selectedFiles = Array.from(files);
    const imageFiles = selectedFiles.filter((file) => file.type.startsWith("image/"));
    const rejectedCount = selectedFiles.length - imageFiles.length;

    imageFiles.forEach((file) => {
        const imageUrl = URL.createObjectURL(file);
        const imageName = file.name.replace(/\.[^/.]+$/, "") || "Uploaded image";
        const card = document.createElement("div");
        const item = document.createElement("button");
        const image = document.createElement("img");
        const index = document.createElement("span");
        const deleteButton = document.createElement("button");

        card.className = "gallery-card";
        item.className = "gallery-item";
        item.type = "button";
        item.setAttribute("aria-label", "View image");
        image.src = imageUrl;
        image.alt = imageName;
        image.dataset.caption = imageName;
        image.loading = "lazy";
        index.className = "image-index";
        item.append(image, index);
        deleteButton.className = "delete-image-button";
        deleteButton.type = "button";
        deleteButton.setAttribute("aria-label", "Remove image from gallery");
        deleteButton.title = "Remove image";
        deleteButton.textContent = "\u00d7";
        card.append(item, deleteButton);
        imageGallery.append(card);
    });

    if (imageFiles.length > 0) {
        const addedLabel = `${imageFiles.length} image${imageFiles.length === 1 ? "" : "s"} added`;
        const rejectedLabel = rejectedCount > 0 ? `; ${rejectedCount} non-image file${rejectedCount === 1 ? "" : "s"} skipped` : "";
        galleryStatus.textContent = `${addedLabel}${rejectedLabel}.`;
        updateGalleryDetails();
    } else if (rejectedCount > 0) {
        galleryStatus.textContent = "No images were added. Choose image files to continue.";
    }
}

addImagesButton.addEventListener("click", () => imagePicker.click());
imagePicker.addEventListener("change", () => {
    addImages(imagePicker.files);
    imagePicker.value = "";
});

imageGallery.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".delete-image-button");
    if (deleteButton) {
        removeImage(deleteButton);
        return;
    }

    const item = event.target.closest(".gallery-item");
    if (item) openLightbox(Number(item.dataset.index));
});

closeButton.addEventListener("click", closeLightbox);
document.querySelector(".lightbox-previous").addEventListener("click", () => showImage(activeIndex - 1));
document.querySelector(".lightbox-next").addEventListener("click", () => showImage(activeIndex + 1));

lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showImage(activeIndex - 1);
    if (event.key === "ArrowRight") showImage(activeIndex + 1);
});

updateGalleryDetails();