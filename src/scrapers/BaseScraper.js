const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const { saveData } = require('../utils/dataHandler');

class BaseScraper {
  constructor(target) {
    this.target = target;
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/Users/katieod/.cache/puppeteer/chrome/mac_arm-121.0.6167.85/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    });
    this.page = await this.browser.newPage();

    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  }

  async scrape() {
    try {
      await this.initialize();

      logger.info(`Navigating to ${this.target.url}`);
      await this.page.goto(this.target.url, { waitUntil: 'networkidle0' });

      const data = await this.extractData();
      await saveData(this.target.name, data);

    } finally {
      await this.cleanup();
    }
  }

  async extractData() {
    return await this.page.evaluate(() => {
      const title = document.querySelector('title')?.textContent || '';
      const description = document.querySelector('meta[name="description"]')?.content || '';

      return {
        title,
        description,
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = BaseScraper;