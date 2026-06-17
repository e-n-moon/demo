const MFCC = {
  sampleRate: 16000,
  frameSize: 400,
  hopSize: 160,
  melCount: 26,
  mfccCount: 13,
  melFilterBank: null
};

// (reuse your FFT + helpers from Step 3)

export function extractMFCC(signal) {
  const fftSize = 512;

  const frames = frameSignal(signal, MFCC.frameSize, MFCC.hopSize);

  if (!MFCC.melFilterBank) {
    MFCC.melFilterBank = createMelBank(
      MFCC.melCount,
      fftSize,
      MFCC.sampleRate
    );
  }

  const out = [];

  for (const fr of frames) {
    const padded = new Float32Array(fftSize);
    padded.set(fr);

    const power = powerSpectrum(padded);

    const mel = MFCC.melFilterBank.map(f => {
      let s = 0;
      for (let i = 0; i < f.length; i++) {
        s += power[i] * f[i];
      }
      return Math.log(s + 1e-10);
    });

    const cep = [];

    for (let k = 0; k < MFCC.mfccCount; k++) {
      let s = 0;
      for (let n = 0; n < mel.length; n++) {
        s += mel[n] * Math.cos(Math.PI * k * (n + 0.5) / mel.length);
      }
      cep.push(s);
    }

    out.push(cep);
  }

  return out;
}
