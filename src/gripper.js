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
   * Constructor
   */
  function constructor() {}

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
   * @param {Number} jawCloseAngle
   * @param {Number} jawOpenAngle
   * @param {Number} liftUpAngle
   * @param {Number} liftDownAngle
   * @return {Promise}
   */
  function config(jawCloseAngle, jawOpenAngle, liftUpAngle, liftDownAngle) {
    return new Promise(async (resolve) => {
      writeToSerialPort([
        requestStartFlag,
        0x02,
        jawCloseAngle,
        jawOpenAngle,
        liftUpAngle,
        liftDownAngle,
      ]);

      await open();
      await lower();

      setTimeout(resolve, 250);
    });
  }

  /**
   *
   * @return {Promise}
   */
  function open() {
    return new Promise((resolve) => {
      writeToSerialPort([requestStartFlag, 0x03]);
      setTimeout(resolve, 250);
    });
  }

  /**
   *
   * @return {Promise}
   */
  function close() {
    return new Promise((resolve) => {
      writeToSerialPort([requestStartFlag, 0x04]);
      setTimeout(resolve, 250);
    });
  }

  /**
   *
   * @return {Promise}
   */
  function lift() {
    return new Promise((resolve) => {
      writeToSerialPort([requestStartFlag, 0x05]);
      setTimeout(resolve, 250);
    });
  }

  /**
   *
   * @return {Promise}
   */
  function lower() {
    return new Promise((resolve) => {
      writeToSerialPort([requestStartFlag, 0x06]);
      setTimeout(resolve, 250);
    });
  }

  /**
   * Writes the given buffer to the serial port
   * @param {Array} data
   */
  function writeToSerialPort(data) {
    port.write(cobs.encode(Buffer.from(data), true));
  };

  /**
   * Port open event handler
   */
  function onPortOpen() {
    port.flush(error => {
      if (error) {
        eventEmitter.emit('error', error);
      }
    });
  }

  constructor();

  return {
    init,
    isReady,
    config,
    open,
    close,
    lift,
    lower,
    on: eventEmitter.on.bind(eventEmitter),
    off: eventEmitter.off.bind(eventEmitter),
  };
};

module.exports = gripper;
