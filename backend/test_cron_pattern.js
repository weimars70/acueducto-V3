
const { CronJob } = require('cron');

try {
    console.log("Testing original failing pattern: '0 22 L * *'");
    new CronJob('0 22 L * *', () => { });
    console.log("Original pattern WORKED (Unexpected)");
} catch (e) {
    console.log("Original pattern FAILED as expected:", e.message);
}

try {
    console.log("Testing new pattern: '0 22 * * *'");
    new CronJob('0 22 * * *', () => { });
    console.log("New pattern WORKED!");
} catch (e) {
    console.log("New pattern FAILED:", e.message);
}
