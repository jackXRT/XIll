// Wait for both DOM and Supabase to be ready
function initSupabase() {
  // Check repeatedly until Supabase is loaded
  const checkSupabase = setInterval(() => {
    if (typeof supabase !== 'undefined') {
      clearInterval(checkSupabase);
      setupSupabase();
    }
  }, 100);
}

function setupSupabase() {
  const supabaseClient = supabase.createClient(
    'https://tsposvekruhpemxnedey.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcG9zdmVrcnVocGVteG5lZGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njk3ODEsImV4cCI6MjA2NjM0NTc4MX0.Zf6CR9P2YwPZxRSMu9jfWK6bucNyX93HdLAnS4Sv3d4'
  );

  // Auth state listener
  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event, session);
    if (event === 'SIGNED_IN' && session?.user) {
      checkUserProfile(session.user);
    }
  });

  async function checkUserProfile(user) {
    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile?.role) {
      showRolePopup();
    }
  }

  function showRolePopup() {
    console.log('Role popup should be displayed here.');
  }

  window.supabase = supabaseClient;
  console.log('Supabase initialized successfully');
}

// Start the initialization
document.addEventListener('DOMContentLoaded', initSupabase);