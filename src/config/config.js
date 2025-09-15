const config = {
  scrapeTargets: [
    {
      name: 'openai',
      url: 'https://openai.com',
      selectors: {
        title: 'h1',
        description: '.description',
        features: '.feature-list li'
      }
    },
    {
      name: 'anthropic',
      url: 'https://anthropic.com',
      selectors: {
        title: 'h1',
        description: '.hero-description',
        features: '.capabilities li'
      }
    }
  ],

  browser: {
    headless: process.env.BROWSER_HEADLESS === 'true',
    timeout: 30000,
    delay: parseInt(process.env.SCRAPE_DELAY) || 1000
  },

  output: {
    format: process.env.OUTPUT_FORMAT || 'json',
    directory: './data/processed'
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    directory: './logs'
  }
};

module.exports = config;