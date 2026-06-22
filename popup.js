document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("initials");
  const saveBtn = document.getElementById("save");
  const status = document.getElementById("status");

  // Load saved initials
  chrome.storage.sync.get("initials", ({ initials }) => {
    if (initials) {
      input.value = initials;
    }
  });

  // Save initials
  saveBtn.addEventListener("click", async () => {
    const initials = input.value.trim();

    await chrome.storage.sync.set({ initials });

    status.textContent = "✅ Initials saved";
    setTimeout(() => {
      status.textContent = "";
    }, 1500);
  });
});
