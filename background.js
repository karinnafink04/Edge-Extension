console.log("Background worker loaded.");

chrome.commands.onCommand.addListener(async (command) => {
  console.log("Command received:", command);

  if (command !== "insert_timestamp_initials") {
    console.log("Command ignored.");
    return;
  }

  console.log("Running timestamp insertion...");

  const userInitials = "TEST";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log("Active tab:", tab);

    if (!tab || !tab.id) {
      console.log("No active tab found.");
      return;
    }

    console.log("Injecting extension.js...");
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["extension.js"]
    });

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
