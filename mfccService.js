function frameSignal(sig, size, hop){
  const frames = [];
  for(let i=0;i+size<sig.length;i+=hop){
    frames.push(sig.slice(i,i+size));
  }
  return frames;
}

function hamming(n,N){
  return 0.54 - 0.46*Math.cos((2*Math.PI*n)/(N-1));
}

function fft(signal){
  const N = signal.length;
  if(N <= 1) return signal.map(v=>({re:v,im:0}));

  const even = fft(signal.filter((_,i)=>i%2===0));
  const odd  = fft(signal.filter((_,i)=>i%2===1));

  const out = new Array(N);

  for(let k=0;k<N/2;k++){
    const t = -2*Math.PI*k/N;
    const exp = {re:Math.cos(t), im:Math.sin(t)};
    const o = odd[k];

    const tr = exp.re*o.re - exp.im*o.im;
    const ti = exp.re*o.im + exp.im*o.re;

    out[k] = {
      re: even[k].re + tr,
      im: even[k].im + ti
    };

    out[k+N/2] = {
      re: even[k].re - tr,
      im: even[k].im - ti
    };
  }

  return out;
}

function powerSpectrum(frame){
  const N = frame.length;
  const win = frame.map((v,i)=>v*hamming(i,N));
  const X = fft(win);

  const p = new Array(N/2);
  for(let i=0;i<N/2;i++){
    p[i] = X[i].re*X[i].re + X[i].im*X[i].im;
  }
  return p;
}

function hzToMel(h){ return 2595*Math.log10(1+h/700); }
function melToHz(m){ return 700*(Math.pow(10,m/2595)-1); }

function createMelBank(mels, fftSize, sr){
  const bank = [];

  const points = Array.from({length:mels+2},(_,i)=>
    hzToMel(sr/2*i/(mels+1))
  ).map(melToHz);

  const bins = points.map(hz=>
    Math.floor((fftSize+1)*hz/sr)
  );

  for(let m=1;m<=mels;m++){
    const f = new Array(fftSize/2).fill(0);

    for(let i=bins[m-1];i<bins[m];i++){
      f[i] = (i-bins[m-1])/(bins[m]-bins[m-1]||1);
    }
    for(let i=bins[m];i<bins[m+1];i++){
      f[i] = (bins[m+1]-i)/(bins[m+1]-bins[m]||1);
    }

    bank.push(f);
  }

  return bank;
}

const MFCC = {
  sampleRate: 16000,
  frameSize: 400,
  hopSize: 160,
  melCount: 26,
  mfccCount: 13,
  melFilterBank: null
};

function extractMFCC(sig){
  const fftSize = 512;
  const frames = frameSignal(sig, MFCC.frameSize, MFCC.hopSize);

  if(!MFCC.melFilterBank){
    MFCC.melFilterBank = createMelBank(
      MFCC.melCount,
      fftSize,
      MFCC.sampleRate
    );
  }

  const out = [];

  for(const fr of frames){
    const padded = new Float32Array(fftSize);
    padded.set(fr);

    const power = powerSpectrum(padded);

    const mel = MFCC.melFilterBank.map(f=>{
      let s=0;
      for(let i=0;i<f.length;i++){
        s += power[i]*f[i];
      }
      return Math.log(s+1e-10);
    });

    const cep = [];

    for(let k=0;k<MFCC.mfccCount;k++){
      let s=0;
      for(let n=0;n<mel.length;n++){
        s += mel[n]*Math.cos(Math.PI*k*(n+0.5)/mel.length);
      }
      cep.push(s);
    }

    out.push(cep);
  }

  return out;
}

window.extractMFCC = extractMFCC;

console.log("✔ mfccService loaded");
