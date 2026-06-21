chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "insert_timestamp_initials") return;

  // Load initials from storage
  const { initials } = await chrome.storage.sync.get("initials");

  // If initials are missing, stop and notify the user in the console
  if (!initials) {
    console.warn("No initials saved. Open the extension's Options page to set them.");
    return;
  }

  // Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  // Inject the content script into the page
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["contentScript.js"]
  });

  // Tell the content script to insert the timestamp + initials
  chrome.tabs.sendMessage(tab.id, {
    type: "INSERT_TIMESTAMP_INITIALS",
    initials: initials
  });
});
