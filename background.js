// background.js

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "insert_timestamp_initials") return;

  // Get or ask for initials
  const { initials } = await chrome.storage.sync.get("initials");

  let userInitials = initials;
  if (!userInitials) {
    userInitials = prompt("Enter your initials (will be saved):");
    if (!userInitials) {
      return; // user cancelled
    }
    await chrome.storage.sync.set({ initials: userInitials });
  }

  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  // Inject content script (if not already) and send message
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["contentScript.js"]
  });

  chrome.tabs.sendMessage(tab.id, {
    type: "INSERT_TIMESTAMP_INITIALS",
    initials: userInitials
  });
});
