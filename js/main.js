/* ═══════════════════════════════════════════════════════════
   REAL CARIOCA FC — main.js
   Agenda integrada com Google Sheets (sem backend)
   ═══════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initHero();
  initGaleria();
  initAgenda();   // ← busca dados do Google Sheets
  initForm();
  initScrollAnimations();
});

/* ─── NAV ─────────────────────────────────────────────────── */
function initNav() {
  const navbar    = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const navLinks  = document.querySelector(".nav-links");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  });

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      navLinks.classList.remove("open");
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });
}

/* ─── HERO ────────────────────────────────────────────────── */
function initHero() {
  const hero = document.getElementById("hero");
  window.addEventListener("scroll", () => {
    if (window.scrollY < window.innerHeight)
      hero.style.setProperty("--parallax", `${window.scrollY * 0.4}px`);
  });
}

/* ─── GALERIA / CAROUSEL ──────────────────────────────────── */
function initGaleria() {
  const carousel      = document.getElementById("carousel");
  const dotsContainer = document.getElementById("carouselDots");
  const prevBtn       = document.getElementById("prevBtn");
  const nextBtn       = document.getElementById("nextBtn");

  if (typeof FOTOS !== "undefined" && FOTOS.length > 0) {
    carousel.innerHTML = "";
    FOTOS.forEach(foto => {
      const slide = document.createElement("div");
      slide.className = "slide";
      slide.innerHTML = `<img src="${foto.src}" alt="${foto.legenda}" loading="lazy" />
                         <div class="slide-caption">${foto.legenda}</div>`;
      carousel.appendChild(slide);
    });
  }

  const slides = carousel.querySelectorAll(".slide");
  let current = 0, autoTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Foto ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    slides[current].classList.remove("active");
    dotsContainer.children[current].classList.remove("active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("active");
    dotsContainer.children[current].classList.add("active");
    carousel.style.transform = `translateX(-${current * 100}%)`;
  }

  function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 4000); }
  function stopAuto()  { clearInterval(autoTimer); }

  if (slides.length > 0) { goTo(0); startAuto(); }

  prevBtn.addEventListener("click", () => { stopAuto(); goTo(current - 1); startAuto(); });
  nextBtn.addEventListener("click", () => { stopAuto(); goTo(current + 1); startAuto(); });

  let touchStartX = 0;
  carousel.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; });
  carousel.addEventListener("touchend",   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { stopAuto(); goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
  });
}

/* ═══════════════════════════════════════════════════════════
   AGENDA — Google Sheets integration
   ═══════════════════════════════════════════════════════════

   A planilha deve ter as seguintes colunas (linha 1 = cabeçalho):
   A: data          → formato DD/MM/AAAA  ex: 15/06/2024
   B: hora          → formato HH:MM       ex: 10:00
   C: adversario    → texto               ex: Unidos do Méier
   D: campo         → texto               ex: Campo do Méier
   E: endereco      → texto               ex: Méier, RJ
   F: status        → agendado | realizado | cancelado
   G: placar_casa   → número (vazio se não realizado)
   H: placar_visit  → número (vazio se não realizado)
   I: observacao    → texto livre (opcional)
*/

async function fetchJogosFromSheets() {
  if (!SHEETS_ID || SHEETS_ID === "SEU_ID_DA_PLANILHA_AQUI") return null;

  // Cache local para não buscar a cada reload
  const CACHE_KEY = "rc_jogos_cache";
  const CACHE_TS  = "rc_jogos_ts";
  const TTL_MS    = (CONFIG.cacheTTL || 15) * 60 * 1000;

  const cached = sessionStorage.getItem(CACHE_KEY);
  const ts     = parseInt(sessionStorage.getItem(CACHE_TS) || "0");

  if (cached && Date.now() - ts < TTL_MS) {
    return JSON.parse(cached);
  }

  // URL pública do Sheets exportada como CSV (aba 1, sem autenticação)
  const url = `https://docs.google.com/spreadsheets/d/${SHEETS_ID}/gviz/tq?tqx=out:csv&sheet=Jogos`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const csv  = await resp.text();
    const jogos = parseSheetCSV(csv);
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(jogos));
    sessionStorage.setItem(CACHE_TS,  Date.now().toString());
    return jogos;
  } catch (err) {
    console.warn("Real Carioca: erro ao buscar planilha →", err.message);
    return null;
  }
}

function parseSheetCSV(csv) {
  const lines = csv.trim().split("\n");
  // Pula linha de cabeçalho (linha 1)
  const dataLines = lines.slice(1).filter(l => l.trim() !== "");

  return dataLines.map((line, idx) => {
    const cols = parseCSVLine(line);

    const rawData   = (cols[0] || "").replace(/"/g, "").trim(); // DD/MM/AAAA
    const hora      = (cols[1] || "").replace(/"/g, "").trim();
    const adversario= (cols[2] || "").replace(/"/g, "").trim();
    const campo     = (cols[3] || "").replace(/"/g, "").trim();
    const endereco  = (cols[4] || "").replace(/"/g, "").trim();
    const status    = (cols[5] || "agendado").replace(/"/g, "").trim().toLowerCase();
    const pCasa     = (cols[6] || "").replace(/"/g, "").trim();
    const pVisit    = (cols[7] || "").replace(/"/g, "").trim();
    const obs       = (cols[8] || "").replace(/"/g, "").trim();

    // Converte DD/MM/AAAA → AAAA-MM-DD
    let dataISO = "";
    if (rawData) {
      const partes = rawData.split("/");
      if (partes.length === 3) dataISO = `${partes[2]}-${partes[1].padStart(2,"0")}-${partes[0].padStart(2,"0")}`;
    }

    return {
      id:               idx + 1,
      data:             dataISO,
      hora:             hora,
      adversario:       adversario,
      campo:            campo,
      endereco:         endereco,
      status:           status || "agendado",
      placarCasa:       pCasa !== "" ? parseInt(pCasa) : null,
      placarVisitante:  pVisit !== "" ? parseInt(pVisit) : null,
      observacao:       obs,
    };
  }).filter(j => j.adversario && j.data); // ignora linhas vazias
}

/* Parser de CSV respeitando aspas e vírgulas dentro de campos */
function parseCSVLine(line) {
  const result = [];
  let current = "", inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current); current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/* ─── AGENDA (render) ─────────────────────────────────────── */
async function initAgenda() {
  const grid      = document.getElementById("jogosGrid");
  const empty     = document.getElementById("agendaEmpty");
  const filterBtns= document.querySelectorAll(".filter-btn");
  const countEl   = document.getElementById("jogos-count");

  // Mostra loading enquanto busca
  grid.innerHTML = `
    <div class="agenda-loading">
      <div class="loading-spinner"></div>
      <p>Carregando jogos...</p>
    </div>`;

  // Tenta buscar do Sheets; cai no arquivo local se não configurado
  let jogos = await fetchJogosFromSheets();

  if (!jogos) {
    // Fallback: usa array local do jogos.js (compatibilidade)
    jogos = (typeof JOGOS !== "undefined") ? JOGOS : [];
    if (SHEETS_ID === "SEU_ID_DA_PLANILHA_AQUI" && jogos.length === 0) {
      grid.innerHTML = "";
      empty.style.display = "block";
      empty.innerHTML = `Nenhum jogo encontrado.`;
      return;
    }
  }

  if (countEl) animateCount(countEl, jogos.length);

  let filtroAtivo = "todos";

  function renderJogos(filter) {
    filtroAtivo = filter;
    const filtered = filter === "todos" ? jogos : jogos.filter(j => j.status === filter);

    // ordenação por data ASC (do mais próximo ao mais distante)
    //filtered.sort((a, b) => new Date(a.data) - new Date(b.data));

    // ordenação por data DESC (do mais distante ao mais próximo)
    filtered.sort((a, b) => new Date(b.data) - new Date(a.data));

    const limitados = filtered.slice(0, CONFIG.jogosQuantidade || 20);

    grid.innerHTML = "";

    if (limitados.length === 0) {
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";

    limitados.forEach((jogo, idx) => {
      const dataObj  = new Date(jogo.data + "T" + (jogo.hora || "00:00") + ":00");
      const hoje     = new Date();
      const isFuturo = dataObj >= hoje;

      const dia = String(dataObj.getDate()).padStart(2, "0");
      const mes = dataObj.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase();
      const hora = jogo.hora || "";

      let statusClass = "", statusLabel = "", placarHTML = "";

      if (jogo.status === "realizado") {
        statusClass = "status-realizado";
        statusLabel = "Realizado";
        if (jogo.placarCasa !== null && jogo.placarVisitante !== null) {
          const ganhou   = jogo.placarCasa > jogo.placarVisitante;
          const empatou  = jogo.placarCasa === jogo.placarVisitante;
          const rClass   = ganhou ? "resultado-vitoria" : empatou ? "resultado-empate" : "resultado-derrota";
          const rLabel   = ganhou ? "Vitória" : empatou ? "Empate" : "Derrota";
          placarHTML = `
            <div class="placar ${rClass}">
              <span class="placar-times">${CONFIG.nomeTime} <strong>${jogo.placarCasa} × ${jogo.placarVisitante}</strong> ${jogo.adversario}</span>
              <span class="placar-resultado">${rLabel}</span>
            </div>`;
        }
      } else if (jogo.status === "agendado") {
        statusClass = "status-agendado";
        statusLabel = isFuturo ? "Confirmado" : "Aguardando Resultado";
      } else if (jogo.status === "cancelado") {
        statusClass = "status-cancelado";
        statusLabel = "Cancelado";
      }

      const card = document.createElement("div");
      card.className = `jogo-card ${jogo.status} fade-in`;
      card.style.animationDelay = `${idx * 0.07}s`;
      card.innerHTML = `
        <div class="jogo-data-box">
          <span class="jogo-dia">${dia}</span>
          <span class="jogo-mes">${mes}</span>
        </div>
        <div class="jogo-info">
          <div class="jogo-header">
            <span class="jogo-vs">${CONFIG.nomeTime} <em>vs</em> ${jogo.adversario}</span>
            <span class="jogo-status ${statusClass}">${statusLabel}</span>
          </div>
          <div class="jogo-detalhes">
            ${hora ? `<span>🕐 ${hora}</span>` : ""}
            <span>📍 ${jogo.campo}</span>
            ${jogo.endereco ? `<span class="jogo-endereco">${jogo.endereco}</span>` : ""}
          </div>
          ${jogo.observacao ? `<p class="jogo-obs">${jogo.observacao}</p>` : ""}
          ${placarHTML}
        </div>`;
      grid.appendChild(card);
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderJogos(btn.dataset.filter);
    });
  });

  renderJogos("todos");

  // Botão de atualizar (aparece após carregamento)
  const refreshBtn = document.createElement("button");
  refreshBtn.className = "refresh-btn";
  refreshBtn.innerHTML = "↻ Atualizar jogos";
  refreshBtn.addEventListener("click", async () => {
    sessionStorage.removeItem("rc_jogos_cache");
    sessionStorage.removeItem("rc_jogos_ts");
    refreshBtn.textContent = "Carregando...";
    refreshBtn.disabled = true;
    jogos = await fetchJogosFromSheets() || jogos;
    renderJogos(filtroAtivo);
    if (countEl) countEl.textContent = jogos.length;
    refreshBtn.innerHTML = "↻ Atualizar jogos";
    refreshBtn.disabled = false;
  });
  grid.parentElement.appendChild(refreshBtn);
}

/* ─── FORMULÁRIO ──────────────────────────────────────────── */
function initForm() {
  const form      = document.getElementById("desafioForm");
  const success   = document.getElementById("formSuccess");
  const btnText   = form.querySelector(".btn-text");
  const btnLoading= form.querySelector(".btn-loading");

  const dataInput = document.getElementById("data");
  if (dataInput) dataInput.min = new Date().toISOString().split("T")[0];

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const action = form.getAttribute("action");
    if (action.includes("SEU_ID_AQUI")) {
      alert("⚠️ Configure o Formspree!\n\n1. Acesse formspree.io\n2. Crie um novo form\n3. Substitua 'SEU_ID_AQUI' no index.html pelo ID gerado");
      return;
    }

    btnText.style.display    = "none";
    btnLoading.style.display = "inline";

    try {
      const resp = await fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      if (resp.ok) {
        form.querySelectorAll("input, textarea, button").forEach(el => el.style.display = "none");
        form.querySelector(".form-note").style.display = "none";
        success.style.display = "flex";
      } else throw new Error();
    } catch {
      btnText.style.display    = "inline";
      btnLoading.style.display = "none";
      alert("Erro ao enviar. Tente novamente.");
    }
  });
}

/* ─── SCROLL ANIMATIONS ───────────────────────────────────── */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => e.isIntersecting && e.target.classList.add("visible")),
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );
  document.querySelectorAll(".historia-text, .historia-visual, .desafio-text, .desafio-form")
    .forEach(el => { el.classList.add("animate-on-scroll"); observer.observe(el); });
}

/* ─── UTILS ───────────────────────────────────────────────── */
function animateCount(el, target) {
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      let count = 0;
      const step  = Math.ceil(target / 40);
      const timer = setInterval(() => {
        count = Math.min(count + step, target);
        el.textContent = count;
        if (count >= target) clearInterval(timer);
      }, 40);
      observer.disconnect();
    }
  });
  observer.observe(el);
}
