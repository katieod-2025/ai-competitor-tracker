const SimpleScraper = require('./SimpleScraper');
const BlogScraper = require('./BlogScraper');
const logger = require('../utils/logger');
const config = require('../config/config');

class ScrapingManager {
  constructor() {
    this.scrapers = [];
  }

  async initialize() {
    logger.info('Initializing scraping manager...');

    for (const target of config.scrapeTargets) {
      const scraper = target.name === 'google-ai'
        ? new BlogScraper(target)
        : new SimpleScraper(target);
      this.scrapers.push(scraper);
    }

    await this.runScrapers();
  }

  async runScrapers() {
    for (const scraper of this.scrapers) {
      try {
        logger.info(`Starting scraper for ${scraper.target.name}`);
        await scraper.scrape();
      } catch (error) {
        logger.error(`Error in scraper ${scraper.target.name}:`, error);
      }
    }
  }
}

module.exports = ScrapingManager;