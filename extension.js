chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "INSERT_TIMESTAMP_INITIALS") {
    const timestamp = new Date().toLocaleString();
    const text = `${timestamp} - ${message.initials}`;

    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
      activeElement.value += text;
    } else if (activeElement && activeElement.isContentEditable) {
      activeElement.innerText += text;
    }
  }
});
