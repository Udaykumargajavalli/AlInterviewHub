const themeStorageKey = "learn_with_cu-theme";
let themeStorageMessage = "";
let savedTheme = null;
try {
  savedTheme = localStorage.getItem(themeStorageKey);
} catch (error) {
  if (error.name !== "SecurityError") throw error;
  console.warn("Theme preferences cannot be read in this browser.", error);
  themeStorageMessage = "Your browser blocks saved preferences. Theme changes will apply to this page only.";
}
document.documentElement.dataset.theme = savedTheme === "light" || savedTheme === "dark"
  ? savedTheme
  : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
