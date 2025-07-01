// Get Supabase client and auth functions from global scope
const supabase = window.supabase;
const getCurrentUser = window.getCurrentUser;

// DOM elements
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// Load community messages
async function loadMessages(communityId) {
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*, profiles(username, avatar_url)')
    .eq('community_id', communityId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error loading messages:', error);
    return;
  }
  
  renderMessages(messages);
}

// Render messages to UI
async function renderMessages(messages) {  // Made async to handle getCurrentUser
  chatContainer.innerHTML = '';
  
  const currentUser = await getCurrentUser();
  
  messages.forEach(message => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.user_id === currentUser?.id ? 'sent' : 'received'}`;
    
    messageDiv.innerHTML = `
      <div class="message-header">
        <div class="message-avatar" style="background-image: url('${message.profiles.avatar_url || ''}')">
          ${message.profiles.avatar_url ? '' : message.profiles.username.charAt(0)}
        </div>
        <span class="message-sender">${message.profiles.username}</span>
        <span class="message-time">${new Date(message.created_at).toLocaleTimeString()}</span>
      </div>
      <div class="message-content">${message.content}</div>
    `;
    
    chatContainer.appendChild(messageDiv);
  });
  
  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Send message
async function sendMessage() {
  const user = await getCurrentUser();
  if (!user) return;
  
  const content = messageInput.value.trim();
  if (!content) return;
  
  // For now using a default community, you'll want to change this
  const communityId = 1;
  
  const { error } = await supabase
    .from('messages')
    .insert({
      content,
      user_id: user.id,
      community_id: communityId
    });
  
  if (error) {
    console.error('Error sending message:', error);
    return;
  }
  
  messageInput.value = '';
  loadMessages(communityId);
}

// Initialize chat
function initChat() {
  // Load initial messages
  loadMessages(1); // Default community
  
  // Set up message sending
  sendButton.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  
  // Real-time updates
  const channel = supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages'
    }, () => {
      loadMessages(1); // Refresh messages when new one is added
    })
    .subscribe();
}

// Make functions available globally
window.initChat = initChat;
window.sendMessage = sendMessage;