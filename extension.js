console.log("Content script loaded.");

chrome.runtime.onMessage.addListener((message) => {
  if (message.type !== "INSERT_TIMESTAMP_INITIALS") return;

  console.log("Received INSERT_TIMESTAMP_INITIALS message:", message);

  const timestamp = new Date().toLocaleString();
  const text = `${timestamp} - ${message.initials}`;

  const activeElement = document.activeElement;

  if (
    activeElement &&
    (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")
  ) {
    activeElement.value += text;
    console.log("Inserted into input/textarea.");
  } else if (activeElement && activeElement.isContentEditable) {
    activeElement.innerText += text;
    console.log("Inserted into contentEditable element.");
  } else {
    console.warn("No suitable active element to insert into.");
  }
});
