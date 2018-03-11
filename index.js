require('dotenv').config();
const Logging = require('@google-cloud/logging');
const path = require('path');

class Logger {
  constructor({ logName, metadata, workerId, projectId, keyFilename }) {
    this.metadata = metadata || { resource: { type: 'global' } };
    this.workerId = workerId;
    this.projectId = projectId;
    this.labels = {
      DEPLOYMENT: 'DEPLOYMENT',
      DATA_UPDATE: 'DATA_UPDATE',
      START: 'START',
      DELAYED: 'DELAYED',
      OFFLINE: 'OFFLINE',
      CRASH: 'CRASH',
    };

    const logging = new Logging({
      projectId: projectId,
      keyFilename: keyFilename,
    });

    this.log = logging.log(logName || 'default');
    this.logName = this.log.formattedName_;    
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
  async getEntries(providedLogName = null, options = { orderBy: 'timestamp desc' }) {
    let logName;
    if (!providedLogName) {
      logName = this.logName;
    } else {
      logName = this.constructor.formatName(this.projectId, providedLogName);
    }
    options = Object.assign(options, {
      filter: 'logName="' + logName + '"',
    });

    const entries = await this.log.getEntries(options);
    return entries;
  }

  /**
   * @function
   * @param {labelName} - label name
   * @return {label}
   * @description - Get a valid label name from constant list
   */

  getLabel(labelName) {
    return this.labels[labelName] || false;
  }

  static formatName(projectId, name) {
    var path = 'projects/' + projectId + '/logs/';
    name = name.replace(path, '');

    if (decodeURIComponent(name) === name) {
      // The name has not been encoded yet.
      name = encodeURIComponent(name);
    }

    return path + name;
  }; 
}

module.exports = Logger;
