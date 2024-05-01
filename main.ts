import { Plugin } from 'obsidian';

export default class MostUsedWordsPlugin extends Plugin {
    async onload() {
        console.log('Most Used Words plugin loaded.');

        this.addRibbonIcon('graph', 'Show Most Used Words Graph', async () => {
            await this.showGraph();
        });

        this.addCommand({
            id: 'show-most-used-words-list',
            name: 'Show Most Used Words List',
            callback: async () => {
                await this.showMostUsedWordsList();
            }
        });
    }

    async showGraph() {
        // Your code to display the graph using Plotly.js
    }

    async showMostUsedWordsList() {
        // Get all notes
        const notes = this.app.vault.getMarkdownFiles();

        // Count word occurrences
        const wordCountMap = new Map<string, number>();
        for (const note of notes) {
            const content = await this.app.vault.read(note);
            const words = content.split(/\s+/);
            words.forEach((word: string) => {
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

        // Display top 100 most used words
        const topWords = sortedWords.slice(0, 100);
        const wordList = topWords.map(([word, count], index) => `${index + 1}: ${word} (${count})`).join('\n');

        // Create a new Markdown file with the list of most used words
        const fileName = 'MostUsedWordsList.md';
        const fileContent = `# Top 100 Most Used Words\n\n${wordList}`;
        await this.app.vault.create(fileName, fileContent);
    }

    onunload() {
        console.log('Most Used Words plugin unloaded.');
    }
}
