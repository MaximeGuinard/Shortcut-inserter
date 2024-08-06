let shortcuts = {};

// Charger les raccourcis depuis le stockage
chrome.storage.sync.get('shortcuts', (data) => {
  shortcuts = data.shortcuts || {};
  console.log('Shortcuts loaded:', shortcuts); // Debug line
});

// Mettre à jour les raccourcis lorsque le stockage change
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.shortcuts) {
    shortcuts = changes.shortcuts.newValue || {};
    console.log('Shortcuts updated:', shortcuts); // Debug line
  }
});

// Fonction pour remplacer les raccourcis dans le texte
function replaceShortcuts(textArea) {
  if (!textArea) return;

  const currentValue = textArea.textContent || textArea.value;
  let newValue = currentValue;

  for (const [shortcut, replacement] of Object.entries(shortcuts)) {
    if (newValue.endsWith(shortcut)) {
      newValue = newValue.slice(0, -shortcut.length) + replacement;
      if (textArea.tagName === 'TEXTAREA' || textArea.tagName === 'INPUT') {
        textArea.value = newValue;
      } else if (textArea.isContentEditable) {
        textArea.textContent = newValue;
      }
      // Placer le curseur à la fin du texte
      const range = document.createRange();
      const selection = window.getSelection();
      range.setStart(textArea, newValue.length);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return; // Sortir après le premier remplacement pour éviter les conflits
    }
  }
}

// Fonction pour détecter les éléments de saisie
function handleInputEvent(event) {
  const target = event.target;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    replaceShortcuts(target);
  }
}

// Observer les changements dans les éditeurs de texte riches
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' || mutation.type === 'characterData') {
      const target = mutation.target;
      if (target.nodeType === Node.TEXT_NODE) {
        replaceShortcuts(target.parentElement);
      } else if (target.nodeType === Node.ELEMENT_NODE) {
        replaceShortcuts(target);
      }
    }
  });
});

// Observer tous les éléments contenteditable et input
function observeEditableElements() {
  document.querySelectorAll('[contenteditable]').forEach((el) => {
    observer.observe(el, { childList: true, subtree: true, characterData: true });
  });
  document.querySelectorAll('textarea, input').forEach((el) => {
    el.addEventListener('input', handleInputEvent);
  });
}

// Initialiser l'observation
observeEditableElements();

// Ajouter les nouveaux éléments contenteditable dynamiquement
const dynamicObserver = new MutationObserver(() => {
  observeEditableElements();
});

dynamicObserver.observe(document.body, { childList: true, subtree: true });
