chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "insert_timestamp_initials") return;

  const userInitials = "TEST";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["extension.js"]
    });

    chrome.tabs.sendMessage(tab.id, {
      type: "INSERT_TIMESTAMP_INITIALS",
      initials: userInitials
    });

    console.log("Timestamp command executed successfully.");
  } catch (err) {
    console.error("Error executing timestamp command:", err);
  }
});
