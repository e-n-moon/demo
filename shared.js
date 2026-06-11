// ── shared.js — state, nav, styles, signal-processing utils ──

// ── Navigation ─────────────────────────────────────────────────
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

// ── Session state (persisted across pages) ─────────────────────
const State = {
  get(k)    { try { return JSON.parse(sessionStorage.getItem('va_'+k)); } catch { return null; } },
  set(k,v)  { sessionStorage.setItem('va_'+k, JSON.stringify(v)); },
  clear()   { Object.keys(sessionStorage).filter(k=>k.startsWith('va_')).forEach(k=>sessionStorage.removeItem(k)); },
  // typed helpers for Float32Arrays (not JSON-serialisable natively)
  setF32(k,arr) { sessionStorage.setItem('va_'+k, JSON.stringify(Array.from(arr))); },
  getF32(k)     { const v=State.get(k); return v ? new Float32Array(v) : null; },
};

// ── Progress bar renderer ──────────────────────────────────────
function renderProgress(currentStep) {
  const steps = ['Challenge','Device','Voice','Risk'];
  return `<nav class="progress-nav">
    ${steps.map((s,i)=>{
      const n=i+1;
      const cls = n<currentStep?'done': n===currentStep?'active':'';
      const href = PAGES[i];
      return `<a href="${href}" class="step-node ${cls}">
        <span class="step-dot">${n<currentStep?'✓':n}</span>
        <span class="step-lbl">${s}</span>
      </a>${i<steps.length-1?'<div class="step-line '+(n<currentStep?'done':'')+'"></div>':''}`;
    }).join('')}
  </nav>`;
}

// ── Shared CSS (injected into <head>) ──────────────────────────
function injectSharedCSS() {
  if (document.getElementById('shared-css')) return;

  const style = document.createElement('style');
  style.id = 'shared-css';

  style.textContent = `
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --bg: #C8D8E4;          /* homepage base */
      --paper: #FFF6DD;       /* pale yellow overlay */
      --ink: rgba(0,0,0,0.88);
      --muted: rgba(0,0,0,0.55);
      --faint: rgba(0,0,0,0.12);
      --accent: #2EC7FF;
      --accent2: #E7C86A;
    }

    html, body {
      min-height: 100vh;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
      background: linear-gradient(180deg, var(--bg) 0%, var(--paper) 100%);
      color: var(--ink);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      padding: 80px 24px 80px;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    /* ───────────── Progress Nav (editorial, thin, minimal) ───────────── */
    .progress-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 28px 0 18px;
    }

    .step-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      opacity: 0.4;
      transition: opacity 0.2s ease;
    }

    .step-node.active { opacity: 1; }
    .step-node.done { opacity: 0.65; }

    .step-dot {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid var(--faint);
      background: rgba(255,255,255,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 500;
      color: var(--muted);
    }

    .step-node.active .step-dot {
      border-color: var(--accent2);
      color: var(--ink);
      background: rgba(255, 246, 221, 0.8);
    }

    .step-node.done .step-dot {
      color: rgba(0,0,0,0.6);
    }

    .step-lbl {
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
    }

    .step-line {
      width: 64px;
      height: 1px;
      background: var(--faint);
      margin: 0 6px;
    }

    .step-line.done {
      background: rgba(0,0,0,0.25);
    }

    /* ───────────── Page layout (match homepage spacing) ───────────── */
    .page {
      max-width: 780px;
      margin: 0 auto;
      padding: 0 0;
    }

    .page-header {
      padding: 10px 0 28px;
    }

    .page-title {
      font-size: 20px;
      font-weight: 500;
      letter-spacing: 0.01em;
      color: var(--ink);
    }

    .page-sub {
      font-size: 14px;
      line-height: 1.7;
      color: var(--muted);
      margin-top: 6px;
    }

    /* ───────────── Cards (thin editorial boxes) ───────────── */
    .card {
      border-top: 1px solid var(--faint);
      border-bottom: 1px solid var(--faint);
      padding: 18px 0;
      margin-bottom: 18px;
    }

    .card-title {
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 12px;
    }

    /* ───────────── Buttons (text-first, subtle) ───────────── */
    button {
      font-family: inherit;
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;

      padding: 8px 14px;
      border: 1px solid var(--faint);
      background: rgba(255,255,255,0.5);
      color: var(--ink);

      cursor: pointer;
      transition: all 0.15s ease;
    }

    button:hover:not(:disabled) {
      border-color: var(--accent);
      color: var(--accent);
    }

    button.primary {
      border-color: var(--accent2);
      background: rgba(231, 200, 106, 0.25);
    }

    button.danger {
      border-color: rgba(180,0,0,0.3);
      color: rgba(180,0,0,0.7);
    }

    .btn-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 14px;
    }

    /* ───────────── Badges (quiet, editorial) ───────────── */
    .badge {
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 3px 8px;
      border: 1px solid var(--faint);
      color: var(--muted);
    }

    .badge-ok { border-color: rgba(0,100,0,0.3); }
    .badge-warn { border-color: rgba(160,120,0,0.4); }
    .badge-err { border-color: rgba(160,0,0,0.3); }

    /* ───────────── Meters (thin journal style) ───────────── */
    .meter {
      margin: 8px 0;
    }

    .meter-lbl {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--muted);
      margin-bottom: 4px;
    }

    .meter-track {
      height: 2px;
      background: var(--faint);
    }

    .meter-fill {
      height: 2px;
      background: var(--ink);
    }

    /* ───────────── Text blocks ───────────── */
    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px;
      background: rgba(255,255,255,0.4);
      padding: 12px;
      border-top: 1px solid var(--faint);
      border-bottom: 1px solid var(--faint);
      white-space: pre-wrap;
    }

    .phrase {
      font-size: 15px;
      line-height: 1.6;
      padding: 10px 0;
      border-left: 2px solid var(--accent2);
      padding-left: 12px;
      margin: 10px 0;
    }

    .transcript-box {
      font-size: 13px;
      padding: 10px 0;
      border-top: 1px solid var(--faint);
      border-bottom: 1px solid var(--faint);
    }

    /* ───────────── Token styling ───────────── */
    .token-ok {
      color: rgba(0,120,0,0.75);
    }

    .token-bad {
      color: rgba(160,0,0,0.7);
    }

    /* ───────────── Footer ───────────── */
    .footer-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;

      background: rgba(255, 246, 221, 0.85);
      border-top: 1px solid var(--faint);

      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-nav span {
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted);
    }

    /* ───────────── Responsive ───────────── */
    @media (max-width: 540px) {
      body { padding: 70px 14px 80px; }
    }
  `;

  document.head.appendChild(style);
}
}
}
// ── Signal processing utils ────────────────────────────────────
function rfft(x) {
  const N=x.length, re=new Float32Array(x), im=new Float32Array(N);
  for(let i=1,j=0;i<N;i++){let b=N>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){let t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t;}}
  for(let len=2;len<=N;len<<=1){const a=2*Math.PI/len,wr=Math.cos(a),wi=-Math.sin(a);for(let i=0;i<N;i+=len){let cr=1,ci=0;for(let j=0;j<len/2;j++){const ur=re[i+j],ui=im[i+j],vr=re[i+j+len/2]*cr-im[i+j+len/2]*ci,vi=re[i+j+len/2]*ci+im[i+j+len/2]*cr;re[i+j]=ur+vr;im[i+j]=ui+vi;re[i+j+len/2]=ur-vr;im[i+j+len/2]=ui-vi;const nc=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=nc;}}}
  const pw=new Float32Array(N/2+1);for(let i=0;i<pw.length;i++)pw[i]=re[i]*re[i]+im[i]*im[i];return pw;
}

const NM=80, FRAME=400, HOP=160, NFFT=512, TF=200;
let _fb=null;
function getMelFB() {
  if(_fb) return _fb;
  const sr=16000,nyq=sr/2;
  const hz2mel=h=>2595*Math.log10(1+h/700);
  const mel2hz=m=>700*(Math.pow(10,m/2595)-1);
  const mlo=hz2mel(20),mhi=hz2mel(nyq);
  const pts=Array.from({length:NM+2},(_,i)=>Math.floor((NFFT/2+1)*mel2hz(mlo+(mhi-mlo)*i/(NM+1))/nyq));
  _fb=[];
  for(let m=1;m<=NM;m++){
    const f=new Float32Array(NFFT/2+1);
    for(let k=pts[m-1];k<pts[m];k++)f[k]=(k-pts[m-1])/(pts[m]-pts[m-1]||1);
    for(let k=pts[m];k<pts[m+1];k++)f[k]=(pts[m+1]-k)/(pts[m+1]-pts[m]||1);
    _fb.push(f);
  }
  return _fb;
}

function extractFeatures(pcm) {
  const fb=getMelFB(), frames=[];
  for(let s=0;s+FRAME<=pcm.length&&frames.length<TF;s+=HOP){
    const frame=new Float32Array(NFFT);
    for(let i=0;i<FRAME;i++)frame[i]=pcm[s+i]*(0.5*(1-Math.cos(2*Math.PI*i/(FRAME-1))));
    const pw=rfft(frame);
    const mel=new Float32Array(NM);
    for(let m=0;m<NM;m++){let e=0;for(let k=0;k<pw.length;k++)e+=fb[m][k]*pw[k];mel[m]=Math.log(Math.max(e,1e-10));}
    frames.push(mel);
  }
  while(frames.length<TF) frames.push(new Float32Array(NM));
  const out=new Float32Array(NM*TF);
  for(let t=0;t<TF;t++) for(let m=0;m<NM;m++) out[m*TF+t]=frames[t][m];
  return out;
}

function computeLiveness(pcm) {
  const frameE=[], frameSC=[];
  for(let s=0;s+FRAME<=pcm.length;s+=HOP){
    const frame=new Float32Array(NFFT);
    for(let i=0;i<FRAME;i++)frame[i]=pcm[s+i]*(0.5*(1-Math.cos(2*Math.PI*i/(FRAME-1))));
    const pw=rfft(frame);
    let e=0,wc=0,tc=0;
    for(let k=0;k<pw.length;k++){e+=pw[k];wc+=k*pw[k];tc+=pw[k];}
    frameE.push(Math.sqrt(e/pw.length));
    frameSC.push(tc>0?wc/tc:0);
  }
  if(frameE.length<4) return {score:0.5,specVar:0,pitchFlux:0,energyDyn:0};
  const meanE=frameE.reduce((a,b)=>a+b,0)/frameE.length;
  const varE=frameE.reduce((a,b)=>a+(b-meanE)**2,0)/frameE.length;
  const energyDyn=Math.min(1,Math.sqrt(varE)/(meanE+1e-6));
  let sf=0;for(let i=1;i<frameSC.length;i++)sf+=Math.abs(frameSC[i]-frameSC[i-1]);
  const specVar=Math.min(1,sf/(frameSC.length*50+1));
  const voiced=frameE.map(e=>e>meanE*0.3);
  let pf=0,vc=0;for(let i=1;i<frameSC.length;i++){if(voiced[i]&&voiced[i-1]){pf+=Math.abs(frameSC[i]-frameSC[i-1]);vc++;}}
  const pitchFlux=Math.min(1,pf/((vc||1)*30));
  const raw=energyDyn*0.35+specVar*0.35+pitchFlux*0.3;
  return {score:Math.min(1,Math.max(0,0.35+raw*0.9)),specVar,pitchFlux,energyDyn};
}

function cosSim(a,b){let d=0,na=0,nb=0;for(let i=0;i<a.length;i++){d+=a[i]*b[i];na+=a[i]*a[i];nb+=b[i]*b[i];}return d/(Math.sqrt(na*nb)||1);}

function meterHTML(lbl,val,color){
  const p=Math.round(val);
  const c=color||(p>=82?'#1d9e75':p>=65?'#c98a20':'#e24b4a');
  return `<div class="meter"><div class="meter-lbl"><span>${lbl}</span><span>${p}%</span></div><div class="meter-track"><div class="meter-fill" style="width:${p}%;background:${c}"></div></div></div>`;
}

function embedVizHTML(emb, label) {
  const arr=Array.from(emb).slice(0,128);
  const mn=Math.min(...arr),mx=Math.max(...arr),rng=mx-mn||1;
  let cells='';
  arr.forEach((v,i)=>{
    const t=(v-mn)/rng;
    cells+=`<div title="d${i}:${v.toFixed(3)}" style="background:rgb(${Math.round(55+t*180)},${Math.round(80+t*80)},${Math.round(200-t*120)})"></div>`;
  });
  return `<p style="font-size:11px;color:#555;margin:8px 0 3px">${label} (first 128 of ${emb.length} dims)</p><div class="eviz">${cells}</div>`;
}

function normalise(s){return s.toLowerCase().replace(/[^a-z0-9 ]/g,'').trim();}
function tokenize(s){return s.split(/\s+/).filter(Boolean);}

function checkChallenge(transcript, phrase) {
  if(!transcript) return 0;
  const ref=tokenize(normalise(phrase)), hyp=tokenize(normalise(transcript));
  if(!hyp.length) return 0;
  let m=0; const used=new Array(hyp.length).fill(false);
  ref.forEach(w=>{const i=hyp.findIndex((h,j)=>!used[j]&&h===w);if(i>=0){m++;used[i]=true;}});
  const p=m/Math.max(hyp.length,1), r=m/Math.max(ref.length,1);
  return(p+r)?2*p*r/(p+r):0;
}

function diffTokensHTML(ref, hyp) {
  if(!hyp) return '<span style="color:#555;font-style:italic">no transcript</span>';
  const rT=tokenize(normalise(ref)), hT=tokenize(normalise(hyp));
  const used=new Array(rT.length).fill(false);
  const out=hT.map(h=>{
    const i=rT.findIndex((r,j)=>!used[j]&&r===h);
    if(i>=0){used[i]=true;return `<span class="token-ok">${h}</span>`;}
    return `<span class="token-bad">${h}</span>`;
  });
  return out.length?out.join(' '):'<span style="color:#555;font-style:italic">empty</span>';
}
