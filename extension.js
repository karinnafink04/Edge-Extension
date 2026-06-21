// contentScript.js

function getTimestampString(initials) {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes} ${initials}`;
}

function insertIntoFocusedElement(text) {
  const el = document.activeElement;
  if (!el) return;

  const isTextInput =
    el.tagName === "INPUT" && ["text", "search", "email", "url", "tel"].includes(el.type);
  const isTextArea = el.tagName === "TEXTAREA";
  const isContentEditable = el.isContentEditable;

  if (!isTextInput && !isTextArea && !isContentEditable) {
    return;
  }

  if (isContentEditable) {
    // For contenteditable elements
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    // Move cursor after inserted text
    range.setStart(range.endContainer, range.endOffset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    // For input/textarea
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;

    const before = el.value.slice(0, start);
    const after = el.value.slice(end);

    el.value = before + text + after;

    const newPos = start + text.length;
    el.selectionStart = el.selectionEnd = newPos;

    // Trigger input event so frameworks notice change
    const event = new Event("input", { bubbles: true });
    el.dispatchEvent(event);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "INSERT_TIMESTAMP_INITIALS") {
    const text = getTimestampString(message.initials);
    insertIntoFocusedElement(text);
  }
});
