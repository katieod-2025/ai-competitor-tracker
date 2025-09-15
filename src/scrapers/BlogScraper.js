const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');
const { saveData } = require('../utils/dataHandler');

class BlogScraper {
  constructor(target) {
    this.target = target;
  }

  async scrape() {
    try {
      logger.info(`Fetching blog ${this.target.url}`);

      const response = await axios.get(this.target.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const data = this.extractBlogData($);

      await saveData(this.target.name, data);
      logger.info(`Successfully scraped ${this.target.name} blog with ${data.posts?.length || 0} posts`);

    } catch (error) {
      logger.error(`Error scraping ${this.target.name} blog:`, error.message);
      throw error;
    }
  }

  extractBlogData($) {
    const posts = [];

    $('.blog-post-title').each((i, element) => {
      if (i >= 10) return false;

      const $titleElement = $(element);
      const $container = $titleElement.closest('[class*="blog"], article, .post');

      const title = $titleElement.text().trim();
      const link = $titleElement.attr('href') || $container.find('a').first().attr('href');
      const date = $container.find('.blog-post-date').first().text().trim();
      const labels = $container.find('.blog-post-labels').first().text().trim();

      if (title && title.length > 5) {
        posts.push({
          title: title.substring(0, 200),
          link: this.resolveUrl(link),
          excerpt: labels.substring(0, 100),
          date: date
        });
      }
    });

    if (posts.length === 0) {
      $('a[href^="/blog/"]').each((i, element) => {
        if (i >= 10) return false;

        const $link = $(element);
        const title = $link.text().trim();
        const href = $link.attr('href');

        if (title && title.length > 10) {
          posts.push({
            title: title.substring(0, 200),
            link: this.resolveUrl(href),
            excerpt: '',
            date: ''
          });
        }
      });
    }

    return {
      title: $('title').text() || '',
      description: $('meta[name="description"]').attr('content') || '',
      h1: $('h1').first().text() || '',
      url: this.target.url,
      timestamp: new Date().toISOString(),
      posts: posts.slice(0, 10)
    };
  }

  resolveUrl(url) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return new URL(url, this.target.url).href;
    return url;
  }
}

module.exports = BlogScraper;