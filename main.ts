import { Plugin, WorkspaceLeaf, View, TFile } from 'obsidian';
import Chart from 'chart.js/auto';

export default class MostUsedWordsPlugin extends Plugin {
    private wordCountMap: Map<string, number> = new Map();
    public activeView: MostUsedWordsView | null = null;

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
        this.registerEvent(this.app.workspace.on('editor-change', this.handleEditorChange.bind(this)));
        this.registerEvent(this.app.workspace.on('active-leaf-change', this.handleActiveLeafChange.bind(this)));

        // Close tab when Obsidian is reloaded
        this.registerEvent(this.app.workspace.on('quit', () => {
            this.closeMostUsedWordsList();
        }));
    }

    async showMostUsedWordsList() {
        if (!this.activeView) {
            await this.calculateWordCountMap();
            const sortedWords = this.getSortedWords();
            const topWords = sortedWords.slice(0, 10); // Limit to top 10 words
            const labels = topWords.map(([word]) => word);
            const data = topWords.map(([_, count]) => count);
            const leaf = this.app.workspace.getLeaf();
            const view = new MostUsedWordsView(leaf, labels, data, this); // Pass 'this' as the plugin instance
            leaf.open(view);
            this.activeView = view;
        }
    }
    

    async calculateWordCountMap() {
        this.wordCountMap.clear();

        const vault = this.app.vault;
        const notes = vault.getMarkdownFiles();

        for (const note of notes) {
            const content = await vault.read(note);
            const words = content.split(/\s+/);
            words.forEach(word => {
                const normalizedWord = word.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
                if (normalizedWord.length > 0) {
                    const count = this.wordCountMap.get(normalizedWord) || 0;
                    this.wordCountMap.set(normalizedWord, count + 1);
                }
            });
        }

        if (this.activeView) {
            const sortedWords = this.getSortedWords();
            const topWords = sortedWords.slice(0, 10); // Limit to top 10 words
            const labels = topWords.map(([word]) => word);
            const data = topWords.map(([_, count]) => count);
            this.activeView.updateContent(labels, data);
            this.activeView.setTabText();
        }
    }

    getSortedWords() {
        return Array.from(this.wordCountMap.entries()).sort((a, b) => b[1] - a[1]);
    }

    handleFileOpen(file: TFile) {
        this.calculateWordCountMap();
    }

    handleEditorChange() {
        this.calculateWordCountMap();
    }

    handleActiveLeafChange(leaf: WorkspaceLeaf | null) {
        if (leaf && leaf.view instanceof MostUsedWordsView) {
            this.activeView = leaf.view;
            this.calculateWordCountMap();
        }
    }

    closeMostUsedWordsList() {
        if (this.activeView) {
            this.activeView.unload();
        }
    }
    

    onunload() {
        this.wordCountMap.clear();
        this.closeMostUsedWordsList();
    }
}

class MostUsedWordsView extends View {
    labels: string[];
    data: number[];
    chart: Chart | null = null;
    plugin: MostUsedWordsPlugin;

    constructor(leaf: WorkspaceLeaf, labels: string[], data: number[], plugin: MostUsedWordsPlugin) {
        super(leaf);
        this.labels = labels;
        this.data = data;
        this.plugin = plugin;
    }

    getViewType() {
        return 'most-used-words-view';
    }

    getDisplayText() {
        return 'Most Used Words';
    }

    onload() {
        this.containerEl.addClass('most-used-words-view');
        this.renderChart();
    }

    updateContent(labels: string[], data: number[]) {
        this.labels = labels;
        this.data = data;
        if (this.chart) {
            this.chart.data.labels = labels;
            this.chart.data.datasets[0].data = data;
            this.chart.update();
        }
    }

    renderChart() {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        this.containerEl.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        if (ctx) {
            this.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.labels,
                    datasets: [{
                        label: 'Word Count',
                        data: this.data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    setTabText() {
        const leafTitle = this.app.workspace.activeLeaf?.getViewState().type;
        if (leafTitle) {
            this.app.workspace.activeLeaf?.setEphemeralState({
                ...this.app.workspace.activeLeaf?.getEphemeralState(),
                title: 'Most Used Words'
            });
        }
    }

    unload() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        super.unload();
        if (this.plugin) {
            this.plugin.activeView = null; // Notify the plugin that the view is closed
        }
    }
}

