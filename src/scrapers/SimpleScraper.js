const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');
const { saveData } = require('../utils/dataHandler');

class SimpleScraper {
  constructor(target) {
    this.target = target;
  }

  async scrape() {
    try {
      logger.info(`Fetching ${this.target.url}`);

      const response = await axios.get(this.target.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const data = this.extractData($);

      await saveData(this.target.name, data);
      logger.info(`Successfully scraped ${this.target.name}`);

    } catch (error) {
      logger.error(`Error scraping ${this.target.name}:`, error.message);
      throw error;
    }
  }

  extractData($) {
    return {
      title: $('title').text() || '',
      description: $('meta[name="description"]').attr('content') || '',
      h1: $('h1').first().text() || '',
      url: this.target.url,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = SimpleScraper;