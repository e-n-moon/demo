const sb = window.sb;

function serializeMFCC(mfcc) {
  return mfcc.map(f => Array.from(f));
}

export async function saveMFCCSample({
  sessionId,
  mfcc,
  role,
  phrase
}) {
  const { data, error } = await sb
    .from("voice_mfcc_samples")
    .insert({
      session_id: sessionId,
      user_id: "local-user",
      role,
      mfcc: serializeMFCC(mfcc),
      frame_count: mfcc.length,
      coeff_count: mfcc[0]?.length || 0,
      phrase
    })
    .select();

  if (error) {
    console.error("❌ Supabase error:", error);
    return null;
  }

  console.log("✅ Saved MFCC:", role);
  return data;
}
