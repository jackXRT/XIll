import { supabase } from './supabase.js';
// DOM elements
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const signupUsername = document.getElementById('signupUsername');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');

// Show/hide auth modal
function showAuthModal(tab = 'login') {
  authModal.style.display = 'block';
  switchAuthTab(tab);
}

function hideAuthModal() {
  authModal.style.display = 'none';
  clearAuthErrors();
}

function switchAuthTab(tab) {
  // Hide all forms
  loginForm.classList.remove('active');
  signupForm.classList.remove('active');
  
  // Remove active class from all tabs
  document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
  
  // Show selected form
  if (tab === 'login') {
    loginForm.classList.add('active');
    document.querySelector('.auth-tab:nth-child(1)').classList.add('active');
  } else {
    signupForm.classList.add('active');
    document.querySelector('.auth-tab:nth-child(2)').classList.add('active');
  }
}

// Clear error messages
function clearAuthErrors() {
  loginError.textContent = '';
  signupError.textContent = '';
}

// Handle login
async function handleLogin() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  
  if (!email || !password) {
    loginError.textContent = 'Please fill in all fields';
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    
    hideAuthModal();
    updateUI();
  } catch (error) {
    loginError.textContent = error.message;
  }
}

// Handle signup
async function handleSignup() {
  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();
  const username = signupUsername.value.trim();
  
  if (!email || !password || !username) {
    signupError.textContent = 'Please fill in all fields';
    return;
  }

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) throw authError;
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        username,
        role: null,
        is_expert: false
      });

    if (profileError) throw profileError;
    
    hideAuthModal();
    showRolePopup();
  } catch (error) {
    signupError.textContent = error.message;
  }
}

// Sign out
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Error signing out:', error);
  updateUI();
}

// Initialize auth UI
function initAuthUI() {
  document.getElementById('authButton').addEventListener('click', () => showAuthModal());
  
  // Add event listeners for auth tabs
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.textContent.toLowerCase().includes('sign in') ? 'login' : 'signup';
      switchAuthTab(tabName);
    });
  });
}

export { handleLogin, handleSignup, signOut, initAuthUI };