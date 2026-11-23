window.PlannerModule = (() => {
  let state = JSON.parse(localStorage.getItem("pa_planner_v1")) || {
    xp: 120,
    daily: [
      { id: 1, text: "En kritik 3 günlük hedefini belirle", priority: "high", done: false },
      { id: 2, text: "30 dakika kitap oku", priority: "normal", done: true }
    ],
    habits: [
      { id: 1, name: "Günde 2L Su İç", days: [true, true, true, false, false, false, false, false, false, false] },
      { id: 2, name: "Yazılım & Proje Geliştirme", days: [true, true, false, false, false, false, false, false, false, false] }
    ],
    annual: [
      { id: 1, title: "10 Kitap Oku", current: 6, target: 10 },
      { id: 2, title: "Yeni Bir Dil Öğren (Modül)", current: 2, target: 10 }
    ]
  };

  const save = () => {
    localStorage.setItem("pa_planner_v1", JSON.stringify(state));
    updateXPDisplay();
    if (window.RewardsModule) window.RewardsModule.render();
  };

  const addXP = (amount) => {
    state.xp = Math.max(0, state.xp + amount);
    save();
  };

  const getXP = () => state.xp;

  const updateXPDisplay = () => {
    const level = Math.floor(state.xp / 200) + 1;
    const headerXp = document.getElementById("header-xp");
    const plannerXp = document.getElementById("planner-xp");
    if (headerXp) headerXp.textContent = `${state.xp} XP • Sv. ${level}`;
    if (plannerXp) plannerXp.textContent = `${state.xp} XP (Seviye ${level})`;
  };

  const renderDaily = () => {
    const list = document.getElementById("daily-list");
    if (!list) return;
    list.innerHTML = "";
    state.daily.forEach(item => {
      const li = document.createElement("li");
      li.className = `task-item ${item.done ? "done" : ""}`;
      li.innerHTML = `
        <div class="task-left">
          <input type="checkbox" ${item.done ? "checked" : ""} />
          <span class="task-text">${item.text}</span>
          ${item.priority === "high" ? '<span class="prio-tag">Kritik</span>' : ""}
        </div>
        <button class="del-btn" title="Sil">🗑️</button>
      `;
      li.querySelector("input").addEventListener("change", (e) => {
        item.done = e.target.checked;
        addXP(item.done ? 25 : -25);
        renderDaily();
      });
      li.querySelector(".del-btn").addEventListener("click", () => {
        state.daily = state.daily.filter(t => t.id !== item.id);
        save();
        renderDaily();
      });
      list.appendChild(li);
    });
  };

  const renderHabits = () => {
    const container = document.getElementById("habit-list");
    if (!container) return;
    container.innerHTML = "";
    state.habits.forEach(habit => {
      const row = document.createElement("div");
      row.className = "habit-row";
      const dotsHtml = habit.days.map((checked, idx) =>
        `<button class="day-dot ${checked ? "checked" : ""}" data-idx="${idx}">${checked ? "✓" : idx + 1}</button>`
      ).join("");

      row.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <strong>${habit.name}</strong>
          <button class="del-btn" title="Alışkanlığı Sil">✕</button>
        </div>
        <div class="habit-dots">${dotsHtml}</div>
      `;

      row.querySelectorAll(".day-dot").forEach(btn => {
        btn.addEventListener("click", () => {
          const i = Number(btn.dataset.idx);
          habit.days[i] = !habit.days[i];
          addXP(habit.days[i] ? 15 : -15);
          renderHabits();
        });
      });

      row.querySelector(".del-btn").addEventListener("click", () => {
        state.habits = state.habits.filter(h => h.id !== habit.id);
        save();
        renderHabits();
      });
      container.appendChild(row);
    });
  };

  const renderAnnual = () => {
    const grid = document.getElementById("annual-list");
    if (!grid) return;
    grid.innerHTML = "";
    let totalPct = 0;

    state.annual.forEach(goal => {
      const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
      totalPct += pct;
      const card = document.createElement("div");
      card.className = "annual-card";
      card.innerHTML = `
        <div class="annual-top">
          <strong>${goal.title}</strong>
          <span style="color:var(--accent);font-weight:700">%${pct}</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="annual-controls">
          <span class="muted" style="margin:0;font-size:0.85rem">${goal.current} / ${goal.target}</span>
          <div style="display:flex;gap:0.4rem;align-items:center;">
            <button class="step-btn minus">-</button>
            <button class="step-btn plus">+</button>
            <button class="del-btn">🗑️</button>
          </div>
        </div>
      `;

      card.querySelector(".plus").addEventListener("click", () => {
        if (goal.current < goal.target) {
          goal.current++;
          if (goal.current === goal.target) addXP(100);
          else addXP(10);
          renderAnnual();
        }
      });
      card.querySelector(".minus").addEventListener("click", () => {
        if (goal.current > 0) {
          goal.current--;
          save();
          renderAnnual();
        }
      });
      card.querySelector(".del-btn").addEventListener("click", () => {
        state.annual = state.annual.filter(g => g.id !== goal.id);
        save();
        renderAnnual();
      });
      grid.appendChild(card);
    });

    const avg = state.annual.length ? Math.round(totalPct / state.annual.length) : 0;
    const avgEl = document.getElementById("annual-avg");
    const avgBar = document.getElementById("annual-avg-bar");
    if (avgEl) avgEl.textContent = `%${avg}`;
    if (avgBar) avgBar.style.width = `${avg}%`;
  };

  const init = () => {
    updateXPDisplay();
    renderDaily();
    renderHabits();
    renderAnnual();

    document.getElementById("daily-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("daily-input");
      const prio = document.getElementById("daily-priority").value;
      if (!input.value.trim()) return;
      state.daily.unshift({ id: Date.now(), text: input.value.trim(), priority: prio, done: false });
      input.value = "";
      save();
      renderDaily();
    });

    document.getElementById("habit-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("habit-input");
      if (!input.value.trim()) return;
      state.habits.push({ id: Date.now(), name: input.value.trim(), days: Array(10).fill(false) });
      input.value = "";
      save();
      renderHabits();
    });

    document.getElementById("annual-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("annual-title");
      const target = document.getElementById("annual-target");
      if (!title.value.trim() || !target.value) return;
      state.annual.push({ id: Date.now(), title: title.value.trim(), current: 0, target: Number(target.value) });
      title.value = "";
      target.value = "";
      save();
      renderAnnual();
    });
  };

  return { init, getXP };
})();

document.addEventListener("DOMContentLoaded", () => window.PlannerModule.init());