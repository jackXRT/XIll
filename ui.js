// Get Supabase client and auth functions from global scope
const supabase = window.supabase;
const getCurrentUser = window.getCurrentUser;
const signOut = window.signOut;

// DOM elements
const rolePopup = document.getElementById('rolePopup');
const profileCard = document.getElementById('profileCard');
const authButton = document.getElementById('authButton');
const sidebarUsername = document.getElementById('sidebarUsername');
const sidebarRole = document.getElementById('sidebarRole');
const sidebarBadge = document.getElementById('sidebarBadge');
const desktopUsername = document.getElementById('desktopUsername');

// Show/hide role popup
function showRolePopup() {
  rolePopup.style.display = 'block';
}

function hideRolePopup() {
  rolePopup.style.display = 'none';
}

// Select role
async function selectRole(role) {
  const user = await getCurrentUser();
  if (!user) return;
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', user.id);
    
    if (error) throw error;
    
    hideRolePopup();
    updateUI();
  } catch (error) {
    console.error('Error updating role:', error);
  }
}

// Update UI based on auth state
async function updateUI() {
  const user = await getCurrentUser();
  
  if (user) {
    // User is logged in
    authButton.style.display = 'none';
    profileCard.style.display = 'flex';
    
    // Get profile data
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      sidebarUsername.textContent = profile.username || 'User';
      sidebarRole.textContent = profile.role || 'No role selected';
      desktopUsername.textContent = profile.username || 'User';
      
      if (profile.is_expert) {
        sidebarBadge.innerHTML = 'EXPERT <span class="expert-badge">🌟</span>';
      } else {
        sidebarBadge.textContent = 'MEMBER';
      }
    }
  } else {
    // User is logged out
    authButton.style.display = 'flex';
    profileCard.style.display = 'none';
    desktopUsername.textContent = 'Guest';
  }
}

// Initialize UI
function initUI() {
  // Mobile menu toggle
  document.getElementById('hamburgerMenu').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('active');
  });
  
  document.getElementById('closeSidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('active');
  });
  
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
      const view = this.getAttribute('data-view');
      if (!view) return;
      
      // Update active states
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
      
      this.classList.add('active');
      document.getElementById(`${view}View`).classList.add('active');
      
      // Close sidebar on mobile
      if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('active');
      }
    });
  });
  
  // Sign out button (add this to your HTML)
  document.getElementById('signOutButton')?.addEventListener('click', signOut);
}

// Check auth state
async function checkAuthState() {
  await updateUI();
}

// Make functions available globally
window.showRolePopup = showRolePopup;
window.hideRolePopup = hideRolePopup;
window.selectRole = selectRole;
window.updateUI = updateUI;
window.initUI = initUI;
window.checkAuthState = checkAuthState;