// auth.js — Real wallet connect (window.ethereum) + mock email/social
(function () {
  const KEY = "novus_auth_v1";

  function getUser() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch(e) { return null; }
  }
  function setUser(u) {
    localStorage.setItem(KEY, JSON.stringify(u));
  }
  function logout() {
    localStorage.removeItem(KEY);
  }

  // Desktop nav + mobile bottom bar
  function applyNav() {
    const u   = getUser();
    const btn = document.getElementById("navLoginBtn");

    if (btn) {
      if (u) {
        const label = u.type === "wallet"
          ? u.address.slice(0, 6) + "..." + u.address.slice(-4)
          : u.type === "twitter" ? u.handle : u.name;
        const color = u.color || "#6ee7b7";
        const init  = u.init  || (label||"?").slice(0,2).toUpperCase();
        btn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px">
          <span style="width:22px;height:22px;border-radius:50%;background:${color};display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#000">${init}</span>
          ${label}
        </span>`;
        btn.href             = "/profile/";
        btn.style.background = "#0b0b0c";
        btn.style.border     = "1px solid rgba(255,255,255,.1)";
        btn.style.color      = "#f5f5f5";
      }
    }

    // Mobile bottom bar — swap Profile ↔ Login
    const mobileProfileLink = document.querySelector(".mobilebar a[href='/profile/']")
      || document.querySelector(".mobilebar a[href='/login/']");
    if (mobileProfileLink) {
      if (!u) {
        mobileProfileLink.href        = "/login/";
        mobileProfileLink.textContent = "Login";
      } else {
        mobileProfileLink.href        = "/profile/";
        mobileProfileLink.textContent = "Profile";
      }
    }
  }

  window.NovusAuth = { getUser, setUser, logout, applyNav };

  document.addEventListener("DOMContentLoaded", applyNav);
})();
