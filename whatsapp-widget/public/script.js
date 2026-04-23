(function () {
  "use strict";

  /* ─────────────────────────────────────────────────────────────────
     1. LOCALIZA A PRÓPRIA TAG <script> E LÊ OS data-*
     O segredo: document.currentScript aponta para o <script> que está
     sendo executado agora. É assim que o script "sabe" sua configuração.
  ───────────────────────────────────────────────────────────────── */
  const tag = document.currentScript;

  if (!tag) {
    console.warn("[WhatsWidget] Não foi possível localizar a tag <script>.");
    return;
  }

  const cfg = {
    numero:   tag.getAttribute("data-numero")   || "",
    mensagem: tag.getAttribute("data-mensagem") || "Olá, vim do site!",
    webhook:  tag.getAttribute("data-webhook")  || "",
    campoNome:      tag.getAttribute("data-campo-integrado-nome")      || "nome",
    campoTelefone:  tag.getAttribute("data-campo-integrado-telefone")  || "telefone",
    cor:      tag.getAttribute("data-cor")      || "#25d366",
  };

  if (!cfg.numero) {
    console.warn("[WhatsWidget] data-numero é obrigatório.");
    return;
  }

  /* ─────────────────────────────────────────────────────────────────
     2. LÊ OS CAMPOS PERSONALIZADOS
     Suporta data-campo-personalizado-N-nome / tipo / opcoes /
     placeholder / obrigatorio
  ───────────────────────────────────────────────────────────────── */
  function lerCamposPersonalizados() {
    const campos = [];
    const regex = /^data-campo-personalizado-(\d+)-(nome|tipo|opcoes|placeholder|obrigatorio)$/i;
    const temp  = {};

    for (let i = 0; i < tag.attributes.length; i++) {
      const attr  = tag.attributes[i];
      const match = attr.name.match(regex);
      if (!match) continue;

      const idx  = match[1];
      const prop = match[2].toLowerCase();
      if (!temp[idx]) temp[idx] = {};
      temp[idx][prop] = prop === "obrigatorio" ? attr.value === "true" : attr.value;
    }

    Object.keys(temp)
      .sort((a, b) => Number(a) - Number(b))
      .forEach(idx => {
        const c = temp[idx];
        if (c.nome) campos.push({
          nome:        c.nome,
          tipo:        c.tipo        || "text",
          opcoes:      c.opcoes      || "",
          placeholder: c.placeholder || "",
          obrigatorio: !!c.obrigatorio,
        });
      });

    return campos;
  }

  const camposExtras = lerCamposPersonalizados();

  /* ─────────────────────────────────────────────────────────────────
     3. INJETA O CSS
  ───────────────────────────────────────────────────────────────── */
  const css = `
    #_ww-wrap * { box-sizing: border-box; font-family: "Open Sans", sans-serif; }

    #_ww-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 99998;
      width: 56px; height: 56px; border-radius: 50%;
      background: ${cfg.cor}; color: #fff;
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      transition: transform .2s, background .2s;
    }
    #_ww-btn:hover { transform: scale(1.08); }

    #_ww-modal {
      position: fixed; bottom: 90px; right: 24px; z-index: 99999;
      width: 320px; background: #fff; border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      overflow: hidden;
      display: none;
      flex-direction: column;
    }
    #_ww-modal.open { display: flex; }

    #_ww-header {
      background: ${cfg.cor}; padding: 14px 16px;
      display: flex; align-items: center; gap: 12px;
      position: relative;
    }
    #_ww-header svg { flex-shrink: 0; }
    #_ww-header-text h4 { margin: 0; font-size: 14px; color: #fff; font-weight: 700; }
    #_ww-header-text span { font-size: 11px; color: rgba(255,255,255,.75); }
    #_ww-close {
      position: absolute; top: 10px; right: 12px;
      background: none; border: none; color: rgba(255,255,255,.8);
      font-size: 18px; cursor: pointer; line-height: 1; padding: 0;
    }

    #_ww-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }

    #_ww-body label { font-size: 12px; color: #555; display: block; margin-bottom: 4px; }
    #_ww-body input,
    #_ww-body select,
    #_ww-body textarea {
      width: 100%; padding: 8px 10px; font-size: 13px;
      border: 1.5px solid #e0e0e0; border-radius: 7px;
      color: #222; outline: none;
      transition: border-color .15s;
    }
    #_ww-body input:focus,
    #_ww-body select:focus,
    #_ww-body textarea:focus { border-color: ${cfg.cor}; }
    #_ww-body input.error,
    #_ww-body select.error { border-color: #e53e3e; }
    ._ww-err { font-size: 11px; color: #e53e3e; margin-top: 2px; display: block; }

    #_ww-submit {
      width: 100%; padding: 11px; border: none; border-radius: 8px;
      background: ${cfg.cor}; color: #fff; font-size: 14px; font-weight: 700;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      gap: 8px; transition: background .2s; margin-top: 4px;
    }
    #_ww-submit:hover { filter: brightness(1.08); }
    #_ww-submit:disabled { opacity: .6; cursor: not-allowed; }

    @keyframes _ww-spin { to { transform: rotate(360deg); } }
    ._ww-spinner {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.4);
      border-top-color: #fff; border-radius: 50%;
      animation: _ww-spin .7s linear infinite;
    }
  `;

  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ─────────────────────────────────────────────────────────────────
     4. INJETA O HTML
  ───────────────────────────────────────────────────────────────── */
  const iconSVG = `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>`;

  /* Monta os campos extras dinamicamente */
  let camposHTML = "";
  camposExtras.forEach(c => {
    const req = c.obrigatorio ? '<span style="color:#e53e3e">*</span>' : "";
    camposHTML += `<div>
      <label for="_ww_${c.nome}">${c.nome} ${req}</label>`;

    if (c.tipo === "select") {
      camposHTML += `<select id="_ww_${c.nome}" name="${c.nome}" ${c.obrigatorio ? "required" : ""}>
        <option value="">${c.placeholder || "Selecione..."}</option>
        ${c.opcoes.split(",").map(o => `<option value="${o.trim()}">${o.trim()}</option>`).join("")}
      </select>`;
    } else if (c.tipo === "textarea") {
      camposHTML += `<textarea id="_ww_${c.nome}" name="${c.nome}" rows="3"
        placeholder="${c.placeholder}" ${c.obrigatorio ? "required" : ""}></textarea>`;
    } else {
      camposHTML += `<input type="${c.tipo}" id="_ww_${c.nome}" name="${c.nome}"
        placeholder="${c.placeholder}" ${c.obrigatorio ? "required" : ""}>`;
    }

    camposHTML += `</div>`;
  });

  const html = `
    <div id="_ww-wrap">
      <div id="_ww-modal">
        <div id="_ww-header">
          ${iconSVG}
          <div id="_ww-header-text">
            <h4>Falar no WhatsApp</h4>
            <span>● online agora</span>
          </div>
          <button id="_ww-close" aria-label="Fechar">✕</button>
        </div>

        <div id="_ww-body">
          <div>
            <label for="_ww_nome">Nome <span style="color:#e53e3e">*</span></label>
            <input type="text" id="_ww_nome" name="${cfg.campoNome}" placeholder="Seu nome completo">
          </div>
          <div>
            <label for="_ww_telefone">Telefone <span style="color:#e53e3e">*</span></label>
            <input type="tel" id="_ww_telefone" name="${cfg.campoTelefone}" placeholder="(47) 99999-9999">
          </div>

          ${camposHTML}

          <button id="_ww-submit">${iconSVG.replace("28", "18").replace("28", "18")} Iniciar conversa</button>
        </div>
      </div>

      <button id="_ww-btn" aria-label="Abrir WhatsApp">
        ${iconSVG}
      </button>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);

  /* ─────────────────────────────────────────────────────────────────
     5. LÓGICA DE ABRIR / FECHAR
  ───────────────────────────────────────────────────────────────── */
  const modal  = document.getElementById("_ww-modal");
  const btn    = document.getElementById("_ww-btn");
  const close  = document.getElementById("_ww-close");
  const submit = document.getElementById("_ww-submit");

  btn.addEventListener("click",   () => modal.classList.toggle("open"));
  close.addEventListener("click", () => modal.classList.remove("open"));

  /* Fecha ao clicar fora */
  document.addEventListener("click", e => {
    if (!document.getElementById("_ww-wrap").contains(e.target)) {
      modal.classList.remove("open");
    }
  });

  /* ─────────────────────────────────────────────────────────────────
     6. CAPTURA UTMs DOS COOKIES / URL
  ───────────────────────────────────────────────────────────────── */
  function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : "";
  }

  function setCookie(name, value, days) {
    const exp = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${exp};path=/`;
  }

  (function salvarUtms() {
    const p = new URLSearchParams(window.location.search);
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term"];
    if (p.get("utm_source")) {
      utmKeys.forEach(k => setCookie(k, p.get(k) || "", 7));
    } else if (!getCookie("utm_source")) {
      setCookie("utm_source", document.referrer || "direct", 7);
      setCookie("utm_medium", document.referrer ? "referral" : "", 7);
    }
  })();

  /* ─────────────────────────────────────────────────────────────────
     7. SUBMIT — VALIDA, ENVIA WEBHOOK E ABRE WHATSAPP
  ───────────────────────────────────────────────────────────────── */
  submit.addEventListener("click", async () => {
    const nome     = document.getElementById("_ww_nome").value.trim();
    const telefone = document.getElementById("_ww_telefone").value.trim();

    /* limpa erros anteriores */
    document.querySelectorAll("._ww-err").forEach(e => e.remove());
    document.querySelectorAll("#_ww-wrap .error").forEach(e => e.classList.remove("error"));

    let valido = true;

    function erro(id, msg) {
      const el = document.getElementById(id);
      el.classList.add("error");
      const span = document.createElement("span");
      span.className = "_ww-err";
      span.textContent = msg;
      el.insertAdjacentElement("afterend", span);
      valido = false;
    }

    if (!nome)     erro("_ww_nome",     "Campo obrigatório");
    if (!telefone) erro("_ww_telefone", "Campo obrigatório");

    /* valida campos extras obrigatórios */
    camposExtras.forEach(c => {
      if (c.obrigatorio) {
        const el = document.getElementById(`_ww_${c.nome}`);
        if (el && !el.value.trim()) erro(`_ww_${c.nome}`, "Campo obrigatório");
      }
    });

    if (!valido) return;

    /* monta payload */
    const payload = {
      [cfg.campoNome]:      nome,
      [cfg.campoTelefone]:  telefone,
      utm_source:    getCookie("utm_source"),
      utm_medium:    getCookie("utm_medium"),
      utm_campaign:  getCookie("utm_campaign"),
      utm_term:      getCookie("utm_term"),
    };

    camposExtras.forEach(c => {
      const el = document.getElementById(`_ww_${c.nome}`);
      if (el) payload[c.nome] = el.value;
    });

    /* spinner */
    submit.disabled = true;
    submit.innerHTML = `<div class="_ww-spinner"></div> Aguarde...`;

    /* dispara webhook (se configurado) — não bloqueia a abertura do WhatsApp */
    if (cfg.webhook) {
      fetch(cfg.webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {}); /* silencia erros de rede */
    }

    /* monta mensagem e abre WhatsApp */
    let msg = cfg.mensagem + `\n\nNome: ${nome}\nTelefone: ${telefone}`;
    camposExtras.forEach(c => {
      const val = payload[c.nome];
      if (val) msg += `\n${c.nome}: ${val}`;
    });

    window.open(`https://wa.me/${cfg.numero}?text=${encodeURIComponent(msg)}`, "_blank");

    /* reseta form */
    setTimeout(() => {
      ["_ww_nome", "_ww_telefone"].forEach(id => (document.getElementById(id).value = ""));
      camposExtras.forEach(c => {
        const el = document.getElementById(`_ww_${c.nome}`);
        if (el) el.value = "";
      });
      submit.disabled = false;
      submit.innerHTML = `${iconSVG.replace("28","18").replace("28","18")} Iniciar conversa`;
      modal.classList.remove("open");
    }, 1500);
  });

})(); /* IIFE — não polui o escopo global */