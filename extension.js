if (!window.timestampListenerAdded) {
  window.timestampListenerAdded = true;

  console.log("Content script loaded.");

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "INSERT_TIMESTAMP_INITIALS") return;

    const now = new Date();
    const timestamp = now.toLocaleString([], {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const text = `${timestamp} - ${message.initials}`;

    const el = document.activeElement;

    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
      el.value += text;
    } else if (el && el.isContentEditable) {
      el.innerText += text;
    }
  });
}
