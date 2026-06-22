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

    console.log("Sending message to content script...");

    chrome.tabs.sendMessage(
      tab.id,
      { type: "INSERT_TIMESTAMP_INITIALS", initials: userInitials },
      async () => {
        if (chrome.runtime.lastError) {
          console.warn("Content script not found, injecting now...");

          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["extension.js"]
          });

          console.log("Content script injected. Retrying message...");
          chrome.tabs.sendMessage(tab.id, {
            type: "INSERT_TIMESTAMP_INITIALS",
            initials: userInitials
          });
        } else {
          console.log("Message sent successfully.");
        }
      }
    );
  } catch (err) {
    console.error("ERROR in background.js:", err);
  }
});
