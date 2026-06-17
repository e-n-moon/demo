// ── shared.js ──

const PAGES = ['index.html','step2.html','step3.html','step4.html'];

function goTo(page) { window.location.href = page; }
function goNext() {
  const cur = PAGES.indexOf(location.pathname.split('/').pop());
  if (cur < PAGES.length - 1) goTo(PAGES[cur + 1]);
}
function goPrev() {
  const cur = PAGES.indexOf(location.pathname.split('/').pop());
  if (cur > 0) goTo(PAGES[cur - 1]);
}

// ── State ──
const State = {
  get(k) {
    try { return JSON.parse(sessionStorage.getItem('va_'+k)); }
    catch { return null; }
  },
  set(k,v) {
    sessionStorage.setItem('va_'+k, JSON.stringify(v));
  },
  clear() {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith('va_')) sessionStorage.removeItem(k);
    }
  },
  setF32(k,arr) {
    sessionStorage.setItem('va_'+k, JSON.stringify(Array.from(arr)));
  },
  getF32(k) {
    const v = State.get(k);
    return v ? new Float32Array(v) : null;
  }
};

// ── Progress ──
function renderProgress(currentStep) {
  const steps = ['Challenge','Device','Voice','Risk'];

  return `<nav class="progress-nav">
    ${steps.map((s,i)=>{
      const n=i+1;
      const cls = n<currentStep?'done': n===currentStep?'active':'';
      return `<a href="${PAGES[i]}" class="step-node ${cls}">
        <span class="step-dot">${n<currentStep?'✓':n}</span>
        <span class="step-lbl">${s}</span>
      </a>`;
    }).join('')}
  </nav>`;
}

// ── CSS ──
function injectSharedCSS() {
  const style = document.createElement('style');
  style.textContent = `body{font-family:sans-serif;background:#0f0f10;color:#e2e2e5}`;
  document.head.appendChild(style);
}
