const SUPABASE_URL = "https://qmkgigdpvsxgiiafitxb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFta2dpZ2RwdnN4Z2lpYWZpdHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExOTk4NzEsImV4cCI6MjA5Njc3NTg3MX0.drvWrE0ELimT6-IAzn6fzeeXD2tQZ138BvHODDfyHsQ";

window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✔ supabase initialized");
