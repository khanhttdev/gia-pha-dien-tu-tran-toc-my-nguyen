const fs = require('fs');

try {
    const data = fs.readFileSync('./lighthouse-report-after.json', 'utf8');
    const report = JSON.parse(data);
    const cats = report.categories;

    console.log('--- Lighthouse Scores (AFTER) ---');
    console.log('Performance:', Math.round(cats.performance.score * 100));
    console.log('Accessibility:', Math.round(cats.accessibility.score * 100));
    console.log('Best Practices:', Math.round(cats['best-practices'].score * 100));
    console.log('SEO:', Math.round(cats.seo.score * 100));

    const rules = report.audits;
    let hasErrors = false;

    if (rules['image-alt'] && rules['image-alt'].score !== 1) {
        console.log('-> Still Failing: Missing alt text on images');
        hasErrors = true;
    }
    if (rules['button-name'] && rules['button-name'].score !== 1) {
        console.log('-> Still Failing: Missing aria-labels on buttons');
        hasErrors = true;
    }

    if (!hasErrors) {
        console.log('-> All Guardian constraints passed!');
    }

} catch (e) {
    console.error('Error reading report:', e.message);
}
