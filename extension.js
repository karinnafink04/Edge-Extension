{
  "manifest_version": 3,
  "name": "Timestamp + Initials Inserter",
  "version": "1.0",
  "description": "Insert date, time, and user initials into text fields with Ctrl+Shift+F.",
  "permissions": [
    "storage",
    "scripting",
    "activeTab"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "commands": {
    "insert_timestamp_initials": {
      "description": "Insert date, time, and initials into the focused text field",
      "suggested_key": {
        "default": "Ctrl+Shift+F"
      }
    }
  },
  "host_permissions": [
    "<all_urls>"
  ]
}

// background.js

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "insert_timestamp_initials") return;

  // Get or ask for initials
  const { initials } = await chrome.storage.sync.get("initials");

  let userInitials = initials;
  if (!userInitials) {
    userInitials = prompt("Enter your initials (will be saved):");
    if (!userInitials) {
      return; // user cancelled
    }
    await chrome.storage.sync.set({ initials: userInitials });
  }

  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  // Inject content script (if not already) and send message
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["contentScript.js"]
  });

  chrome.tabs.sendMessage(tab.id, {
    type: "INSERT_TIMESTAMP_INITIALS",
    initials: userInitials
  });
});


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
