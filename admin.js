const adminPassword = "chaimae2026";
const adminSessionKey = "chaimae-admin-session";
const adminPrivatePage = "admin-espace.html";
const adminLoginPage = "admin.html";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Image impossible a lire."));
    reader.readAsDataURL(file);
  });
}

function isAdminConnected() {
  return localStorage.getItem(adminSessionKey) === "true";
}

function renderAdminArtList() {
  const list = document.querySelector("#adminArtList");
  if (!list) return;
  const items = getStoredArtworks();

  if (!items.length) {
    list.innerHTML = '<p class="admin-empty">Aucun nouveau tableau ajoute pour le moment.</p>';
    return;
  }

  list.innerHTML = items
    .map(
      (art) => `
        <article class="admin-art-item">
          <img src="${art.image}" alt="${art.title}" />
          <div>
            <strong>${art.title}</strong>
            <span>${categoryLabel[art.category] || art.category}</span>
          </div>
          <button class="button ghost" type="button" data-delete-art="${art.id}">Supprimer</button>
        </article>
      `
    )
    .join("");
}

function setupAdminLogin() {
  const loginButton = document.querySelector("#adminLoginButton");
  const passwordInput = document.querySelector("#adminPassword");
  const loginMessage = document.querySelector("#adminLoginMessage");
  if (!loginButton || !passwordInput) return;

  if (isAdminConnected()) {
    window.location.href = adminPrivatePage;
    return;
  }

  function login() {
    if (passwordInput.value === adminPassword) {
      localStorage.setItem(adminSessionKey, "true");
      window.location.href = adminPrivatePage;
      return;
    }
    if (loginMessage) loginMessage.textContent = "Mot de passe incorrect.";
  }

  loginButton.addEventListener("click", login);
  passwordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") login();
  });
}

function setupAdminPrivate() {
  const panel = document.querySelector("#adminPanel");
  if (!panel) return;

  if (!isAdminConnected()) {
    window.location.href = adminLoginPage;
    return;
  }

  const form = document.querySelector("#adminArtworkForm");
  const logoutButton = document.querySelector("#adminLogoutButton");
  const list = document.querySelector("#adminArtList");

  renderAdminArtList();

  logoutButton?.addEventListener("click", () => {
    localStorage.removeItem(adminSessionKey);
    window.location.href = adminLoginPage;
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const file = data.get("image");
    if (!(file instanceof File) || !file.size) return;

    const image = await readFileAsDataUrl(file);
    const artwork = {
      id: `custom-${Date.now()}`,
      title: data.get("title") || "Sans titre",
      category: data.get("category") || "commande",
      image,
      technique: data.get("technique") || "Technique non precisee",
      size: data.get("size") || "Format non precise",
      year: data.get("year") || "2026",
      price: data.get("price") || "Sur demande",
      note: data.get("note") || "Nouveau tableau ajoute par l'artiste.",
    };

    saveStoredArtworks([artwork, ...getStoredArtworks()]);
    form.reset();
    form.elements.year.value = "2026";
    form.elements.price.value = "Sur demande";
    renderAdminArtList();
  });

  list?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-art]");
    if (!button) return;
    saveStoredArtworks(getStoredArtworks().filter((art) => art.id !== button.dataset.deleteArt));
    renderAdminArtList();
  });
}

setupAdminLogin();
setupAdminPrivate();
