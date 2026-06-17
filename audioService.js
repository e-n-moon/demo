function createAudioRecorder() {
  let ctx;
  let stream;
  let chunks = [];

  async function start() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      ctx = new AudioContext({ sampleRate: 16000 });

      // ✅ IMPORTANT: unlock audio context
      await ctx.resume();

      const src = ctx.createMediaStreamSource(stream);
      const proc = ctx.createScriptProcessor(512, 1, 1);

      chunks = [];

      proc.onaudioprocess = (e) => {
        chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
      };

      src.connect(proc);
      proc.connect(ctx.destination);

      ctx._proc = proc;

      console.log("🎙 recording started");

    } catch (err) {
      console.error("❌ audio start failed:", err);
      alert("Microphone access failed or blocked");
    }
  }

  function stop() {
    try {
      ctx?._proc?.disconnect();
      stream?.getTracks().forEach(t => t.stop());

      const pcm = new Float32Array(
        chunks.reduce((a, b) => a + b.length, 0)
      );

      let offset = 0;
      for (const c of chunks) {
        pcm.set(c, offset);
        offset += c.length;
      }

      console.log("🛑 recording stopped:", pcm.length);

      return pcm;

    } catch (err) {
      console.error("❌ audio stop failed:", err);
      return new Float32Array(0);
    }
  }

  return { start, stop };
}

window.createAudioRecorder = createAudioRecorder;
console.log("✔ audioService loaded");
