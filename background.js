chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ shortcuts: {} });
  console.log("Extension installed and storage initialized.");
});
