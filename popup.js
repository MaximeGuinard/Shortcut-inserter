document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('shortcutForm');
  const shortcutList = document.getElementById('shortcutList');

  form.addEventListener('submit', (event) => {
      event.preventDefault();

      const shortcut = document.getElementById('shortcut').value.trim();
      const text = document.getElementById('text').value.trim();

      if (shortcut === '' || text === '') {
          alert('Please fill out both fields.');
          return;
      }

      chrome.storage.sync.get('shortcuts', (data) => {
          const shortcuts = data.shortcuts || {};
          shortcuts[shortcut] = text;

          chrome.storage.sync.set({ shortcuts }, () => {
              console.log('Shortcuts saved:', shortcuts); // Debug line
              document.getElementById('shortcut').value = '';
              document.getElementById('text').value = '';
              loadShortcuts();
          });
      });
  });

  function loadShortcuts() {
      chrome.storage.sync.get('shortcuts', (data) => {
          const shortcuts = data.shortcuts || {};
          shortcutList.innerHTML = '';
          for (const [key, value] of Object.entries(shortcuts)) {
              const div = document.createElement('div');
              div.className = 'shortcut-item';
              div.innerHTML = `
                  <span>${key}: ${value}</span>
                  <button class="delete-button" data-shortcut="${key}">Delete</button>
              `;
              shortcutList.appendChild(div);
          }
          document.querySelectorAll('.delete-button').forEach(button => {
              button.addEventListener('click', () => {
                  const shortcut = button.getAttribute('data-shortcut');
                  deleteShortcut(shortcut);
              });
          });
      });
  }

  function deleteShortcut(shortcut) {
      chrome.storage.sync.get('shortcuts', (data) => {
          const shortcuts = data.shortcuts || {};
          delete shortcuts[shortcut];
          chrome.storage.sync.set({ shortcuts }, () => {
              console.log('Shortcut deleted:', shortcut); // Debug line
              loadShortcuts();
          });
      });
  }

  loadShortcuts();
});
