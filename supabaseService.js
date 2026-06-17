const sb = window.sb;

function serializeMFCC(mfcc){
  return mfcc.map(f => Array.from(f));
}

export async function saveMFCCSample({
  sessionId,
  mfcc,
  role,
  phrase
}) {

  console.log("🟡 saveMFCCSample CALLED");
  console.log("payload meta:", {
    sessionId,
    role,
    frameCount: mfcc?.length
  });

  if(!sb){
    console.error("❌ Supabase client is undefined (window.sb missing)");
    return;
  }

  const payload = {
    session_id: sessionId,
    user_id: "local-user",
    role,
    mfcc: serializeMFCC(mfcc),
    frame_count: mfcc.length,
    coeff_count: mfcc[0]?.length || 0,
    phrase
  };

  console.log("📦 inserting payload:", payload);

  const { data, error } = await sb
    .from("voice_mfcc_samples")
    .insert(payload)
    .select();

  if(error){
    console.error("❌ Supabase INSERT ERROR:");
    console.error(error);
    alert("Supabase insert failed — check console");
    return null;
  }

  console.log("✅ Supabase INSERT SUCCESS:", data);
  return data;
}
