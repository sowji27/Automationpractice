"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chokidar_1 = __importDefault(require("chokidar"));
const logger_1 = __importDefault(require("@wdio/logger"));
const lodash_pickby_1 = __importDefault(require("lodash.pickby"));
const lodash_flattendeep_1 = __importDefault(require("lodash.flattendeep"));
const lodash_union_1 = __importDefault(require("lodash.union"));
const launcher_1 = __importDefault(require("./launcher"));
const log = logger_1.default('@wdio/cli:watch');
class Watcher {
    constructor(configFile, args) {
        log.info('Starting launcher in watch mode');
        this._launcher = new launcher_1.default(configFile, args, true);
        this._args = args;
        const specs = this._launcher.configParser.getSpecs();
        const capSpecs = this._launcher.isMultiremote ? [] : lodash_union_1.default(lodash_flattendeep_1.default(this._launcher.configParser.getCapabilities().map(cap => cap.specs || [])));
        this._specs = [...specs, ...capSpecs];
    }
    async watch() {
        chokidar_1.default.watch(this._specs, { ignoreInitial: true })
            .on('add', this.getFileListener())
            .on('change', this.getFileListener());
        const { filesToWatch } = this._launcher.configParser.getConfig();
        if (filesToWatch.length) {
            chokidar_1.default.watch(filesToWatch, { ignoreInitial: true })
                .on('add', this.getFileListener(false))
                .on('change', this.getFileListener(false));
        }
        await this._launcher.run();
        const workers = this.getWorkers();
        Object.values(workers).forEach((worker) => worker.on('exit', () => {
            if (Object.values(workers).find((w) => w.isBusy)) {
                return;
            }
            this._launcher.interface.finalise();
        }));
    }
    getFileListener(passOnFile = true) {
        return (spec) => this.run(Object.assign({}, this._args, passOnFile ? { spec } : {}));
    }
    getWorkers(pickByFn, includeBusyWorker) {
        let workers = this._launcher.runner.workerPool;
        if (typeof pickByFn === 'function') {
            workers = lodash_pickby_1.default(workers, pickByFn);
        }
        if (!includeBusyWorker) {
            workers = lodash_pickby_1.default(workers, (worker) => !worker.isBusy);
        }
        return workers;
    }
    run(params = {}) {
        const workers = this.getWorkers((params.spec ? (worker) => worker.specs.includes(params.spec) : undefined));
        if (Object.keys(workers).length === 0) {
            return;
        }
        this._launcher.interface.totalWorkerCnt = Object.entries(workers).length;
        this.cleanUp();
        for (const [, worker] of Object.entries(workers)) {
            const { cid, caps, specs, sessionId } = worker;
            const args = Object.assign({ sessionId }, params);
            worker.postMessage('run', args);
            this._launcher.interface.emit('job:start', { cid, caps, specs });
        }
    }
    cleanUp() {
        this._launcher.interface.setup();
    }
}
exports.default = Watcher;
