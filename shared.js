// ── shared.js — state, nav, styles, signal-processing utils ──

// ── Navigation ─────────────────────────────────────────────────
const PAGES = ['step1.html','step2.html','step3.html','step4.html'];

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
  const style = document.createElement('style');
  style.textContent = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f0f10;color:#e2e2e5;min-height:100vh;padding:0 0 60px}
    a{color:inherit;text-decoration:none}

    /* Progress nav */
    .progress-nav{display:flex;align-items:center;justify-content:center;padding:28px 24px 20px;gap:0}
    .step-node{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;opacity:.45;transition:opacity .2s}
    .step-node.done{opacity:.7}
    .step-node.active{opacity:1}
    .step-dot{width:32px;height:32px;border-radius:50%;border:2px solid #3a3a42;background:#1a1a1f;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#888;transition:all .2s}
    .step-node.done .step-dot{background:#1a3a2a;border-color:#1d9e75;color:#1d9e75}
    .step-node.active .step-dot{background:#1a2a3a;border-color:#378ADD;color:#378ADD;box-shadow:0 0 0 3px rgba(55,138,221,.18)}
    .step-lbl{font-size:11px;font-weight:500;color:#888;letter-spacing:.04em;text-transform:uppercase}
    .step-node.active .step-lbl{color:#ccc}
    .step-line{flex:1;height:2px;background:#2a2a32;min-width:24px;max-width:80px;transition:background .2s}
    .step-line.done{background:#1d9e75}

    /* Page shell */
    .page{max-width:780px;margin:0 auto;padding:0 20px}
    .page-header{padding:8px 0 28px}
    .page-title{font-size:22px;font-weight:600;color:#f0f0f3;margin-bottom:6px}
    .page-sub{font-size:14px;color:#888;line-height:1.5}

    /* Cards */
    .card{background:#1a1a1f;border:0.5px solid #2e2e38;border-radius:14px;padding:22px;margin-bottom:16px}
    .card-title{font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#666;margin-bottom:14px}

    /* Buttons */
    button{cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;padding:9px 18px;border-radius:8px;border:0.5px solid #3a3a42;background:#22222a;color:#ddd;transition:all .15s;display:inline-flex;align-items:center;gap:7px}
    button:hover:not(:disabled){background:#2a2a35;border-color:#4a4a58;color:#fff}
    button:disabled{opacity:.35;cursor:not-allowed}
    button.primary{background:#1a2a3a;border-color:#378ADD;color:#6cb8f5}
    button.primary:hover:not(:disabled){background:#1e3248;color:#8ecfff}
    button.danger{background:#2a1a1a;border-color:#7a2a2a;color:#f08080}
    .btn-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;align-items:center}

    /* Status badges */
    .badge{display:inline-flex;align-items:center;gap:5px;font-size:12px;padding:3px 10px;border-radius:20px;font-weight:500}
    .badge-ok{background:#0d2a1e;color:#1d9e75;border:0.5px solid #1d9e75}
    .badge-warn{background:#2a1e08;color:#c98a20;border:0.5px solid #c98a20}
    .badge-err{background:#2a0d0d;color:#e24b4a;border:0.5px solid #e24b4a}
    .badge-info{background:#0d1a2a;color:#378ADD;border:0.5px solid #378ADD}
    .badge-neu{background:#1e1e26;color:#888;border:0.5px solid #3a3a42}

    /* Meters */
    .meter{margin:7px 0}
    .meter-lbl{display:flex;justify-content:space-between;font-size:12px;color:#888;margin-bottom:4px}
    .meter-track{height:6px;background:#23232d;border-radius:3px;overflow:hidden}
    .meter-fill{height:100%;border-radius:3px;transition:width .5s ease}

    /* Mono / code */
    .mono{font-family:'SF Mono',Menlo,Consolas,monospace;font-size:11px;color:#9090a8;background:#13131a;border-radius:8px;padding:12px;line-height:1.7;white-space:pre-wrap;word-break:break-all}
    code{font-family:'SF Mono',Menlo,Consolas,monospace;font-size:11px;background:#23232d;padding:2px 6px;border-radius:4px;color:#a0b4d0}

    /* Canvas waveform */
    canvas.wave{display:block;width:100%;height:60px;background:#13131a;border-radius:8px;margin:8px 0}

    /* Phrase display */
    .phrase{font-size:16px;font-weight:500;color:#e8e8f0;background:#13131a;border-radius:8px;padding:12px 16px;margin:10px 0;border-left:3px solid #378ADD;line-height:1.5}

    /* Token diff */
    .token-ok{display:inline-block;padding:1px 5px;border-radius:4px;background:#0d2a1e;color:#1d9e75;font-family:monospace;font-size:12px;margin:1px}
    .token-bad{display:inline-block;padding:1px 5px;border-radius:4px;background:#2a0d0d;color:#e24b4a;font-family:monospace;font-size:12px;margin:1px}
    .transcript-box{background:#13131a;border-radius:8px;padding:10px 14px;font-size:13px;line-height:1.8;min-height:36px;margin:6px 0}

    /* Embed heatmap */
    .eviz{display:grid;grid-template-columns:repeat(32,1fr);gap:2px;margin:6px 0}
    .eviz div{height:13px;border-radius:1px}

    /* Nav footer */
    .footer-nav{position:fixed;bottom:0;left:0;right:0;background:#0f0f10;border-top:0.5px solid #2e2e38;padding:12px 24px;display:flex;justify-content:space-between;align-items:center;z-index:100}
    .footer-nav span{font-size:12px;color:#555}

    /* Misc */
    .sep{border-top:0.5px solid #2e2e38;margin:16px 0;padding-top:16px}
    .row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .col2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .pend{color:#555;font-size:13px;font-style:italic}
    .rdot{width:7px;height:7px;border-radius:50%;background:#e24b4a;display:inline-block;animation:bl 1s infinite}
    @keyframes bl{0%,100%{opacity:1}50%{opacity:.2}}
    .info-box{background:#0d1a2a;border:0.5px solid #1a3050;border-radius:8px;padding:12px 14px;font-size:12px;color:#7090b0;line-height:1.7;margin-top:10px}
    @media(max-width:540px){.col2{grid-template-columns:1fr}.footer-nav{padding:10px 14px}}
  `;
  document.head.appendChild(style);
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
