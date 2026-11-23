document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const openDrawerBtn = document.getElementById("open-drawer");
  const closeDrawerBtn = document.getElementById("close-drawer");
  const sideDrawer = document.getElementById("side-drawer");
  const overlay = document.getElementById("drawer-overlay");
  const themeToggle = document.getElementById("theme-toggle");
  const colorDots = document.querySelectorAll(".color-dot");
  const tabBtns = document.querySelectorAll(".tab-btn, .drawer-link");
  const tabContents = document.querySelectorAll(".tab-content");

  // Kayıtlı Tema Ayarlarını Yükle
  const savedTheme = localStorage.getItem("pa_theme") || "dark";
  const savedAccent = localStorage.getItem("pa_accent") || "purple";
  html.setAttribute("data-theme", savedTheme);
  html.setAttribute("data-accent", savedAccent);
  themeToggle.checked = savedTheme === "dark";

  colorDots.forEach(dot => {
    dot.classList.toggle("active", dot.dataset.color === savedAccent);
  });

  // Hamburger Menü Aç/Kapat
  const toggleDrawer = (state) => {
    sideDrawer.classList.toggle("open", state);
    overlay.classList.toggle("open", state);
  };
  openDrawerBtn.addEventListener("click", () => toggleDrawer(true));
  closeDrawerBtn.addEventListener("click", () => toggleDrawer(false));
  overlay.addEventListener("click", () => toggleDrawer(false));

  // Karanlık / Aydınlık Mod Değişimi
  themeToggle.addEventListener("change", () => {
    const mode = themeToggle.checked ? "dark" : "light";
    html.setAttribute("data-theme", mode);
    localStorage.setItem("pa_theme", mode);
  });

  // Tema Rengi Değişimi
  colorDots.forEach(dot => {
    dot.addEventListener("click", () => {
      const color = dot.dataset.color;
      html.setAttribute("data-accent", color);
      localStorage.setItem("pa_accent", color);
      colorDots.forEach(d => d.classList.remove("active"));
      dot.classList.add("active");
    });
  });

  // Sekme Geçişleri
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.toggle("active", b.dataset.tab === target));
      tabContents.forEach(c => c.classList.toggle("active", c.id === `tab-${target}`));
      toggleDrawer(false);
    });
  });
});