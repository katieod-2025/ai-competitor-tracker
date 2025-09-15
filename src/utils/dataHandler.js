const fs = require('fs').promises;
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const logger = require('./logger');
const config = require('../config/config');

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function saveData(sourceName, data) {
  try {
    await ensureDirectoryExists(config.output.directory);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${sourceName}_${timestamp}`;

    if (config.output.format === 'json') {
      await saveAsJSON(filename, data);
    } else if (config.output.format === 'csv') {
      await saveAsCSV(filename, data);
    }

    logger.info(`Data saved for ${sourceName}`);
  } catch (error) {
    logger.error(`Error saving data for ${sourceName}:`, error);
    throw error;
  }
}

async function saveAsJSON(filename, data) {
  const filepath = path.join(config.output.directory, `${filename}.json`);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
}

async function saveAsCSV(filename, data) {
  const filepath = path.join(config.output.directory, `${filename}.csv`);

  if (Array.isArray(data) && data.length > 0) {
    const headers = Object.keys(data[0]).map(key => ({ id: key, title: key }));

    const csvWriter = createCsvWriter({
      path: filepath,
      header: headers
    });

    await csvWriter.writeRecords(data);
  } else {
    const csvWriter = createCsvWriter({
      path: filepath,
      header: Object.keys(data).map(key => ({ id: key, title: key }))
    });

    await csvWriter.writeRecords([data]);
  }
}

module.exports = {
  saveData,
  saveAsJSON,
  saveAsCSV
};