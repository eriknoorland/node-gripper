const EventEmitter = require('events');
const SerialPort = require('serialport');
const cobs = require('cobs');
const Parser = require('./Parser');

/**
 * Gripper
 * @param {String} path
 * @return {Object}
 */
const gripper = (path) => {
  const eventEmitter = new EventEmitter();
  const requestStartFlag = 0xA6;

  let port;
  let parser;

  /**
   * Init
   * @return {Promise}
   */
  function init() {
    return new Promise((resolve, reject) => {
      if (port) {
        setTimeout(reject, 0);
      }

      port = new SerialPort(path, { baudRate: 115200 });
      parser = new Parser();

      port.pipe(parser);

      port.on('error', error => eventEmitter.emit('error', error));
      port.on('disconnect', () => eventEmitter.emit('disconnect'));
      port.on('close', () => eventEmitter.emit('close'));
      port.on('open', onPortOpen);

      parser.on('ready', resolve);
    });
  }

  /**
   * Ask controller for ready response
   * @return {Promise}
   */
  function isReady() {
    writeToSerialPort([requestStartFlag, 0x01]);

    return Promise.resolve();
  }

  /**
   *
   * @param {Number} angle
   * @return {Promise}
   */
  function setJawAngle(angle) {
    return new Promise((resolve) => {
      writeToSerialPort([requestStartFlag, 0x02, angle]);
      setTimeout(resolve, 250);
    });
  }

  /**
   *
   * @param {Number} angle
   * @return {Promise}
   */
  function setLiftAngle(angle) {
    return new Promise((resolve) => {
      writeToSerialPort([requestStartFlag, 0x03, angle]);
      setTimeout(resolve, 250);
    });
  }

  function writeToSerialPort(data) {
    port.write(cobs.encode(Buffer.from(data), true));
  }

  function close() {
    port.close();
  }

  function onPortOpen() {
    port.flush(error => {
      if (error) {
        eventEmitter.emit('error', error);
      }
    });
  }

  return {
    close,
    init,
    isReady,
    setJawAngle,
    setLiftAngle,
    on: eventEmitter.on.bind(eventEmitter),
    off: eventEmitter.off.bind(eventEmitter),
  };
};

module.exports = gripper;
