const whatsappNumber = "212650732531";
const emailAddress = "elhrichichaimae04@gmail.com";
const storedArtworksKey = "chaimae-extra-artworks";
const cartStorageKey = "chaimae-cart";
const accountStorageKey = "chaimae-client-accounts";
const accountSessionKey = "chaimae-client-session";
const favoritesStorageKey = "chaimae-favorites";

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





function getFavoriteIds() {
  try {
    return JSON.parse(localStorage.getItem(favoritesStorageKey) || "[]");
  } catch {
    return [];
  }
}

function saveFavoriteIds(ids) {
  localStorage.setItem(favoritesStorageKey, JSON.stringify(ids));
  updateFavoriteCount();
}

function isFavorite(art) {
  return getFavoriteIds().includes(artworkId(art));
}

function toggleFavorite(art) {
  const id = artworkId(art);
  const ids = getFavoriteIds();
  const next = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
  saveFavoriteIds(next);
  showCartNotice(ids.includes(id) ? `${art.title} est retire des favoris.` : `${art.title} est ajoute aux favoris.`);
  renderFavoritesPage();
}

function updateFavoriteCount() {
  const count = getFavoriteIds().length;
  document.querySelectorAll("[data-favorite-count]").forEach((target) => {
    target.textContent = String(count);
  });
}

function renderFavoritesPage() {
  const target = document.querySelector("#favoriteGrid");
  if (!target) return;
  const ids = getFavoriteIds();
  const favorites = getAllArtworks().filter((art) => ids.includes(artworkId(art)));
  if (!favorites.length) {
    target.innerHTML = `<div class="empty-cart"><p>Aucun favori pour le moment.</p><a class="button primary" href="galerie.html">Voir la galerie</a></div>`;
    return;
  }
  target.innerHTML = favorites.map((art) => `
    <button class="art-card" type="button" data-favorite-open="${artworkId(art)}" data-reveal>
      <span class="art-frame"><img src="${art.image}" alt="${art.title}" loading="lazy" /><span class="art-badge">${art.price}</span></span>
      <span class="art-meta"><span><span class="art-title">${art.title}</span><span class="art-category">${art.category}</span></span><span class="art-price">Voir</span></span>
    </button>
  `).join("");
  observeReveals();
}

function setupFavoritesPage() {
  const grid = document.querySelector("#favoriteGrid");
  if (!grid) return;
  grid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-favorite-open]");
    if (!card) return;
    const art = getAllArtworks().find((item) => artworkId(item) === card.dataset.favoriteOpen);
    if (art) openLightbox(art);
  });
  renderFavoritesPage();
}

function openSearchPanel() {
  let panel = document.querySelector("#searchPanel");
  if (!panel) {
    panel = document.createElement("dialog");
    panel.id = "searchPanel";
    panel.className = "search-panel";
    panel.innerHTML = `
      <button class="close-lightbox" type="button" data-search-close aria-label="Fermer">&times;</button>
      <div class="search-box">
        <p class="eyebrow">Recherche</p>
        <input id="searchInput" type="search" placeholder="Titre, categorie, technique..." autocomplete="off" />
        <div class="search-results" id="searchResults"></div>
      </div>
    `;
    document.body.appendChild(panel);
    panel.querySelector("[data-search-close]").addEventListener("click", () => panel.close());
    panel.addEventListener("click", (event) => {
      if (event.target === panel) panel.close();
    });
    panel.querySelector("#searchInput").addEventListener("input", renderSearchResults);
    panel.querySelector("#searchResults").addEventListener("click", (event) => {
      const link = event.target.closest("[data-search-art]");
      if (!link) return;
      const art = getAllArtworks().find((item) => artworkId(item) === link.dataset.searchArt);
      if (art) {
        panel.close();
        openLightbox(art);
      }
    });
  }
  if (typeof panel.showModal === "function") panel.showModal();
  renderSearchResults();
  window.setTimeout(() => panel.querySelector("#searchInput")?.focus(), 80);
}

function renderSearchResults() {
  const input = document.querySelector("#searchInput");
  const target = document.querySelector("#searchResults");
  if (!input || !target) return;
  const query = input.value.trim().toLowerCase();
  const results = getAllArtworks().filter((art) => [art.title, art.category, art.technique, art.note].join(" ").toLowerCase().includes(query)).slice(0, 8);
  target.innerHTML = results.map((art) => `
    <button type="button" class="search-result" data-search-art="${artworkId(art)}">
      <img src="${art.image}" alt="${art.title}" />
      <span><strong>${art.title}</strong><small>${art.price}</small></span>
    </button>
  `).join("") || `<p class="cart-summary-text">Aucun resultat.</p>`;
}

function setupHeaderActions() {
  updateFavoriteCount();
  document.querySelectorAll("[data-search-open]").forEach((button) => {
    button.addEventListener("click", openSearchPanel);
  });
}
function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem(accountStorageKey) || "[]");
  } catch {
    return [];
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(accountStorageKey, JSON.stringify(accounts));
}

function getCurrentAccount() {
  const email = localStorage.getItem(accountSessionKey);
  if (!email) return null;
  return getAccounts().find((account) => account.email === email) || null;
}

function setCurrentAccount(email) {
  if (email) localStorage.setItem(accountSessionKey, email);
  else localStorage.removeItem(accountSessionKey);
  updateAccountNav();
}

async function hashPassword(password) {
  if (window.crypto?.subtle) {
    const data = new TextEncoder().encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return btoa(unescape(encodeURIComponent(password)));
}

function updateAccountNav() {
  const account = getCurrentAccount();
  document.querySelectorAll("[data-account-link]").forEach((link) => {
    const label = account ? "Mon compte" : "Compte client";
    link.setAttribute("aria-label", label);
    link.setAttribute("title", label);
    if (!link.classList.contains("icon-action")) link.textContent = account ? "Mon compte" : "Compte";
  });
}

function accountSummary(account) {
  if (!account) return [];
  return [
    "",
    "Client connecte :",
    `Nom: ${account.name || ""}`,
    `Email: ${account.email || ""}`,
    `Telephone: ${account.phone || ""}`,
    `Instagram: ${account.instagram || ""}`,
    `Adresse: ${account.address || ""}`,
  ];
}

function showAccountPageState() {
  const account = getCurrentAccount();
  const profile = document.querySelector("#accountProfile");
  const welcome = document.querySelector("#profileWelcome");
  const profileForm = document.querySelector("#profileForm");
  if (!profile || !profileForm) return;

  profile.hidden = !account;
  if (!account) return;

  welcome.textContent = `Connecte(e) avec ${account.email}.`;
  profileForm.elements.name.value = account.name || "";
  profileForm.elements.phone.value = account.phone || "";
  profileForm.elements.instagram.value = account.instagram || "";
  profileForm.elements.address.value = account.address || "";
}

function setupAccount() {
  updateAccountNav();
  showAccountPageState();

  const registerForm = document.querySelector("#registerForm");
  const loginForm = document.querySelector("#loginForm");
  const profileForm = document.querySelector("#profileForm");
  const registerMessage = document.querySelector("#registerMessage");
  const loginMessage = document.querySelector("#loginMessage");

  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(registerForm);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const accounts = getAccounts();
    if (accounts.some((account) => account.email === email)) {
      registerMessage.textContent = "Un compte existe deja avec cet email.";
      return;
    }
    const account = {
      name: String(data.get("name") || "").trim(),
      email,
      phone: String(data.get("phone") || "").trim(),
      instagram: "",
      address: "",
      passwordHash: await hashPassword(String(data.get("password") || "")),
      createdAt: new Date().toISOString(),
    };
    saveAccounts([...accounts, account]);
    setCurrentAccount(email);
    registerForm.reset();
    registerMessage.textContent = "Compte cree et connecte.";
    showAccountPageState();
    renderCartPage();
  });

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(loginForm);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const passwordHash = await hashPassword(String(data.get("password") || ""));
    const account = getAccounts().find((item) => item.email === email && item.passwordHash === passwordHash);
    if (!account) {
      loginMessage.textContent = "Email ou mot de passe incorrect.";
      return;
    }
    setCurrentAccount(email);
    loginForm.reset();
    loginMessage.textContent = "Connexion reussie.";
    showAccountPageState();
    renderCartPage();
  });

  profileForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const current = getCurrentAccount();
    if (!current) return;
    const data = new FormData(profileForm);
    const accounts = getAccounts().map((account) => account.email === current.email ? {
      ...account,
      name: String(data.get("name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      instagram: String(data.get("instagram") || "").trim(),
      address: String(data.get("address") || "").trim(),
    } : account);
    saveAccounts(accounts);
    showCartNotice("Profil client enregistre.");
    updateAccountNav();
    renderCartPage();
  });

  document.querySelector("#logoutButton")?.addEventListener("click", () => {
    setCurrentAccount(null);
    showAccountPageState();
    renderCartPage();
  });
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
  const customerLines = accountSummary(getCurrentAccount());
  return [
    "Bonjour Chaimae, je souhaite valider cette commande :",
    ...lines,
    ...customerLines,
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
  const accountHint = document.querySelector("#cartAccountHint");
  if (!target || !summary || !whatsapp) return;

  const account = getCurrentAccount();
  if (accountHint) {
    accountHint.innerHTML = account ? `Commande associee au compte de <strong>${account.name || account.email}</strong>.` : `Vous pouvez <a href="compte.html">creer un compte</a> pour ajouter vos informations automatiquement.`;
  }

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
  const favoriteButton = document.querySelector("#lightboxFavorite");
  if (favoriteButton) {
    favoriteButton.textContent = isFavorite(art) ? "Retirer des favoris" : "Ajouter aux favoris";
    favoriteButton.onclick = () => {
      toggleFavorite(art);
      favoriteButton.textContent = isFavorite(art) ? "Retirer des favoris" : "Ajouter aux favoris";
    };
  }
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
setupAccount();
setupHeaderActions();
setupFavoritesPage();
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













