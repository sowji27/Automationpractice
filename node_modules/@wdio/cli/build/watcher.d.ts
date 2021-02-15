/// <reference types="node" />
import { ConfigOptions } from '@wdio/config';
import { RunCommandArguments } from './types.js';
import { EventEmitter } from 'events';
export default class Watcher {
    private _launcher;
    private _args;
    private _specs;
    constructor(configFile: string, args: ConfigOptions);
    watch(): Promise<void>;
    getFileListener(passOnFile?: boolean): (spec: string) => void;
    getWorkers(pickByFn?: (value: any, key: string) => any, includeBusyWorker?: boolean): EventEmitter;
    run(params?: Partial<RunCommandArguments>): void;
    cleanUp(): void;
}
//# sourceMappingURL=watcher.d.ts.map