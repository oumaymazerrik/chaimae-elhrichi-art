const whatsappNumber = "212650732531";
const emailAddress = "elhrichichaimae04@gmail.com";
const storedArtworksKey = "chaimae-extra-artworks";
const cartStorageKey = "chaimae-cart";

function getStoredArtworks() {
  try {
    return JSON.parse(localStorage.getItem(storedArtworksKey) || "[]");
  } catch {
    return [];
  }
}

function saveStoredArtworks(items) {
  localStorage.setItem(storedArtworksKey, JSON.stringify(items));
}

function getAllArtworks() {
  const base = typeof artworks === "undefined" ? [] : artworks;
  return [...getStoredArtworks(), ...base];
}



function getCartItems() {
  try {
    return JSON.parse(localStorage.getItem(cartStorageKey) || "[]");
  } catch {
    return [];
  }
}

function saveCartItems(items) {
  localStorage.setItem(cartStorageKey, JSON.stringify(items));
  updateCartCount();
}

function artworkId(art) {
  return art.image || art.title;
}

function addToCart(art) {
  const items = getCartItems();
  const id = artworkId(art);
  if (!items.some((item) => item.id === id)) {
    items.push({
      id,
      title: art.title,
      image: art.image,
      price: art.price,
      size: art.size,
      category: categoryLabel[art.category] || art.category,
    });
    saveCartItems(items);
  }
  showCartNotice(`${art.title} est ajoute au panier.`);
}

function removeFromCart(id) {
  saveCartItems(getCartItems().filter((item) => item.id !== id));
  renderCartPage();
}

function updateCartCount() {
  const count = getCartItems().length;
  document.querySelectorAll("[data-cart-count]").forEach((target) => {
    target.textContent = String(count);
    target.hidden = count === 0;
  });
}

function cartMessage(items) {
  const lines = items.map((item, index) => `${index + 1}. ${item.title} - ${item.price} - ${item.size}`);
  return [
    "Bonjour Chaimae, je souhaite valider cette commande :",
    ...lines,
    "",
    "Merci de me confirmer la disponibilite, le prix final et le mode de paiement securise.",
  ].join("\n");
}

function showCartNotice(message) {
  let notice = document.querySelector(".cart-toast");
  if (!notice) {
    notice = document.createElement("div");
    notice.className = "cart-toast";
    document.body.appendChild(notice);
  }
  notice.textContent = message;
  notice.classList.add("is-visible");
  window.setTimeout(() => notice.classList.remove("is-visible"), 2200);
}

function renderCartPage() {
  const target = document.querySelector("#cartItems");
  const summary = document.querySelector("#cartSummaryText");
  const whatsapp = document.querySelector("#cartWhatsapp");
  if (!target || !summary || !whatsapp) return;

  const items = getCartItems();
  if (!items.length) {
    target.innerHTML = `<div class="empty-cart"><p>Votre panier est vide.</p><a class="button primary" href="galerie.html">Choisir une oeuvre</a></div>`;
    summary.textContent = "Ajoutez une oeuvre depuis la galerie pour preparer une commande.";
    whatsapp.href = whatsappUrl("Bonjour Chaimae, je souhaite avoir des informations sur vos tableaux.");
    return;
  }

  target.innerHTML = items
    .map(
      (item) => `
        <article class="cart-item">
          <img src="${item.image}" alt="${item.title}" />
          <div>
            <span class="eyebrow">${item.category}</span>
            <h2>${item.title}</h2>
            <p>${item.size} | ${item.price}</p>
          </div>
          <button class="button ghost" type="button" data-remove-cart="${item.id}">Retirer</button>
        </article>
      `
    )
    .join("");

  summary.textContent = `${items.length} oeuvre${items.length > 1 ? "s" : ""} dans le panier. Prix final a confirmer avec l'artiste.`;
  whatsapp.href = whatsappUrl(cartMessage(items));
}

function setupCart() {
  updateCartCount();
  renderCartPage();

  document.querySelector("#cartItems")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-cart]");
    if (!button) return;
    removeFromCart(button.dataset.removeCart);
  });

  document.querySelector("#clearCartButton")?.addEventListener("click", () => {
    saveCartItems([]);
    renderCartPage();
  });
}
function emailComposeUrl(subject, body) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddress)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function whatsappUrl(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function observeReveals() {
  const elements = document.querySelectorAll("[data-reveal]:not(.is-visible)");
  if (!elements.length) return;

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  elements.forEach((element) => observer.observe(element));
}

function renderFeatured() {
  const target = document.querySelector("[data-featured]");
  if (!target) return;
  const allArtworks = getAllArtworks();
  if (allArtworks.length < 3) return;

  const featured = [allArtworks[0], allArtworks[4] || allArtworks[1], allArtworks[10] || allArtworks[2]].filter(Boolean);
  target.innerHTML = featured
    .map(
      (art) => `
        <a class="featured-work" href="galerie.html">
          <img src="${art.image}" alt="${art.title}" loading="lazy" />
          <span>${art.title}</span>
        </a>
      `
    )
    .join("");
}

function renderGallery(filter = "all") {
  const grid = document.querySelector("#artGrid");
  if (!grid) return;
  const allArtworks = getAllArtworks();

  const filtered = filter === "all" ? allArtworks : allArtworks.filter((art) => art.category === filter);
  grid.innerHTML = filtered
    .map(
      (art, index) => `
        <button class="art-card" type="button" data-index="${allArtworks.indexOf(art)}" data-reveal style="transition-delay: ${Math.min(index * 35, 260)}ms">
          <span class="art-frame">
            <img src="${art.image}" alt="${art.title}" loading="lazy" />
            <span class="art-badge">${art.price}</span>
          </span>
          <span class="art-meta">
            <span>
              <span class="art-title">${art.title}</span>
              <span class="art-category">${categoryLabel[art.category] || art.category}</span>
            </span>
            <span class="art-price">Voir</span>
          </span>
        </button>
      `
    )
    .join("");

  observeReveals();
}
function openLightbox(art) {
  const lightbox = document.querySelector("#lightbox");
  if (!lightbox) return;

  document.querySelector("#lightboxImage").src = art.image;
  document.querySelector("#lightboxImage").alt = art.title;
  document.querySelector("#lightboxCategory").textContent = categoryLabel[art.category];
  document.querySelector("#lightboxTitle").textContent = art.title;
  document.querySelector("#lightboxNote").textContent = art.note;
  document.querySelector("#lightboxTechnique").textContent = art.technique;
  document.querySelector("#lightboxSize").textContent = art.size;
  document.querySelector("#lightboxYear").textContent = art.year;
  document.querySelector("#lightboxPrice").textContent = art.price;
  const addCartButton = document.querySelector("#lightboxAddCart");
  if (addCartButton) addCartButton.onclick = () => addToCart(art);
  document.querySelector("#lightboxWhatsapp").href = whatsappUrl(
    `Bonjour Chaimae, je suis interesse(e) par l'oeuvre "${art.title}".`
  );

  if (typeof lightbox.showModal === "function") lightbox.showModal();
}

function setupGallery() {
  const grid = document.querySelector("#artGrid");
  if (!grid) return;

  document.querySelectorAll(".filter").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(".filter.active")?.classList.remove("active");
      button.classList.add("active");
      renderGallery(button.dataset.filter);
    });
  });

  grid.addEventListener("click", (event) => {
    const card = event.target.closest(".art-card");
    if (!card) return;
    openLightbox(getAllArtworks()[Number(card.dataset.index)]);
  });

  document.querySelector(".close-lightbox")?.addEventListener("click", () => {
    document.querySelector("#lightbox")?.close();
  });

  document.querySelector("#lightbox")?.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  });

  renderGallery();
}



function setupAboutRotator() {
  const frame = document.querySelector("[data-about-rotator]");
  if (!frame) return;
  const image = frame.querySelector("img");
  const caption = frame.querySelector(".about-art-caption");
  const allArtworks = getAllArtworks();
  if (!image || allArtworks.length < 2) return;

  let index = allArtworks.findIndex((art) => art.image === image.getAttribute("src"));
  if (index < 0) index = 0;

  function showArtwork(nextIndex) {
    const art = allArtworks[nextIndex % allArtworks.length];
    frame.classList.add("is-changing");
    window.setTimeout(() => {
      image.src = art.image;
      image.alt = `${art.title}, peinture de Chaimae Elhrichi`;
      if (caption) caption.textContent = art.title;
      frame.classList.remove("is-changing");
    }, 260);
  }

  window.setInterval(() => {
    index = (index + 1) % allArtworks.length;
    showArtwork(index);
  }, 3600);
}
function setupArtworkSelect() {
  const select = document.querySelector("#artworkSelect");
  if (!select) return;
  const allArtworks = getAllArtworks();

  const currentValue = new URLSearchParams(window.location.search).get("tableau") || select.value;
  select.innerHTML = [
    '<option value="Commande personnalisee">Commande personnalisee</option>',
    ...allArtworks.map((art) => `<option value="${art.title}">${art.title}</option>`),
  ].join("");

  if (currentValue) select.value = currentValue;
}
function formMessage(data) {
  return [
    "Bonjour Chaimae, je souhaite commander un tableau.",
    `Nom: ${data.get("name") || ""}`,
    `Contact: ${data.get("contact") || ""}`,
    `Tableau: ${data.get("artwork") || "Commande personnalisee"}`,
    `Type: ${data.get("type") || ""}`,
    `Taille: ${data.get("size") || ""}`,
    `Budget: ${data.get("budget") || ""}`,
    `Description: ${data.get("description") || ""}`,
  ].join("\n");
}


function updateQuickWhatsappLink() {
  const link = document.querySelector("#quickWhatsappLink");
  const form = document.querySelector("#commissionForm");
  if (!link || !form) return;
  const data = new FormData(form);
  const artwork = data.get("artwork") || "Commande personnalisee";
  link.href = whatsappUrl(`Bonjour Chaimae, je souhaite commander le tableau "${artwork}".`);
}
function setupForm() {
  const form = document.querySelector("#commissionForm");
  const emailLink = document.querySelector("#emailLink");
  if (!form) return;

  function updateEmailLink() {
    if (!emailLink) return;
    const data = new FormData(form);
    const subject = encodeURIComponent("Commande de tableau - Chaimae Elhrichi");
    const body = encodeURIComponent(formMessage(data));
    emailLink.href = emailComposeUrl("Commande de tableau - Chaimae Elhrichi", formMessage(data));
  }

  form.addEventListener("input", () => {
    updateEmailLink();
    updateQuickWhatsappLink();
  });
  form.addEventListener("change", updateQuickWhatsappLink);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    window.open(whatsappUrl(formMessage(new FormData(form))), "_blank", "noopener,noreferrer");
  });
  updateEmailLink();
  updateQuickWhatsappLink();
}

setupArtworkSelect();
setupTheme();
renderFeatured();
setupAboutRotator();
setupGallery();
setupForm();
setupCart();
observeReveals();
function setupTheme() {
  const toggle = document.querySelector(".theme-toggle");
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("chaimae-theme") || "dark";

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const isLight = theme === "light";
    const themedHero = document.querySelector(".hero-media img[data-light-src]");
    if (themedHero) {
      themedHero.src = isLight ? themedHero.dataset.lightSrc : themedHero.dataset.darkSrc;
      themedHero.alt = isLight ? themedHero.dataset.lightAlt : themedHero.dataset.darkAlt;
    }
    if (!toggle) return;
    toggle.setAttribute("aria-pressed", String(isLight));
    toggle.setAttribute("aria-label", isLight ? "Activer le mode sombre" : "Activer le mode clair");
    const label = toggle.querySelector(".theme-toggle-text");
    if (label) label.textContent = isLight ? "Dark" : "Light";
  }

  applyTheme(savedTheme);

  toggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("chaimae-theme", nextTheme);
    applyTheme(nextTheme);
  });
}













