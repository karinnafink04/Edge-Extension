console.log("Background service worker loaded.");

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "insert_timestamp_initials") return;

  console.log("Running timestamp insertion...");

  const { initials } = await chrome.storage.sync.get("initials");
  const userInitials = initials || "??";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      console.warn("No active tab found.");
      return;
    }

    // Check if content script is already injected
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => !!window.timestampListenerAdded
    });

    const isInjected = result?.result;
    console.log("Content script already injected?", isInjected);

    if (!isInjected) {
      console.log("Injecting content script...");
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["extension.js"]
      });
    }

    console.log("Sending message to content script...");
    chrome.tabs.sendMessage(tab.id, {
      type: "INSERT_TIMESTAMP_INITIALS",
      initials: userInitials
    });
  } catch (err) {
    console.error("ERROR in background.js:", err);
  }
});
