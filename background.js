console.log("Background service worker loaded!");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed.");
});

chrome.commands.onCommand.addListener((command) => {
  console.log("Command received:", command);
});
