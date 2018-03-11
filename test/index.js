require('dotenv').config();
const path = require('path')
const chai = require('chai');
const should = chai.should();
const assert = chai.assert;
const Logger = require('../index');

const logName = 'test'; 
const workerId = 'test-worker';
credentials = {
  projectId: process.env.PROJECT_ID,
  keyFilename: path.resolve(__dirname, '.', 'test_stackdriver_service.json'),
}
const logger = new Logger(Object.assign({ logName, workerId }, credentials));

after(() => {
  logger.delete();
});

describe('Logger', () => {
  it('should get entries in descending order', (done) => {
    logger.getEntries().then((response) => {
      let prev;
      response[0].forEach((curr, i) => {
        if (i === 0) prev = curr;
        prevTime = new Date(prev.metadata.timestamp).getTime();
        currTime = new Date(curr.metadata.timestamp).getTime();
        assert(currTime <= prevTime, 'dates not descending order');
        prev = curr;
      });
      done();
    });
  }).timeout(5000);

  it('it should create a new log entry', (done) => {
    logger.write('hello').then(() => {
      logger.getEntries().then((response) => {
        response.length.should.eql(1);
        const entries = response[0];
        entries[0].should.have.property('data');
        entries[0].data.should.have.property('message').eql('hello');
        done();
      });
    }).catch(err => console.log(err));
  }).timeout(5000);

  it('it should assign a label', (done) => {
    logger.write('hello', { label: 'Error' }).then(() => {
      logger.getEntries().then((response) => {
        response.length.should.eql(1);
        const entries = response[0];
        entries[0].should.have.property('metadata');
        entries[0].should.have.property('data');
        entries[0].data.should.have.property('message').eql('hello');
        entries[0].metadata.labels.label.should.eql('Error');
        done();
      });
    }).catch(err => console.log(err));
  }).timeout(5000);

  it('it should only get the entries for logName', async (done) => {
    try {
      const friendLogger = new Logger(Object.assign({ logName: 'friend', workerId }, credentials));
      const enemyLogger = new Logger(Object.assign({ logName: 'enemy', workerId }, credentials));
  
      await friendLogger.write('hello');
      await enemyLogger.write('sup');
  
      const entries = await friendLogger.getEntries();
    } catch (e) {
      
    } finally {
      await friendLogger.delete();
      await enemyLogger.delete();
    }


  }).timeout(10000)
});
