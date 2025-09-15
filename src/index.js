const dotenv = require('dotenv');
const logger = require('./utils/logger');
const ScrapingManager = require('./scrapers/ScrapingManager');

dotenv.config();

async function main() {
  try {
    logger.info('Starting AI Competitor Tracker...');

    const scrapingManager = new ScrapingManager();
    await scrapingManager.initialize();

    logger.info('Scraping completed successfully');
  } catch (error) {
    logger.error('Error in main process:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = main;