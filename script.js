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
    return imageGallery.querySelectorAll(".gallery-item");
}

function formatNumber(number) {
    if (number < 10) {
        return "0" + number;
    }

    return String(number);
}

function updateGalleryDetails() {
    const items = getGalleryItems();
    imageCount.textContent = items.length;

    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        const deleteButton = item.parentElement.querySelector(".delete-image-button");
        const imageNumber = index + 1;

        item.setAttribute("data-index", index);
        item.setAttribute("aria-label", "View image " + imageNumber);
        item.querySelector(".image-index").textContent = formatNumber(imageNumber);
        deleteButton.setAttribute("aria-label", "Remove image " + imageNumber + " from gallery");
    }
}

function showImage(index) {
    const items = getGalleryItems();

    if (items.length === 0) {
        return;
    }

    if (index < 0) {
        activeIndex = items.length - 1;
    } else if (index >= items.length) {
        activeIndex = 0;
    } else {
        activeIndex = index;
    }

    const selectedImage = items[activeIndex].querySelector("img");
    lightboxImage.src = selectedImage.src;
    lightboxImage.alt = selectedImage.alt;

    if (selectedImage.getAttribute("data-caption")) {
        imageCaption.textContent = selectedImage.getAttribute("data-caption");
    } else {
        imageCaption.textContent = selectedImage.alt;
    }

    imageCounter.textContent =
        formatNumber(activeIndex + 1) + " / " + formatNumber(items.length);
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

    const items = getGalleryItems();
    if (items[activeIndex]) {
        items[activeIndex].focus();
    }
}

function removeImage(deleteButton) {
    const card = deleteButton.closest(".gallery-card");
    const imageItem = card.querySelector(".gallery-item");
    const items = getGalleryItems();
    const removedIndex = Array.prototype.indexOf.call(items, imageItem);
    const image = card.querySelector("img");

    if (image.src.indexOf("blob:") === 0) {
        URL.revokeObjectURL(image.src);
    }

    card.remove();
    updateGalleryDetails();
    galleryStatus.textContent = "Image removed from the gallery.";

    const remainingItems = getGalleryItems();
    let nextIndex = removedIndex;

    if (nextIndex >= remainingItems.length) {
        nextIndex = remainingItems.length - 1;
    }

    if (remainingItems[nextIndex]) {
        remainingItems[nextIndex].focus();
    } else {
        addImagesButton.focus();
    }
}

function addImage(file) {
    const imageUrl = URL.createObjectURL(file);
    const dotIndex = file.name.lastIndexOf(".");
    let imageName = file.name;

    if (dotIndex > 0) {
        imageName = file.name.substring(0, dotIndex);
    }

    if (imageName === "") {
        imageName = "Uploaded image";
    }

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
    image.setAttribute("data-caption", imageName);
    image.loading = "lazy";

    index.className = "image-index";
    item.appendChild(image);
    item.appendChild(index);

    deleteButton.className = "delete-image-button";
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", "Remove image from gallery");
    deleteButton.title = "Remove image";
    deleteButton.textContent = "\u00d7";

    card.appendChild(item);
    card.appendChild(deleteButton);
    imageGallery.appendChild(card);
}

function addImages(files) {
    let addedCount = 0;
    let rejectedCount = 0;

    for (let index = 0; index < files.length; index++) {
        const file = files[index];

        if (file.type.indexOf("image/") === 0) {
            addImage(file);
            addedCount++;
        } else {
            rejectedCount++;
        }
    }

    if (addedCount > 0) {
        let statusMessage = addedCount + " image";

        if (addedCount !== 1) {
            statusMessage += "s";
        }

        statusMessage += " added";

        if (rejectedCount > 0) {
            statusMessage += "; " + rejectedCount + " non-image file";

            if (rejectedCount !== 1) {
                statusMessage += "s";
            }

            statusMessage += " skipped";
        }

        galleryStatus.textContent = statusMessage + ".";
        updateGalleryDetails();
    } else if (rejectedCount > 0) {
        galleryStatus.textContent = "No images were added. Choose image files to continue.";
    }
}

function handleImagePickerChange() {
    addImages(imagePicker.files);
    imagePicker.value = "";
}

function handleGalleryClick(event) {
    const deleteButton = event.target.closest(".delete-image-button");

    if (deleteButton) {
        removeImage(deleteButton);
        return;
    }

    const item = event.target.closest(".gallery-item");

    if (item) {
        openLightbox(Number(item.getAttribute("data-index")));
    }
}

function handleLightboxClick(event) {
    if (event.target === lightbox) {
        closeLightbox();
    }
}

function handleKeydown(event) {
    if (!lightbox.classList.contains("is-open")) {
        return;
    }

    if (event.key === "Escape") {
        closeLightbox();
    } else if (event.key === "ArrowLeft") {
        showImage(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
        showImage(activeIndex + 1);
    }
}

function showPreviousImage() {
    showImage(activeIndex - 1);
}

function showNextImage() {
    showImage(activeIndex + 1);
}

addImagesButton.addEventListener("click", function () {
    imagePicker.click();
});

imagePicker.addEventListener("change", handleImagePickerChange);
imageGallery.addEventListener("click", handleGalleryClick);
closeButton.addEventListener("click", closeLightbox);
document.querySelector(".lightbox-previous").addEventListener("click", showPreviousImage);
document.querySelector(".lightbox-next").addEventListener("click", showNextImage);
lightbox.addEventListener("click", handleLightboxClick);
document.addEventListener("keydown", handleKeydown);

updateGalleryDetails();
