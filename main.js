import { initAuthUI, handleLogin, handleSignup, signOut } from './auth.js';
import { initScanner, scanHash } from './scanner.js';
import { initUI, updateUI, showRolePopup, selectRole } from './ui.js';
import { initChat } from './chat.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for Supabase to be ready
  await window.supabaseReady;

  // Initialize all modules
  initUI();
  initAuthUI();
  initScanner();
  initChat();
  
  // Check auth state
  updateUI();

  // Make functions available to HTML onclick handlers
  window.handleLogin = handleLogin;
  window.handleSignup = handleSignup;
  window.signOut = signOut;
  window.scanHash = scanHash;
  window.selectRole = selectRole;
  window.showRolePopup = showRolePopup;
});

// Export for testing if needed
export { initAuthUI, initScanner, initUI, initChat };