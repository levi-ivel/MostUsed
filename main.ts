import { Plugin } from 'obsidian';

declare var Plotly: any; // Declare Plotly as a global variable

export default class MostUsedWordsPlugin extends Plugin {
    async onload() {
        console.log('Most Used Words plugin loaded.');

        this.addRibbonIcon('graph', 'Show Most Used Words Graph', async () => {
            await this.showGraph();
        });
    }

    async showGraph() {
        // Load Plotly.js
        const plotlyScript = document.createElement('script');
        plotlyScript.src = 'plotly-latest.min.js'; // Update with the correct path
        document.head.appendChild(plotlyScript);

        plotlyScript.onload = () => {
            // Plotly.js is now loaded, you can use it here
            this.plotChart();
        };
    }

    plotChart() {
        // Get all notes
        const notes = this.app.vault.getMarkdownFiles();

        // Count word occurrences
        const wordCountMap = new Map<string, number>();
        notes.forEach(async (note) => {
            const content = await this.app.vault.read(note);
            const words = content.split(/\s+/);
            words.forEach((word: string) => {
                const normalizedWord = word.toLowerCase();
                if (normalizedWord.length > 0) {
                    const count = wordCountMap.get(normalizedWord) || 0;
                    wordCountMap.set(normalizedWord, count + 1);
                }
            });
        });

        // Sort by word count
        const sortedWords = Array.from(wordCountMap.entries()).sort(
            (a, b) => b[1] - a[1]
        );

        // Display top 100 most used words
        const topWords = sortedWords.slice(0, 100);
        console.log('Top 100 Most Used Words:', topWords);

        // Generate graph data
        const data = [{
            x: topWords.map(([word]) => word),
            y: topWords.map(([_, count]) => count),
            type: 'bar'
        }];

        // Set layout
        const layout = {
            title: 'Most Used Words',
            xaxis: { title: 'Word' },
            yaxis: { title: 'Frequency' }
        };

        // Plot the graph
        Plotly.newPlot('word-chart', data, layout);
    }

    onunload() {
        console.log('Most Used Words plugin unloaded.');
    }
}
