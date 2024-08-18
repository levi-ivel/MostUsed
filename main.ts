import { Plugin, WorkspaceLeaf, View, TFile, PluginSettingTab, Setting, App, TFolder } from 'obsidian';
import Chart from 'chart.js/auto';

interface MostUsedWordsPluginSettings {
    excludeNumbers: boolean;
    excludeCommonWords: boolean;
    excludeTags: boolean;
    customExcludedWords: string;
    scanOption: 'vault' | 'folder' | 'note';
    folderPath: string;
    notePath: string;
}

const DEFAULT_SETTINGS: MostUsedWordsPluginSettings = {
    excludeNumbers: false,
    excludeCommonWords: false,
    excludeTags: false,
    customExcludedWords: '',
    scanOption: 'vault',
    folderPath: '',
    notePath: '',
};

export default class MostUsedWordsPlugin extends Plugin {
    private wordCountMap: Map<string, number> = new Map();
    public activeView: MostUsedWordsView | null = null;
    public settings: MostUsedWordsPluginSettings;

    async onload() {
        await this.loadSettings();

        this.addRibbonIcon('document', 'Show most used words graph', async () => {
            await this.showMostUsedWordsGraph();
        });

        this.addCommand({
            id: 'show-most-used-words-graph',
            name: 'Show most used words graph',
            callback: async () => {
                await this.showMostUsedWordsGraph();
            }
        });

        this.addSettingTab(new MostUsedWordsSettingTab(this.app, this));

        this.registerEvent(this.app.workspace.on('file-open', this.handleFileOpen.bind(this)));
        this.registerEvent(this.app.workspace.on('editor-change', this.handleEditorChange.bind(this)));
        this.registerEvent(this.app.workspace.on('active-leaf-change', this.handleActiveLeafChange.bind(this)));

        this.registerEvent(this.app.workspace.on('quit', () => {
            this.closeMostUsedWordsGraph();
        }));
    }

    async showMostUsedWordsGraph() {
        if (!this.activeView) {
            await this.calculateWordCountMap();
            const sortedWords = this.getSortedWords();
            const topWords = sortedWords.slice(0, 100);
            const labels = topWords.map(([word]) => word);
            const data = topWords.map(([_, count]) => count);
            const leaf = this.app.workspace.getLeaf();
            const view = new MostUsedWordsView(leaf, labels, data, this);
            leaf.open(view);
            this.activeView = view;
        }
    }

    async calculateWordCountMap() {
        const currentWordCountMap = new Map<string, number>();

        const vault = this.app.vault;
        let notes: TFile[] = [];

        if (this.settings.scanOption === 'vault') {
            notes = vault.getMarkdownFiles();
        } else if (this.settings.scanOption === 'folder') {
            const folder = vault.getAbstractFileByPath(this.settings.folderPath) as TFolder;
            if (folder && folder instanceof TFolder) {
                notes = await this.getAllMarkdownFilesFromFolder(folder);
            }
        } else if (this.settings.scanOption === 'note') {
            let notePath = this.settings.notePath.trim();
            if (!notePath.endsWith('.md')) {
                notePath += '.md';
            }
            const note = vault.getAbstractFileByPath(notePath) as TFile;
            if (note && note instanceof TFile) {
                notes = [note];
            }
        }

        for (const note of notes) {
            const content = await vault.read(note);
            const words = content.split(/\s+/);
            words.forEach(word => {
                const normalizedWord = word.toLowerCase().replace(/[^a-zA-Z0-9#]/g, '');
                if (normalizedWord.length > 0) {
                    const count = currentWordCountMap.get(normalizedWord) || 0;
                    currentWordCountMap.set(normalizedWord, count + 1);
                }
            });
        }

        this.applySettingsFilters(currentWordCountMap);

        this.wordCountMap = currentWordCountMap;

        if (this.activeView) {
            const sortedWords = this.getSortedWords();
            const topWords = sortedWords.slice(0, 100);
            const labels = topWords.map(([word]) => word);
            const data = topWords.map(([_, count]) => count);
            this.activeView.updateContent(labels, data);
            this.activeView.setTabText();
        }
    }

    async getAllMarkdownFilesFromFolder(folder: TFolder): Promise<TFile[]> {
        let files: TFile[] = [];
        for (const file of folder.children) {
            if (file instanceof TFile && file.extension === 'md') {
                files.push(file);
            } else if (file instanceof TFolder) {
                files = files.concat(await this.getAllMarkdownFilesFromFolder(file));
            }
        }
        return files;
    }

    applySettingsFilters(wordCountMap: Map<string, number>) {
        if (this.settings.excludeNumbers) {
            wordCountMap.forEach((count, word) => {
                if (!isNaN(Number(word))) {
                    wordCountMap.delete(word);
                }
            });
        }

        if (this.settings.excludeCommonWords) {
            const commonWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i']); 
            wordCountMap.forEach((count, word) => {
                if (commonWords.has(word)) {
                    wordCountMap.delete(word);
                }
            });
        }

        if (this.settings.excludeTags) {
            wordCountMap.forEach((count, word) => {
                if (word.startsWith('#')) {
                    wordCountMap.delete(word);
                }
            });
        }

        if (this.settings.customExcludedWords) {
            const customExcludedWords = new Set(this.settings.customExcludedWords.split('\n').map(word => word.trim().toLowerCase()));
            wordCountMap.forEach((count, word) => {
                if (customExcludedWords.has(word)) {
                    wordCountMap.delete(word);
                }
            });
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

    closeMostUsedWordsGraph() {
        if (this.activeView) {
            this.activeView.unload();
        }
    }

    onunload() {
        this.wordCountMap.clear();
        this.closeMostUsedWordsGraph();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
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
        return 'Most used words graph';
    }

    onload() {
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
                        label: 'Word count',
                        data: this.data
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
        const leaf = this.leaf;
        if (leaf) {
            const title = 'Most used words';
            leaf.setEphemeralState({
                ...leaf.getEphemeralState(),
                title: title
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
            this.plugin.activeView = null;
        }
    }
}

class MostUsedWordsSettingTab extends PluginSettingTab {
    plugin: MostUsedWordsPlugin;

    constructor(app: App, plugin: MostUsedWordsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;

        containerEl.empty();
        containerEl.createEl('h2', { text: 'Most Used Words Plugin Settings' });

        new Setting(containerEl)
            .setName('Exclude Numbers')
            .setDesc('Exclude numbers from the word count')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.excludeNumbers)
                .onChange(async (value: boolean) => {
                    this.plugin.settings.excludeNumbers = value;
                    await this.plugin.saveSettings();
                    this.plugin.calculateWordCountMap();
                }));

        new Setting(containerEl)
            .setName('Exclude Common Words')
            .setDesc('Exclude common English words from the word count')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.excludeCommonWords)
                .onChange(async (value: boolean) => {
                    this.plugin.settings.excludeCommonWords = value;
                    await this.plugin.saveSettings();
                    this.plugin.calculateWordCountMap();
                }));

        new Setting(containerEl)
            .setName('Exclude Tags')
            .setDesc('Exclude words that are tags (starting with #)')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.excludeTags)
                .onChange(async (value: boolean) => {
                    this.plugin.settings.excludeTags = value;
                    await this.plugin.saveSettings();
                    this.plugin.calculateWordCountMap();
                }));

        new Setting(containerEl)
            .setName('Custom Excluded Words')
            .setDesc('Enter words to exclude from the word count, one per line')
            .addTextArea(textArea => textArea
                .setValue(this.plugin.settings.customExcludedWords)
                .onChange(async (value: string) => {
                    this.plugin.settings.customExcludedWords = value;
                    await this.plugin.saveSettings();
                    this.plugin.calculateWordCountMap();
                }));

        new Setting(containerEl)
            .setName('Scan Option')
            .setDesc('Choose what to scan for the most used words')
            .addDropdown(dropdown => dropdown
                .addOptions({
                    'vault': 'Scan entire vault',
                    'folder': 'Scan specific folder',
                    'note': 'Scan specific note'
                })
                .setValue(this.plugin.settings.scanOption)
                .onChange(async (value: 'vault' | 'folder' | 'note') => {
                    this.plugin.settings.scanOption = value;
                    await this.plugin.saveSettings();
                    this.plugin.calculateWordCountMap();
                }));

        new Setting(containerEl)
            .setName('Folder Name')
            .setDesc('Enter the name of the folder (use / if nested in another folder E.g: bigfoldername/smallfoldername))')
            .addText(text => text
                .setValue(this.plugin.settings.folderPath)
                .onChange(async (value: string) => {
                    this.plugin.settings.folderPath = value;
                    await this.plugin.saveSettings();
                    this.plugin.calculateWordCountMap();
                }));

        new Setting(containerEl)
            .setName('Note Name')
            .setDesc('Enter the name of the note (use / if nested in a folder E.g: foldername/notename))')
            .addText(text => text
                .setValue(this.plugin.settings.notePath)
                .onChange(async (value: string) => {
                    this.plugin.settings.notePath = value;
                    await this.plugin.saveSettings();
                    this.plugin.calculateWordCountMap();
                }));
    }
}
