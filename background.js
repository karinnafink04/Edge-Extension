console.log("Background service worker loaded.");

chrome.commands.onCommand.addListener(async (command) => {
  console.log("Command received:", command);

  if (command !== "insert_timestamp_initials") {
    console.log("Command ignored.");
    return;
  }

  console.log("Running timestamp insertion...");

  // Get stored initials (fallback to "??" if none)
  const { initials } = await chrome.storage.sync.get("initials");
  const userInitials = initials || "??";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log("Active tab:", tab);

    if (!tab || !tab.id) {
      console.warn("No active tab found — make sure you’re on a webpage.");
      return;
    }

    console.log("Sending message to content script...");
    chrome.tabs.sendMessage(tab.id, {
      type: "INSERT_TIMESTAMP_INITIALS",
      initials: userInitials
    });

    console.log("Message sent successfully.");
  } catch (err) {
    console.error("ERROR in background.js:", err);
  }
});
