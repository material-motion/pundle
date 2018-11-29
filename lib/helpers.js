'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fillMiddlewareConfig = fillMiddlewareConfig;
exports.fillServerConfig = fillServerConfig;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function fillMiddlewareConfig(config) {
  var toReturn = {};

  if (typeof config.hmrPath !== 'undefined') {
    if (config.hmrPath) {
      (0, _assert2.default)(typeof config.hmrPath === 'string', 'config.hmrPath must be a string or null');
      toReturn.hmrPath = config.hmrPath;
    } else toReturn.hmrPath = null;
  } else toReturn.hmrPath = '/__sb_pundle_hmr';
  if (config.hmrHost) {
    (0, _assert2.default)(typeof config.hmrHost === 'string', 'config.hmrHost must be a string');
    toReturn.hmrHost = config.hmrHost;
  } else toReturn.hmrHost = '';
  if (config.bundlePath) {
    (0, _assert2.default)(typeof config.bundlePath === 'string', 'config.bundlePath must be a string');
    toReturn.bundlePath = config.bundlePath;
  } else toReturn.bundlePath = '/bundle.js';
  if (typeof config.sourceMap !== 'undefined') {
    toReturn.sourceMap = !!config.sourceMap;
  } else toReturn.sourceMap = true;
  if (config.sourceMapPath) {
    (0, _assert2.default)(typeof config.sourceMapPath === 'string', 'config.sourceMapPath must be a string');
    toReturn.sourceMapPath = config.sourceMapPath;
  } else toReturn.sourceMapPath = toReturn.bundlePath + '.map';

  toReturn.hmrReports = typeof config.hmrReports === 'undefined' ? true : !!config.hmrReports;

  return toReturn;
}

function fillServerConfig(config) {
  var toReturn = {};

  (0, _assert2.default)(typeof config.port === 'number' && Number.isFinite(config.port), 'config.port must be a valid number');
  (0, _assert2.default)(typeof config.rootDirectory === 'string' && config.rootDirectory, 'config.rootDirectory must be a string');
  toReturn.port = config.port;
  toReturn.rootDirectory = config.rootDirectory;
  toReturn.redirectNotFoundToIndex = !!config.redirectNotFoundToIndex;

  return toReturn;
}