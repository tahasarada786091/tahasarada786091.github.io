document.addEventListener('DOMContentLoaded', function() {
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  
  sidebarItems.forEach(item => {
    item.addEventListener('click', function() {
      const accessoryType = this.querySelector('.img').alt.toLowerCase();
      showSettings(accessoryType);
    });
  });
});

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('minimized');
}

function showSettings(accessory) {
  const sections = document.querySelectorAll('.settings-section');
  sections.forEach(section => section.classList.remove('active'));

  const activeSection = document.getElementById(`${accessory}-settings`);
  if (activeSection) {
    activeSection.classList.add('active');
  }
}
document.addEventListener('DOMContentLoaded', () => {
  // Select all keys
  const keys = document.querySelectorAll('.keyboard-key');

  // Add click event listener to each key
  keys.forEach(key => {
      key.addEventListener('click', () => {
          openConfigurationModal(key.id);
      });
  });

  // Function to open configuration modal
  function openConfigurationModal(keyId) {
      // Logic to open a modal and configure the key action
      console.log('Configuring key:', keyId);
      // For now, just display the key ID in a simple alert
      alert(`Configuring key: ${keyId}`);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const keys = document.querySelectorAll('.keyboard-key');
  const modal = document.getElementById('config-modal');
  const closeModalBtn = document.querySelector('.close-btn');
  const keyIdDisplay = document.getElementById('key-id-display');
  const keyActionSelect = document.getElementById('key-action');
  const saveConfigBtn = document.getElementById('save-config');
  let currentKeyId = '';

  // Load configurations from local storage on startup
  loadConfigurations();

  keys.forEach(key => {
      key.addEventListener('click', () => {
          openConfigurationModal(key.id);
      });
  });

  closeModalBtn.addEventListener('click', () => {
      closeModal();
  });

  window.addEventListener('click', event => {
      if (event.target === modal) {
          closeModal();
      }
  });

  saveConfigBtn.addEventListener('click', () => {
      const selectedAction = keyActionSelect.value;
      saveConfiguration(currentKeyId, selectedAction);
      closeModal();
  });

  function openConfigurationModal(keyId) {
      currentKeyId = keyId;
      keyIdDisplay.textContent = `Configuring key: ${keyId}`;
      keyActionSelect.value = localStorage.getItem(keyId) || 'default';
      modal.style.display = 'block';
  }

  function closeModal() {
      modal.style.display = 'none';
  }

  function saveConfiguration(keyId, action) {
      localStorage.setItem(keyId, action);
      console.log(`Saved configuration for ${keyId}: ${action}`);
  }

  function loadConfigurations() {
      keys.forEach(key => {
          const action = localStorage.getItem(key.id);
          if (action) {
              console.log(`Loaded configuration for ${key.id}: ${action}`);
          }
      });
  }
});
