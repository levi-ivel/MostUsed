/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => MostUsedWordsPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var MostUsedWordsPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.createdEventListener = null;
  }
  onload() {
    this.createdEventListener = (file) => {
    };
    if (this.createdEventListener) {
      this.app.vault.on("create", this.createdEventListener);
    }
    this.addRibbonIcon("document", "Show Most Used Words Graph", async () => {
      await this.showMostUsedWordsList();
    });
    this.addCommand({
      id: "show-most-used-words-list",
      name: "Show Most Used Words List",
      callback: async () => {
        await this.showMostUsedWordsList();
      }
    });
  }
  async showMostUsedWordsList() {
    const notes = this.app.vault.getMarkdownFiles();
    const wordCountMap = /* @__PURE__ */ new Map();
    for (const note of notes) {
      const content = await this.app.vault.read(note);
      const words = content.split(/\s+/);
      words.forEach((word) => {
        const normalizedWord = word.toLowerCase();
        if (normalizedWord.length > 0) {
          const count = wordCountMap.get(normalizedWord) || 0;
          wordCountMap.set(normalizedWord, count + 1);
        }
      });
    }
    const sortedWords = Array.from(wordCountMap.entries()).sort(
      (a, b) => b[1] - a[1]
    );
    const topWords = sortedWords.slice(0, 100);
    const wordList = topWords.map(([word, count], index) => `${index + 1}: ${word} (${count})`).join("<br>");
    const popup = this.createPopup(wordList);
    this.app.workspace.containerEl.appendChild(popup);
  }
  createPopup(content) {
    const popup = document.createElement("div");
    popup.classList.add("my-popup");
    const popupContent = document.createElement("div");
    popupContent.classList.add("popup-content");
    const closeButton = document.createElement("span");
    closeButton.classList.add("close");
    closeButton.innerHTML = "&times;";
    closeButton.onclick = () => popup.remove();
    const contentDiv = document.createElement("div");
    contentDiv.innerHTML = content;
    popupContent.appendChild(closeButton);
    popupContent.appendChild(contentDiv);
    popup.appendChild(popupContent);
    popup.style.position = "fixed";
    popup.style.top = "100px";
    popup.style.left = "96%";
    popup.style.transform = "translateX(-50%)";
    contentDiv.style.maxHeight = "300px";
    contentDiv.style.overflowY = "auto";
    return popup;
  }
  onunload() {
    if (this.createdEventListener) {
      this.app.vault.off("create", this.createdEventListener);
      this.createdEventListener = null;
    }
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgUGx1Z2luLCBUQWJzdHJhY3RGaWxlIH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9zdFVzZWRXb3Jkc1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XHJcbiAgICBwcml2YXRlIGNyZWF0ZWRFdmVudExpc3RlbmVyOiAoKGZpbGU6IFRBYnN0cmFjdEZpbGUpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgb25sb2FkKCkge1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZWRFdmVudExpc3RlbmVyID0gKGZpbGU6IFRBYnN0cmFjdEZpbGUpID0+IHtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jcmVhdGVkRXZlbnRMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB0aGlzLmFwcC52YXVsdC5vbihcImNyZWF0ZVwiLCB0aGlzLmNyZWF0ZWRFdmVudExpc3RlbmVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYWRkUmliYm9uSWNvbignZG9jdW1lbnQnLCAnU2hvdyBNb3N0IFVzZWQgV29yZHMgR3JhcGgnLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2hvd01vc3RVc2VkV29yZHNMaXN0KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgICAgICAgIGlkOiAnc2hvdy1tb3N0LXVzZWQtd29yZHMtbGlzdCcsXHJcbiAgICAgICAgICAgIG5hbWU6ICdTaG93IE1vc3QgVXNlZCBXb3JkcyBMaXN0JyxcclxuICAgICAgICAgICAgY2FsbGJhY2s6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2hvd01vc3RVc2VkV29yZHNMaXN0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBzaG93TW9zdFVzZWRXb3Jkc0xpc3QoKSB7XHJcbiAgICAgICAgLy8gR2V0IGFsbCBub3Rlc1xyXG4gICAgICAgIGNvbnN0IG5vdGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xyXG5cclxuICAgICAgICAvLyBDb3VudCB3b3JkIG9jY3VycmVuY2VzXHJcbiAgICAgICAgY29uc3Qgd29yZENvdW50TWFwID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIGZvciAoY29uc3Qgbm90ZSBvZiBub3Rlcykge1xyXG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChub3RlKTtcclxuICAgICAgICAgICAgY29uc3Qgd29yZHMgPSBjb250ZW50LnNwbGl0KC9cXHMrLyk7XHJcbiAgICAgICAgICAgIHdvcmRzLmZvckVhY2god29yZCA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBub3JtYWxpemVkV29yZCA9IHdvcmQudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgIGlmIChub3JtYWxpemVkV29yZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY291bnQgPSB3b3JkQ291bnRNYXAuZ2V0KG5vcm1hbGl6ZWRXb3JkKSB8fCAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHdvcmRDb3VudE1hcC5zZXQobm9ybWFsaXplZFdvcmQsIGNvdW50ICsgMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU29ydCBieSB3b3JkIGNvdW50XHJcbiAgICAgICAgY29uc3Qgc29ydGVkV29yZHMgPSBBcnJheS5mcm9tKHdvcmRDb3VudE1hcC5lbnRyaWVzKCkpLnNvcnQoXHJcbiAgICAgICAgICAgIChhLCBiKSA9PiBiWzFdIC0gYVsxXVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIERpc3BsYXkgdG9wIDEwMCBtb3N0IHVzZWQgd29yZHMgaW4gYSBwb3B1cCB3aW5kb3dcclxuICAgICAgICBjb25zdCB0b3BXb3JkcyA9IHNvcnRlZFdvcmRzLnNsaWNlKDAsIDEwMCk7XHJcbiAgICAgICAgY29uc3Qgd29yZExpc3QgPSB0b3BXb3Jkcy5tYXAoKFt3b3JkLCBjb3VudF0sIGluZGV4KSA9PiBgJHtpbmRleCArIDF9OiAke3dvcmR9ICgke2NvdW50fSlgKS5qb2luKCc8YnI+Jyk7XHJcblxyXG4gICAgICAgIGNvbnN0IHBvcHVwID0gdGhpcy5jcmVhdGVQb3B1cCh3b3JkTGlzdCk7XHJcbiAgICAgICAgdGhpcy5hcHAud29ya3NwYWNlLmNvbnRhaW5lckVsLmFwcGVuZENoaWxkKHBvcHVwKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVQb3B1cChjb250ZW50OiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBwb3B1cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHBvcHVwLmNsYXNzTGlzdC5hZGQoJ215LXBvcHVwJyk7XHJcbiAgICBcclxuICAgICAgICBjb25zdCBwb3B1cENvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBwb3B1cENvbnRlbnQuY2xhc3NMaXN0LmFkZCgncG9wdXAtY29udGVudCcpO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3QgY2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgY2xvc2VCdXR0b24uY2xhc3NMaXN0LmFkZCgnY2xvc2UnKTtcclxuICAgICAgICBjbG9zZUJ1dHRvbi5pbm5lckhUTUwgPSAnJnRpbWVzOyc7XHJcbiAgICAgICAgY2xvc2VCdXR0b24ub25jbGljayA9ICgpID0+IHBvcHVwLnJlbW92ZSgpO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3QgY29udGVudERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGNvbnRlbnREaXYuaW5uZXJIVE1MID0gY29udGVudDtcclxuICAgIFxyXG4gICAgICAgIHBvcHVwQ29udGVudC5hcHBlbmRDaGlsZChjbG9zZUJ1dHRvbik7XHJcbiAgICAgICAgcG9wdXBDb250ZW50LmFwcGVuZENoaWxkKGNvbnRlbnREaXYpO1xyXG4gICAgICAgIHBvcHVwLmFwcGVuZENoaWxkKHBvcHVwQ29udGVudCk7XHJcbiAgICBcclxuICAgICAgICAvLyBBcHBseWluZyBDU1Mgc3R5bGVzXHJcbiAgICAgICAgcG9wdXAuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xyXG4gICAgICAgIHBvcHVwLnN0eWxlLnRvcCA9ICcxMDBweCc7IFxyXG4gICAgICAgIHBvcHVwLnN0eWxlLmxlZnQgPSAnOTYlJztcclxuICAgICAgICBwb3B1cC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgtNTAlKSc7XHJcbiAgICAgICAgY29udGVudERpdi5zdHlsZS5tYXhIZWlnaHQgPSAnMzAwcHgnOyBcclxuICAgICAgICBjb250ZW50RGl2LnN0eWxlLm92ZXJmbG93WSA9ICdhdXRvJzsgLy8gRW5hYmxlIHZlcnRpY2FsIHNjcm9sbGluZ1xyXG4gICAgXHJcbiAgICAgICAgcmV0dXJuIHBvcHVwO1xyXG4gICAgfVxyXG5cclxuICAgIG9udW5sb2FkKCkge1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jcmVhdGVkRXZlbnRMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB0aGlzLmFwcC52YXVsdC5vZmYoXCJjcmVhdGVcIiwgdGhpcy5jcmVhdGVkRXZlbnRMaXN0ZW5lcik7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlZEV2ZW50TGlzdGVuZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtB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
