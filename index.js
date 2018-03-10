require('dotenv').config();
const Logging = require('@google-cloud/logging');
const path = require('path');

class Logger {
  constructor({ logName, metadata, workerId, projectId, keyFilename }) {
    this.logName = logName || 'default';
    this.metadata = metadata || { resource: { type: 'global' } };
    this.workerId = workerId;
    this.labels = {
      DEPLOYMENT: 'DEPLOYMENT',
      DATA_UPDATE: 'DATA_UPDATE',
      START: 'START',
      CRASH: 'CRASH',
    };

    const logging = new Logging({
      projectId: projectId,
      keyFilename: keyFilename,
    });

    this.log = logging.log(logName);
  }

  /**
   * @function
   * @param {string} - message
   * @param {any} - options
   * @return {promise}
   * @description - Write a message to Stackdriver
   */
  async write(message, options = { label: null }) {
    let { metadata } = this;
    if (options.label) {
      metadata = Object.assign(metadata, { labels: { label: options.label } });
    }
    const data = { worker: this.workerId, message };
    const entry = this.log.entry(metadata, data);
    await this.log.write(entry);
  }

  /**
   * @function
   * @return {promise}
   * @description - Delete the log
   */
  async delete() {
    await this.log.delete();
  }

  /**
   * @function
   * @param {any} - options
   * @return {promise}
   * @description - Get all log entries. Optionally pass in ordering filter
   */
  async getEntries(options = { orderBy: 'timestamp desc' }) {
    const entries = await this.log.getEntries(options);
    return entries;
  }
}

module.exports = Logger;
