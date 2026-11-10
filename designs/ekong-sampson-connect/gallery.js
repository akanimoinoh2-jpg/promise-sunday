/* Ekong Sampson Connect — Senator image gallery (profile page) */
(function () {
  "use strict";

  const toggle = document.getElementById("gallery-toggle");
  const grid = document.getElementById("gallery-grid");
  const status = document.getElementById("gallery-status");
  if (!toggle || !grid || !status) return;

  let loaded = false;
  let loading = false;

  function card(photo) {
    const card = document.createElement("figure");
    card.className = "gallery-card";

    const img = document.createElement("img");
    img.src = photo.fileUrl;
    img.alt = photo.caption || "Senator Ekong Sampson";
    img.loading = "lazy";

    const caption = document.createElement("figcaption");
    caption.textContent = photo.caption || "Senator Ekong Sampson";

    card.appendChild(img);
    card.appendChild(caption);
    return card;
  }

  async function loadPhotos() {
    loading = true;
    toggle.disabled = true;
    status.textContent = "Loading photos…";
    try {
      const res = await fetch("/api/photos");
      if (!res.ok) throw new Error("Could not load photos");
      const photos = await res.json();
      grid.innerHTML = "";
      if (!photos.length) {
        status.textContent = "No photos have been uploaded yet. Team members can add photos from the project team portal.";
      } else {
        photos.forEach((p) => grid.appendChild(card(p)));
        status.textContent = "";
        loaded = true;
        grid.classList.remove("hidden");
        toggle.textContent = "Hide Senator Images";
        toggle.setAttribute("aria-expanded", "true");
      }
    } catch (err) {
      status.textContent = "Sorry — photos could not be loaded right now. Please try again later.";
    } finally {
      loading = false;
      toggle.disabled = false;
    }
  }

  function hidePhotos() {
    grid.classList.add("hidden");
    toggle.textContent = "View Senator Images";
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () => {
    if (loading) return;
    if (!loaded) {
      loadPhotos();
    } else if (grid.classList.contains("hidden")) {
      grid.classList.remove("hidden");
      toggle.textContent = "Hide Senator Images";
      toggle.setAttribute("aria-expanded", "true");
    } else {
      hidePhotos();
    }
  });
})();
