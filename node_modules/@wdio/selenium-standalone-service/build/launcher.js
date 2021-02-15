"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("@wdio/logger"));
const config_1 = require("@wdio/config");
const util_1 = require("util");
const fs_extra_1 = __importDefault(require("fs-extra"));
const selenium_standalone_1 = __importDefault(require("selenium-standalone"));
const utils_1 = require("./utils");
const DEFAULT_LOG_FILENAME = 'wdio-selenium-standalone.log';
const log = logger_1.default('@wdio/selenium-standalone-service');
const DEFAULT_CONNECTION = {
    protocol: 'http',
    hostname: 'localhost',
    port: 4444,
    path: '/wd/hub'
};
class SeleniumStandaloneLauncher {
    constructor(options, capabilities, config) {
        this.watchMode = false;
        this._stopProcess = () => {
            if (this.process) {
                log.info('shutting down all browsers');
                this.process.kill();
            }
        };
        this.capabilities = capabilities;
        this.logPath = options.logPath || config.outputDir;
        this.skipSeleniumInstall = Boolean(options.skipSeleniumInstall);
        if (this.isSimplifiedMode(options)) {
            this.args = Object.entries(options.drivers).reduce((acc, [browserDriver, version]) => {
                if (typeof version === 'string') {
                    acc.drivers[browserDriver] = { version };
                }
                else if (version === true) {
                    acc.drivers[browserDriver] = {};
                }
                return acc;
            }, { drivers: {} });
            this.installArgs = { ...this.args };
        }
        else {
            this.args = options.args || {};
            this.installArgs = options.installArgs || {};
        }
    }
    async onPrepare(config) {
        this.watchMode = Boolean(config.watch);
        if (!this.skipSeleniumInstall) {
            const install = util_1.promisify(selenium_standalone_1.default.install);
            await install(this.installArgs);
        }
        const capabilities = Array.isArray(this.capabilities) ? this.capabilities : Object.values(this.capabilities);
        capabilities.forEach((cap) => !config_1.isCloudCapability(cap) && Object.assign(cap, DEFAULT_CONNECTION, { ...cap }));
        const start = util_1.promisify(selenium_standalone_1.default.start);
        this.process = await start(this.args);
        if (typeof this.logPath === 'string') {
            this._redirectLogStream();
        }
        if (this.watchMode) {
            process.on('SIGINT', this._stopProcess);
            process.on('exit', this._stopProcess);
            process.on('uncaughtException', this._stopProcess);
        }
    }
    onComplete() {
        if (!this.watchMode) {
            this._stopProcess();
        }
    }
    _redirectLogStream() {
        var _a, _b;
        const logFile = utils_1.getFilePath(this.logPath, DEFAULT_LOG_FILENAME);
        fs_extra_1.default.ensureFileSync(logFile);
        const logStream = fs_extra_1.default.createWriteStream(logFile, { flags: 'w' });
        (_a = this.process.stdout) === null || _a === void 0 ? void 0 : _a.pipe(logStream);
        (_b = this.process.stderr) === null || _b === void 0 ? void 0 : _b.pipe(logStream);
    }
    isSimplifiedMode(options) {
        return options.drivers && Object.keys(options.drivers).length > 0;
    }
}
exports.default = SeleniumStandaloneLauncher;
