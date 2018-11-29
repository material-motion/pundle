'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createServer = exports.attachMiddleware = undefined;

var attachMiddleware = exports.attachMiddleware = function () {
  var _ref = _asyncToGenerator(function* (pundle) {
    var givenConfig = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var expressApp = arguments[2];
    var server = arguments[3];

    if (pundle.compilation.config.entry.indexOf(browserFile) !== -1) {
      throw new Error('Cannot create two middlewares on one Pundle instance');
    }

    var active = true;
    var compiled = { contents: '', sourceMap: {}, filePaths: [] };
    var firstCompile = true;
    var config = Helpers.fillMiddlewareConfig(givenConfig);
    var hmrEnabled = config.hmrPath !== null;
    var sourceMapEnabled = config.sourceMap && config.sourceMapPath !== 'none' && config.sourceMapPath !== 'inline';
    var connections = new Set();
    var filesChanged = new Set();
    var oldHMRPath = pundle.compilation.config.replaceVariables.SB_PUNDLE_HMR_PATH;
    var oldHMRHost = pundle.compilation.config.replaceVariables.SB_PUNDLE_HMR_HOST;

    var writeToConnections = function writeToConnections(contents) {
      connections.forEach(function (connection) {
        return connection.send(JSON.stringify(contents));
      });
    };
    var watcherSubscription = void 0;

    var watcherInfo = {
      get queue() {
        if (!watcherSubscription || firstCompile) {
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve(watcherInfo.queue);
            }, 100);
          });
        }
        return watcherSubscription.queue;
      }
    };

    expressApp.get(config.bundlePath, function (req, res, next) {
      if (active) {
        watcherInfo.queue.then(function () {
          return res.set('content-type', 'application/javascript').end(compiled.contents);
        });
      } else next();
    });
    if (sourceMapEnabled) {
      expressApp.get(config.sourceMapPath, function (req, res, next) {
        if (active) {
          watcherInfo.queue.then(function () {
            return res.json(compiled.sourceMap);
          });
        } else next();
      });
    }

    var wss = void 0;
    if (hmrEnabled) {
      wss = new Server({ server: server, path: config.hmrPath });
      wss.on('connection', function (connection) {
        if (active) {
          connection.on('close', function () {
            return connections.delete(connection);
          });
          connections.add(connection);
        }
      });
    }

    pundle.compilation.config.entry.unshift(browserFile);
    pundle.compilation.config.replaceVariables.SB_PUNDLE_HMR_PATH = JSON.stringify(config.hmrPath);
    pundle.compilation.config.replaceVariables.SB_PUNDLE_HMR_HOST = JSON.stringify(config.hmrHost);
    var configSubscription = new _sbEventKit.Disposable(function () {
      active = false;
      var entryIndex = pundle.compilation.config.entry.indexOf(browserFile);
      if (entryIndex !== -1) {
        pundle.compilation.config.entry.splice(entryIndex, 1);
      }
      pundle.compilation.config.replaceVariables.SB_PUNDLE_HMR_PATH = oldHMRPath;
      pundle.compilation.config.replaceVariables.SB_PUNDLE_HMR_HOST = oldHMRHost;
    });

    var componentSubscription = yield pundle.loadComponents([[_pundleReporterCli2.default, {
      log: function log(text, error) {
        if (config.hmrReports && error.severity && error.severity !== 'info') {
          writeToConnections({ type: 'report', text: text, severity: error.severity || 'error' });
        }
      }
    }], (0, _pundleApi.createWatcher)({
      tick: function tick(_, filePath, error) {
        debugTick(filePath + ' :: ' + (error ? error.message : 'null'));
        if (!error && filePath !== browserFile && !firstCompile) {
          filesChanged.add(filePath);
          return;
        }
      },
      ready: function ready(_, initalStatus) {
        if (initalStatus) {
          this.report(new _pundleApi.MessageIssue('Server initialized successfully', 'info'));
        } else {
          this.report(new _pundleApi.MessageIssue('Server initialized with errors', 'info'));
        }
      },
      compile: function compile(_, totalFiles) {
        var _this = this;

        return _asyncToGenerator(function* () {
          if (hmrEnabled && !firstCompile && connections.size && filesChanged.size) {
            yield* function* () {
              var changedFilePaths = (0, _lodash2.default)(Array.from(filesChanged));
              var relativeChangedFilePaths = changedFilePaths.map(function (i) {
                return (0, _pundleApi.getRelativeFilePath)(i, _this.config.rootDirectory);
              });
              var infoMessage = 'Sending HMR to ' + connections.size + ' clients of [ ' + (relativeChangedFilePaths.length > 4 ? relativeChangedFilePaths.length + ' files' : relativeChangedFilePaths.join(', ')) + ' ]';
              pundle.compilation.report(new _pundleApi.MessageIssue(infoMessage, 'info'));
              writeToConnections({ type: 'report-clear' });
              var generated = yield pundle.generate(totalFiles.filter(function (entry) {
                return ~changedFilePaths.indexOf(entry.filePath);
              }), {
                entry: [],
                wrapper: 'none',
                sourceMap: config.sourceMap,
                sourceMapPath: 'inline',
                sourceNamespace: 'app',
                sourceMapNamespace: 'hmr-' + Date.now()
              });
              var newFiles = (0, _lodash4.default)(generated.filePaths, compiled.filePaths);
              writeToConnections({ type: 'hmr', contents: generated.contents, files: generated.filePaths, newFiles: newFiles });
              filesChanged.clear();
            }();
          }
          firstCompile = false;
          compiled = yield pundle.generate(totalFiles, {
            wrapper: 'hmr',
            sourceMap: config.sourceMap,
            sourceMapPath: config.sourceMapPath,
            sourceNamespace: 'app'
          });
        })();
      }
    })]);

    watcherSubscription = yield pundle.watch();

    return new _sbEventKit.Disposable(function () {
      if (wss) {
        wss.close();
      }
      configSubscription.dispose();
      watcherSubscription.dispose();
      componentSubscription.dispose();
    });
  });

  return function attachMiddleware(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

var createServer = exports.createServer = function () {
  var _ref2 = _asyncToGenerator(function* (pundle, givenConfig) {
    var app = (0, _express2.default)();
    var config = Helpers.fillServerConfig(givenConfig);

    var server = app.listen(config.port);
    var middlewarePromise = attachMiddleware(pundle, givenConfig, app, server);
    app.use('/', _express2.default.static(config.rootDirectory));
    if (config.redirectNotFoundToIndex) {
      app.use(function (req, res, next) {
        if (req.url !== '/index.html' && req.baseUrl !== '/index.html') {
          req.baseUrl = req.url = '/index.html';
          (0, _send2.default)(req, req.baseUrl, { root: config.rootDirectory, index: 'index.html' }).on('error', next).on('directory', next).pipe(res);
        } else next();
      });
    }
    var subscription = yield middlewarePromise;
    var disposable = new _sbEventKit.Disposable(function () {
      server.close();
      subscription.dispose();
    });

    disposable.app = app;
    disposable.server = server;
    return disposable;
  });

  return function createServer(_x6, _x7) {
    return _ref2.apply(this, arguments);
  };
}();

var _send = require('send');

var _send2 = _interopRequireDefault(_send);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _lodash = require('lodash.uniq');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.difference');

var _lodash4 = _interopRequireDefault(_lodash3);

var _pundleReporterCli = require('pundle-reporter-cli');

var _pundleReporterCli2 = _interopRequireDefault(_pundleReporterCli);

var _sbEventKit = require('sb-event-kit');

var _pundleApi = require('pundle-api');

var _helpers = require('./helpers');

var Helpers = _interopRequireWildcard(_helpers);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var debugTick = (0, _debug2.default)('PUNDLE:DEV:TICK');
var Server = void 0;
try {
  Server = require('uws').Server;
} catch (_) {
  Server = require('ws').Server;
}

var browserFile = require.resolve('./browser');