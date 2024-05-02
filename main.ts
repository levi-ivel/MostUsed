import { Plugin, TAbstractFile } from 'obsidian';

export default class MostUsedWordsPlugin extends Plugin {
    private createdEventListener: ((file: TAbstractFile) => void) | null = null;

    onload() {

        this.createdEventListener = (file: TAbstractFile) => {
        };

        if (this.createdEventListener) {
            this.app.vault.on("create", this.createdEventListener);
        }

        this.addRibbonIcon('document', 'Show Most Used Words Graph', async () => {
            await this.showMostUsedWordsList();
        });

        this.addCommand({
            id: 'show-most-used-words-list',
            name: 'Show Most Used Words List',
            callback: async () => {
                await this.showMostUsedWordsList();
            }
        });
    }

    async showMostUsedWordsList() {
        // Get all notes
        const notes = this.app.vault.getMarkdownFiles();

        // Count word occurrences
        const wordCountMap = new Map();
        for (const note of notes) {
            const content = await this.app.vault.read(note);
            const words = content.split(/\s+/);
            words.forEach(word => {
                const normalizedWord = word.toLowerCase();
                if (normalizedWord.length > 0) {
                    const count = wordCountMap.get(normalizedWord) || 0;
                    wordCountMap.set(normalizedWord, count + 1);
                }
            });
        }

        // Sort by word count
        const sortedWords = Array.from(wordCountMap.entries()).sort(
            (a, b) => b[1] - a[1]
        );

        // Display top 100 most used words in a popup window
        const topWords = sortedWords.slice(0, 100);
        const wordList = topWords.map(([word, count], index) => `${index + 1}: ${word} (${count})`).join('<br>');

        const popup = this.createPopup(wordList);
        this.app.workspace.containerEl.appendChild(popup);
    }

    createPopup(content: string) {
        const popup = document.createElement('div') as HTMLElement;
        popup.classList.add('my-popup');
    
        const popupContent = document.createElement('div');
        popupContent.classList.add('popup-content');
    
        const closeButton = document.createElement('span');
        closeButton.classList.add('close');
        closeButton.innerHTML = '&times;';
        closeButton.onclick = () => popup.remove();
    
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = content;
    
        popupContent.appendChild(closeButton);
        popupContent.appendChild(contentDiv);
        popup.appendChild(popupContent);
    
        // Applying CSS styles
        popup.style.position = 'fixed';
        popup.style.top = '100px'; 
        popup.style.left = '96%';
        popup.style.transform = 'translateX(-50%)';
        contentDiv.style.maxHeight = '300px'; 
        contentDiv.style.overflowY = 'auto'; // Enable vertical scrolling
    
        return popup;
    }

    onunload() {

        if (this.createdEventListener) {
            this.app.vault.off("create", this.createdEventListener);
            this.createdEventListener = null;
        }
    }
}
