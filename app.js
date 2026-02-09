
const STORAGE_KEY = "rg_percorso_v2";

function loadState(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch(e){ return {}; }
}
function saveState(state){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function setProgress(pageId){
  const order = window.__RG_ORDER || [];
  const idx = Math.max(0, order.indexOf(pageId));
  const pct = order.length ? Math.round(((idx+1)/order.length)*100) : 0;
  const bar = document.querySelector(".bar > span");
  const label = document.querySelector("[data-progress]");
  if(bar){ bar.style.width = pct + "%"; }
  if(label){ label.textContent = `Step ${idx+1} / ${order.length}`; }
}
function bindQA(pageId){
  const state = loadState();
  const root = document.querySelector("[data-qa]");
  if(!root) return;

  // restore inputs
  root.querySelectorAll("[data-qid]").forEach(block=>{
    const qid = block.dataset.qid;
    const stored = state[pageId]?.[qid];
    if(stored === undefined) return;
    const type = block.dataset.type;

    if(type === "mc"){
      const inp = block.querySelector(`input[value="${stored}"]`);
      if(inp) inp.checked = true;
    } else if(type === "text"){
      const ta = block.querySelector("textarea");
      if(ta) ta.value = stored;
    } else if(type === "fill"){
      const it = block.querySelector('input[type="text"]');
      if(it) it.value = stored;
    }
  });

  // handlers
  root.querySelectorAll("[data-save]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const qid = btn.dataset.save;
      const block = root.querySelector(`[data-qid="${qid}"]`);
      const type = block.dataset.type;
      const correct = block.dataset.correct;
      let value = null;

      if(type === "mc"){
        const checked = block.querySelector("input[type='radio']:checked");
        value = checked ? checked.value : "";
      } else if(type === "text"){
        value = (block.querySelector("textarea")?.value || "").trim();
      } else if(type === "fill"){
        value = (block.querySelector('input[type="text"]')?.value || "").trim();
      }

      state[pageId] = state[pageId] || {};
      state[pageId][qid] = value;
      saveState(state);

      const out = block.querySelector("[data-out]");
      if(out){
        if(type === "mc"){
          const ok = (value !== "" && correct !== undefined && String(value) === String(correct));
          out.textContent = value === "" ? "Salvato. (Scegli una risposta.)" : (ok ? "✔️ Corretto." : "✖️ Non proprio. Rileggi e riprova.");
        } else if(type === "fill"){
          const ok = correct && value.toLowerCase() === correct.toLowerCase();
          out.textContent = value === "" ? "Salvato." : (ok ? "✔️ Esatto." : "✖️ Quasi: prova a rileggerlo.");
        } else {
          out.textContent = "✔️ Salvato.";
        }
      }
    });
  });

  root.querySelectorAll("[data-reset]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    });
  });
}

function init(){
  const pageId = document.body.dataset.page;
  setProgress(pageId);
  bindQA(pageId);
}
document.addEventListener("DOMContentLoaded", init);
