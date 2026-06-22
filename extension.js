console.log("Content script loaded.");

// Prevent duplicate listeners
if (!window.timestampListenerAdded) {
  window.timestampListenerAdded = true;

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "INSERT_TIMESTAMP_INITIALS") return;

    console.log("Received INSERT_TIMESTAMP_INITIALS:", message);

    const timestamp = new Date().toLocaleString();
    const text = `${timestamp} - ${message.initials}`;

    const el = document.activeElement;

    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
      el.value += text;
      console.log("Inserted into input/textarea.");
    } else if (el && el.isContentEditable) {
      el.innerText += text;
      console.log("Inserted into contentEditable.");
    } else {
      console.warn("No valid active element to insert into.");
    }
  });
}
