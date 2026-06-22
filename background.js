chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "insert_timestamp_initials") return;

  // Hard‑coded initials for testing
  const userInitials = "TEST";

  // Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  // Inject the content script into the page
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["extension.js"]
  });

  // Send message to content script to insert timestamp + initials
  chrome.tabs.sendMessage(tab.id, {
    type: "INSERT_TIMESTAMP_INITIALS",
    initials: userInitials
  });
});
