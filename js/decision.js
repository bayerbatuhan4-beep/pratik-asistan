window.DecisionModule = (() => {
  let currentCardIdx = 0;
  let roomCode = localStorage.getItem("pa_room_code") || "";

  const launchConfetti = () => {
    const colors = ["#8b5cf6", "#06b6d4", "#ec4899", "#10b981", "#f59e0b"];
    for (let i = 0; i < 45; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (Math.random() * 1.5 + 1.5) + "s";
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 3000);
    }
  };

  const renderCard = () => {
    const box = document.getElementById("swipe-card-box");
    if (!box) return;
    const cards = window.AppData.decisionCards;
    const item = cards[currentCardIdx % cards.length];
    box.innerHTML = `
      <div class="swipe-card">
        <span class="badge-soft">${item.type}</span>
        <div class="swipe-emoji">${item.emoji}</div>
        <h3>${item.title}</h3>
        <p class="muted">${item.tag}</p>
      </div>
    `;
  };

  const handleSwipe = (liked) => {
    const cards = window.AppData.decisionCards;
    const item = cards[currentCardIdx % cards.length];
    const matchBox = document.getElementById("match-alert");

    if (liked && Math.random() > 0.35) {
      launchConfetti();
      if (matchBox) {
        matchBox.style.display = "block";
        matchBox.innerHTML = `🎉 <strong>Eşleşme Sağlandı!</strong> Ortak Seçim: <strong>${item.title}</strong>`;
      }
    } else if (matchBox) {
      matchBox.style.display = "none";
    }
    currentCardIdx++;
    renderCard();
  };

  const renderGifts = (who, interest, budget) => {
    const list = document.getElementById("gift-results");
    if (!list) return;
    let filtered = window.AppData.gifts.filter(g =>
      (who === "all" || g.who === who) &&
      (interest === "all" || g.interest === interest) &&
      (budget === "all" || g.budget === budget)
    );
    if (filtered.length === 0) {
      filtered = window.AppData.gifts.slice(0, 3);
    }
    list.innerHTML = filtered.map(g => `
      <div class="gift-item">
        <div>
          <strong>${g.title}</strong>
          <p class="muted" style="margin-top:0.25rem;font-size:0.85rem;">${g.desc}</p>
        </div>
        <span class="xp-badge">${g.price}</span>
      </div>
    `).join("");
  };

  const init = () => {
    renderCard();
    renderGifts("all", "all", "all");

    const roomDisplay = document.getElementById("room-code-display");
    if (roomCode && roomDisplay) roomDisplay.textContent = `Aktif Oda: #${roomCode}`;

    document.getElementById("create-room-btn")?.addEventListener("click", () => {
      roomCode = "PA-" + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem("pa_room_code", roomCode);
      if (roomDisplay) roomDisplay.textContent = `Aktif Oda: #${roomCode}`;
    });

    document.getElementById("copy-room-btn")?.addEventListener("click", () => {
      const codeToCopy = roomCode || "PA-2026";
      const shareText = `PratikAsistan Ortak Karar Odamıza Katıl! Oda Kodu: #${codeToCopy}`;
      navigator.clipboard?.writeText(shareText);
      const btn = document.getElementById("copy-room-btn");
      btn.textContent = "✓ Kopyalandı!";
      setTimeout(() => (btn.textContent = "🔗 Link Kopyala"), 2000);
    });

    document.getElementById("swipe-pass")?.addEventListener("click", () => handleSwipe(false));
    document.getElementById("swipe-like")?.addEventListener("click", () => handleSwipe(true));

    document.getElementById("gift-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const who = document.getElementById("gift-who").value;
      const interest = document.getElementById("gift-interest").value;
      const budget = document.getElementById("gift-budget").value;
      renderGifts(who, interest, budget);
    });
  };

  return { init };
})();

window.RewardsModule = (() => {
  const render = () => {
    const grid = document.getElementById("coupons-grid");
    const xpInfo = document.getElementById("rewards-xp-status");
    if (!grid) return;

    const currentXp = window.PlannerModule ? window.PlannerModule.getXP() : 0;
    if (xpInfo) xpInfo.textContent = `Mevcut Puanın: ${currentXp} XP`;

    grid.innerHTML = window.AppData.coupons.map(c => {
      const unlocked = currentXp >= c.reqXp;
      return `
        <div class="coupon-card ${unlocked ? "unlocked" : "locked"}">
          <div class="coupon-top">
            <span class="brand-name">${c.brand}</span>
            <span class="badge-soft">${unlocked ? "Açık ✓" : `${c.reqXp} XP Gerekli`}</span>
          </div>
          <h3>${c.discount}</h3>
          <p class="muted" style="font-size:0.85rem;">${c.desc}</p>
          <div class="coupon-bottom">
            <code class="coupon-code">${unlocked ? c.code : "••••••"}</code>
            <button class="btn-primary copy-coupon-btn" data-code="${c.code}" ${unlocked ? "" : "disabled"}>
              ${unlocked ? "Kodu Kopyala" : "Kilitli 🔒"}
            </button>
          </div>
        </div>
      `;
    }).join("");

    grid.querySelectorAll(".copy-coupon-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        navigator.clipboard?.writeText(btn.dataset.code);
        btn.textContent = "Kopyalandı! ✓";
        setTimeout(() => (btn.textContent = "Kodu Kopyala"), 2000);
      });
    });
  };

  return { render };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.DecisionModule.init();
  window.RewardsModule.render();
});
