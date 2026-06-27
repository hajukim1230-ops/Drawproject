// Local (demo) authentication. Accounts live in localStorage — this is NOT
// real/secure auth (no backend). Swap these functions for a real provider
// (Firebase, Supabase, Auth0, etc.) when you add a server.
(function () {
  const el = (id) => document.getElementById(id);
  const authBtn = el("authBtn");
  const authMenu = el("authMenu");
  const authMenuName = el("authMenuName");
  const logoutBtn = el("logoutBtn");
  const modal = el("authModal");
  const card = el("authCard");
  const form = el("authForm");
  const nameEl = el("authName");
  const emailEl = el("authEmail");
  const passEl = el("authPass");
  const errEl = el("authError");
  const submitBtn = el("authSubmit");
  const closeBtn = el("authClose");

  const USERS_KEY = "drawref-users";
  const SESSION_KEY = "drawref-session";
  let mode = "login";

  // Lightweight, non-cryptographic hash — keeps plaintext out of storage,
  // but is NOT secure. Fine only for this local demo.
  function hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h.toString(16);
  }
  const loadUsers = () => { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch (e) { return {}; } };
  const saveUsers = (u) => { try { localStorage.setItem(USERS_KEY, JSON.stringify(u)); } catch (e) {} };
  const getSession = () => { try { return localStorage.getItem(SESSION_KEY); } catch (e) { return null; } };
  const setSession = (e) => { try { e ? localStorage.setItem(SESSION_KEY, e) : localStorage.removeItem(SESSION_KEY); } catch (e2) {} };

  function setMode(m) {
    mode = m;
    card.classList.toggle("login-mode", m === "login");
    document.querySelectorAll(".auth-tab").forEach((t) => t.classList.toggle("active", t.dataset.mode === m));
    submitBtn.textContent = m === "login" ? "Log in" : "Create account";
    errEl.textContent = "";
  }
  function openModal() { modal.hidden = false; setMode("login"); setTimeout(() => emailEl.focus(), 0); }
  function closeModal() { modal.hidden = true; form.reset(); errEl.textContent = ""; }

  function updateUI() {
    const email = getSession();
    const users = loadUsers();
    if (email && users[email]) {
      authBtn.textContent = "👤 " + users[email].name;
      authBtn.classList.add("logged");
      authMenuName.textContent = users[email].name + " · " + email;
    } else {
      authBtn.textContent = "Log in";
      authBtn.classList.remove("logged");
      authMenu.hidden = true;
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailEl.value.trim().toLowerCase();
    const pass = passEl.value;
    const users = loadUsers();
    if (!email || !pass) { errEl.textContent = "Please fill in all fields."; return; }

    if (mode === "signup") {
      const name = nameEl.value.trim();
      if (!name) { errEl.textContent = "Please enter your name."; return; }
      if (pass.length < 4) { errEl.textContent = "Password must be at least 4 characters."; return; }
      if (users[email]) { errEl.textContent = "An account with that email already exists."; return; }
      users[email] = { name: name, hash: hash(pass) };
      saveUsers(users);
      setSession(email);
    } else {
      if (!users[email] || users[email].hash !== hash(pass)) {
        errEl.textContent = "Incorrect email or password.";
        return;
      }
      setSession(email);
    }
    closeModal();
    updateUI();
  });

  document.querySelectorAll(".auth-tab").forEach((t) =>
    t.addEventListener("click", () => setMode(t.dataset.mode)));
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  authBtn.addEventListener("click", () => {
    if (getSession() && loadUsers()[getSession()]) authMenu.hidden = !authMenu.hidden;
    else openModal();
  });
  logoutBtn.addEventListener("click", () => { setSession(null); authMenu.hidden = true; updateUI(); });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".auth-wrap")) authMenu.hidden = true;
  });

  updateUI();
})();
