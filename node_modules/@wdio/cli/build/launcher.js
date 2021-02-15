"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const async_exit_hook_1 = __importDefault(require("async-exit-hook"));
const logger_1 = __importDefault(require("@wdio/logger"));
const config_1 = require("@wdio/config");
const utils_1 = require("@wdio/utils");
const interface_1 = __importDefault(require("./interface"));
const utils_2 = require("./utils");
const log = logger_1.default('@wdio/cli:launcher');
class Launcher {
    constructor(_configFilePath, _args = {}, _isWatchMode = false) {
        this._configFilePath = _configFilePath;
        this._args = _args;
        this._isWatchMode = _isWatchMode;
        this._exitCode = 0;
        this._hasTriggeredExitRoutine = false;
        this._schedule = [];
        this._rid = [];
        this._runnerStarted = 0;
        this._runnerFailed = 0;
        this.configParser = new config_1.ConfigParser();
        this.configParser.addConfigFile(_configFilePath);
        this.configParser.merge(_args);
        const config = this.configParser.getConfig();
        const capabilities = this.configParser.getCapabilities();
        this.isMultiremote = !Array.isArray(capabilities);
        if (config.outputDir) {
            fs_extra_1.default.ensureDirSync(path_1.default.join(config.outputDir));
            process.env.WDIO_LOG_PATH = path_1.default.join(config.outputDir, 'wdio.log');
        }
        logger_1.default.setLogLevelsConfig(config.logLevels, config.logLevel);
        const totalWorkerCnt = Array.isArray(capabilities)
            ? capabilities
                .map((c) => this.configParser.getSpecs(c.specs, c.exclude).length)
                .reduce((a, b) => a + b, 0)
            : 1;
        const Runner = utils_1.initialisePlugin(config.runner, 'runner').default;
        this.runner = new Runner(_configFilePath, config);
        this.interface = new interface_1.default(config, totalWorkerCnt, this._isWatchMode);
        config.runnerEnv.FORCE_COLOR = Number(this.interface.hasAnsiSupport);
    }
    async run() {
        async_exit_hook_1.default(this.exitHandler.bind(this));
        let exitCode = 0;
        let error = undefined;
        try {
            const config = this.configParser.getConfig();
            const caps = this.configParser.getCapabilities();
            const { ignoredWorkerServices, launcherServices } = utils_1.initialiseLauncherService(config, caps);
            this._launcher = launcherServices;
            this._args.ignoredWorkerServices = ignoredWorkerServices;
            await this.runner.initialise();
            log.info('Run onPrepare hook');
            await utils_2.runLauncherHook(config.onPrepare, config, caps);
            await utils_2.runServiceHook(this._launcher, 'onPrepare', config, caps);
            exitCode = await this.runMode(config, caps);
            log.info('Run onComplete hook');
            await utils_2.runServiceHook(this._launcher, 'onComplete', exitCode, config, caps);
            const onCompleteResults = await utils_2.runOnCompleteHook(config.onComplete, config, caps, exitCode, this.interface.result);
            exitCode = onCompleteResults.includes(1) ? 1 : exitCode;
            await logger_1.default.waitForBuffer();
            this.interface.finalise();
        }
        catch (err) {
            error = err;
        }
        finally {
            if (!this._hasTriggeredExitRoutine) {
                this._hasTriggeredExitRoutine = true;
                await this.runner.shutdown();
            }
        }
        if (error) {
            throw error;
        }
        return exitCode;
    }
    runMode(config, caps) {
        if (!caps || (!this.isMultiremote && !caps.length)) {
            return new Promise((resolve) => {
                log.error('Missing capabilities, exiting with failure');
                return resolve(1);
            });
        }
        const specFileRetries = this._isWatchMode ? 0 : config.specFileRetries;
        let cid = 0;
        if (this.isMultiremote) {
            this._schedule.push({
                cid: cid++,
                caps,
                specs: this.configParser.getSpecs(caps.specs, caps.exclude).map(s => ({ files: [s], retries: specFileRetries })),
                availableInstances: config.maxInstances || 1,
                runningInstances: 0
            });
        }
        else {
            for (let capabilities of caps) {
                this._schedule.push({
                    cid: cid++,
                    caps: capabilities,
                    specs: this.configParser.getSpecs(capabilities.specs, capabilities.exclude).map(s => ({ files: [s], retries: specFileRetries })),
                    availableInstances: capabilities.maxInstances || config.maxInstancesPerCapability,
                    runningInstances: 0
                });
            }
        }
        return new Promise((resolve) => {
            this._resolve = resolve;
            if (Object.values(this._schedule).reduce((specCnt, schedule) => specCnt + schedule.specs.length, 0) === 0) {
                log.error('No specs found to run, exiting with failure');
                return resolve(1);
            }
            if (this.runSpecs()) {
                resolve(0);
            }
        });
    }
    runSpecs() {
        let config = this.configParser.getConfig();
        if (this._hasTriggeredExitRoutine) {
            return true;
        }
        while (this.getNumberOfRunningInstances() < config.maxInstances) {
            let schedulableCaps = this._schedule
                .filter(() => {
                const filter = typeof config.bail !== 'number' || config.bail < 1 ||
                    config.bail > this._runnerFailed;
                if (!filter) {
                    this._schedule.forEach((t) => { t.specs = []; });
                }
                return filter;
            })
                .filter(() => this.getNumberOfRunningInstances() < config.maxInstances)
                .filter((a) => a.availableInstances > 0)
                .filter((a) => a.specs.length > 0)
                .sort((a, b) => a.runningInstances - b.runningInstances);
            if (schedulableCaps.length === 0) {
                break;
            }
            let specs = schedulableCaps[0].specs.shift();
            this.startInstance(specs.files, schedulableCaps[0].caps, schedulableCaps[0].cid, specs.rid, specs.retries);
            schedulableCaps[0].availableInstances--;
            schedulableCaps[0].runningInstances++;
        }
        return this.getNumberOfRunningInstances() === 0 && this.getNumberOfSpecsLeft() === 0;
    }
    getNumberOfRunningInstances() {
        return this._schedule.map((a) => a.runningInstances).reduce((a, b) => a + b);
    }
    getNumberOfSpecsLeft() {
        return this._schedule.map((a) => a.specs.length).reduce((a, b) => a + b);
    }
    async startInstance(specs, caps, cid, rid, retries) {
        let config = this.configParser.getConfig();
        if (typeof config.specFileRetriesDelay === 'number' && config.specFileRetries > 0 && config.specFileRetries !== retries) {
            await utils_1.sleep(config.specFileRetriesDelay * 1000);
        }
        const runnerId = rid || this.getRunnerId(cid);
        let processNumber = this._runnerStarted + 1;
        let debugArgs = [];
        let debugType;
        let debugHost = '';
        let debugPort = process.debugPort;
        for (let i in process.execArgv) {
            const debugArgs = process.execArgv[i].match('--(debug|inspect)(?:-brk)?(?:=(.*):)?');
            if (debugArgs) {
                let [, type, host] = debugArgs;
                if (type) {
                    debugType = type;
                }
                if (host) {
                    debugHost = `${host}:`;
                }
            }
        }
        if (debugType) {
            debugArgs.push(`--${debugType}=${debugHost}${(debugPort + processNumber)}`);
        }
        let capExecArgs = [...(config.execArgv || [])];
        let defaultArgs = (capExecArgs.length) ? process.execArgv : [];
        let execArgv = [...defaultArgs, ...debugArgs, ...capExecArgs];
        this._runnerStarted++;
        log.info('Run onWorkerStart hook');
        await utils_2.runLauncherHook(config.onWorkerStart, runnerId, caps, specs, this._args, execArgv);
        await utils_2.runServiceHook(this._launcher, 'onWorkerStart', runnerId, caps, specs, this._args, execArgv);
        const worker = this.runner.run({
            cid: runnerId,
            command: 'run',
            configFile: this._configFilePath,
            args: this._args,
            caps,
            specs,
            execArgv,
            retries
        });
        worker.on('message', this.interface.onMessage.bind(this.interface));
        worker.on('error', this.interface.onMessage.bind(this.interface));
        worker.on('exit', this.endHandler.bind(this));
    }
    getRunnerId(cid) {
        if (!this._rid[cid]) {
            this._rid[cid] = 0;
        }
        return `${cid}-${this._rid[cid]++}`;
    }
    endHandler({ cid: rid, exitCode, specs, retries }) {
        const passed = this._isWatchModeHalted() || exitCode === 0;
        if (!passed && retries > 0) {
            const requeue = this.configParser.getConfig().specFileRetriesDeferred !== false ? 'push' : 'unshift';
            this._schedule[parseInt(rid, 10)].specs[requeue]({ files: specs, retries: retries - 1, rid });
        }
        else {
            this._exitCode = this._isWatchModeHalted() ? 0 : this._exitCode || exitCode;
            this._runnerFailed += !passed ? 1 : 0;
        }
        if (!this._isWatchModeHalted()) {
            this.interface.emit('job:end', { cid: rid, passed, retries });
        }
        const cid = parseInt(rid, 10);
        this._schedule[cid].availableInstances++;
        this._schedule[cid].runningInstances--;
        const shouldRunSpecs = this.runSpecs();
        if (!shouldRunSpecs || (this._isWatchMode && !this._hasTriggeredExitRoutine)) {
            return;
        }
        if (this._resolve) {
            this._resolve(passed ? this._exitCode : 1);
        }
    }
    exitHandler(callback) {
        if (!callback) {
            return;
        }
        if (this._hasTriggeredExitRoutine) {
            return callback();
        }
        this._hasTriggeredExitRoutine = true;
        this.interface.sigintTrigger();
        return this.runner.shutdown().then(callback);
    }
    _isWatchModeHalted() {
        return this._isWatchMode && this._hasTriggeredExitRoutine;
    }
}
exports.default = Launcher;
