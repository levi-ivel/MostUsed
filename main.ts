import { Plugin, WorkspaceLeaf, View, TFile } from 'obsidian';

export default class MostUsedWordsPlugin extends Plugin {
    private wordCountMap: Map<string, number> = new Map();
    private activeView: MostUsedWordsView | null = null;

    onload() {
        this.addRibbonIcon('document', 'Show Most Used Words List', async () => {
            await this.showMostUsedWordsList();
        });

        this.addCommand({
            id: 'show-most-used-words-list',
            name: 'Show Most Used Words List',
            callback: async () => {
                await this.showMostUsedWordsList();
            }
        });

        this.registerEvent(this.app.workspace.on('file-open', this.handleFileOpen.bind(this)));
    }

    async showMostUsedWordsList() {
        if (this.wordCountMap.size === 0) {
            await this.calculateWordCountMap();
        }

        const sortedWords = this.getSortedWords();
        const topWords = sortedWords.slice(0, 100);
        const wordList = topWords.map(([word, count], index) => `${index + 1}: ${word} (${count})`);

        const leaf = this.app.workspace.getLeaf();
        const view = new MostUsedWordsView(leaf, wordList);
        leaf.open(view);
        this.activeView = view;
    }

    async calculateWordCountMap() {
        this.wordCountMap.clear();

        const vault = this.app.vault;
        const notes = vault.getMarkdownFiles();

        for (const note of notes) {
            const content = await vault.read(note);
            const words = content.split(/\s+/);
            words.forEach(word => {
                const normalizedWord = word.toLowerCase();
                if (normalizedWord.length > 0) {
                    const count = this.wordCountMap.get(normalizedWord) || 0;
                    this.wordCountMap.set(normalizedWord, count + 1);
                }
            });
        }

        // If a view is active, update its content
        if (this.activeView) {
            const sortedWords = this.getSortedWords();
            const topWords = sortedWords.slice(0, 100);
            const wordList = topWords.map(([word, count], index) => `${index + 1}: ${word} (${count})`);

            this.activeView.updateContent(wordList);
        }
    }

    getSortedWords() {
        return Array.from(this.wordCountMap.entries()).sort((a, b) => b[1] - a[1]);
    }

    handleFileOpen(file: TFile) {
        // Update word count map when a file is opened
        this.calculateWordCountMap();
    }

    onunload() {
        this.wordCountMap.clear();
    }
}

class MostUsedWordsView extends View {
    wordList: string[];

    constructor(leaf: WorkspaceLeaf, wordList: string[]) {
        super(leaf);
        this.wordList = wordList;
    }

    getViewType() {
        return 'most-used-words-view';
    }

    getDisplayText() {
        return 'Most Used Words'; // This is for when you drag it around
    }

    onload() {
        this.containerEl.addClass('markdown-preview-view'); // Apply markdown preview view styles
        this.containerEl.style.overflow = 'auto'; // Enable scroll if content overflows

        this.updateContent(this.wordList);
    }

    updateContent(wordList: string[]) {
        this.containerEl.empty(); // Clear existing content

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('markdown-preview-view-content');

        wordList.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.textContent = item;
            contentDiv.appendChild(itemDiv);
        });

        this.containerEl.appendChild(contentDiv);
    }
}
