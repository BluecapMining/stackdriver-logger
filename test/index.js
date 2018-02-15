require('dotenv').config();
const chai = require('chai');

const should = chai.should();
const assert = chai.assert;
const Logger = require('../index');

const logName = 'test'; 
const workerId = 'test-worker';
const logger = new Logger({ logName, workerId });

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
  });

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
  });

  it('it should assign a label', (done) => {
    logger.write('hello', { label: 'Error' }).then(() => {
      logger.getEntries().then((response) => {
        response.length.should.eql(1);
        const entries = response[0];
        console.log(entries[0])
        entries[0].should.have.property('metadata');
        entries[0].should.have.property('data');
        entries[0].data.should.have.property('message').eql('hello');
        entries[0].metadata.labels.label.should.eql('Error');
        done();
      });
    }).catch(err => console.log(err));
  });
});
