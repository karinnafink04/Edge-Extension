if (!window.timestampListenerAdded) {
  window.timestampListenerAdded = true;

  console.log("Content script loaded.");

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "INSERT_TIMESTAMP_INITIALS") return;

    // Format timestamp as MM/DD/YYYY, HH:MM
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

    // INPUT or TEXTAREA
    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const original = el.value;

      // Insert at cursor
      el.value = original.slice(0, start) + text + original.slice(end);

      // Move cursor to end of inserted text
      const newPos = start + text.length;
      el.selectionStart = el.selectionEnd = newPos;

      // 🔥 Tell Flybook/React/Vue that the value changed
      el.dispatchEvent(new Event("input", { bubbles: true }));

    } else if (el && el.isContentEditable) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      range.deleteContents();

      const node = document.createTextNode(text);
      range.insertNode(node);

      // Move cursor after inserted text
      range.setStartAfter(node);
      range.setEndAfter(node);
      selection.removeAllRanges();
      selection.addRange(range);

      // 🔥 Trigger input event for contentEditable
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
}
