import { Plugin } from 'obsidian';

export default class MostUsedWordsPlugin extends Plugin {
    onload() {
        console.log('Most Used Words plugin loaded.');

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
        popup.innerHTML = `
            <div class="popup-content">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <div class="content">${content}</div>
            </div>
        `;
        // Applying CSS styles
        popup.style.position = 'fixed';
        popup.style.top = '100px'; // Adjust this value as needed
        popup.style.left = '96%';
        popup.style.transform = 'translateX(-50%)';
        
        // Setting maximum height for the content
        const popupContent = popup.querySelector('.content') as HTMLElement;
        popupContent.style.maxHeight = '500px'; // Adjust this value as needed
        popupContent.style.overflowY = 'auto'; // Enable vertical scrolling
    
        return popup;
    }
    
    
    
    

    onunload() {
        console.log('Most Used Words plugin unloaded.');
    }
}
