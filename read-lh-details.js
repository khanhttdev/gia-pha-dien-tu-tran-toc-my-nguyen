const fs = require('fs');
const report = JSON.parse(fs.readFileSync('./lighthouse-report.json', 'utf8'));

const audits = report.audits;
const perfAudits = Object.values(audits)
    .filter(a => a.score !== null && a.score < 1 && a.details && a.details.type === 'opportunity')
    .sort((a, b) => (b.details?.overallSavingsMs || 0) - (a.details?.overallSavingsMs || 0))
    .slice(0, 5);

console.log('--- Top Performance Opportunities ---');
perfAudits.forEach(a => {
    console.log(`- ${a.title} (Savings: ${a.details.overallSavingsMs}ms)`);
    if (a.details.items) {
        a.details.items.slice(0, 3).forEach(item => {
            console.log(`  * ${item.url || item.node?.snippet}`);
        });
    }
});

const diagAudits = Object.values(audits)
    .filter(a => a.score !== null && a.score < 1 && a.details && a.details.type !== 'opportunity')
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

console.log('\n--- Top Performance Diagnostics/Errors ---');
diagAudits.forEach(a => {
    console.log(`- ${a.title} (Score: ${Math.round(a.score * 100)})`);
    if (a.details.items) {
        a.details.items.slice(0, 3).forEach(item => {
            console.log(`  * ${item.node?.snippet || item.url}`);
        });
    }
});
