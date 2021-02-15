/// <reference types="webdriver" />
/// <reference types="webdriverio/webdriverio-core" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import type { ConfigOptions } from '@wdio/config';
interface TestError {
    type: string;
    message: string;
    stack?: string;
}
interface CLIInterfaceEvent {
    origin?: string;
    name: string;
    cid?: string;
    fullTitle?: string;
    content?: any;
    params?: any;
    error?: TestError;
}
interface Job {
    caps: WebDriver.Capabilities | WebDriver.W3CCapabilities | WebdriverIO.MultiRemoteCapabilities;
    specs: string[];
    hasTests: boolean;
}
export default class WDIOCLInterface extends EventEmitter {
    private _config;
    totalWorkerCnt: number;
    private _isWatchMode;
    hasAnsiSupport: boolean;
    result: {
        finished: number;
        passed: number;
        retries: number;
        failed: number;
    };
    private _jobs;
    private _specFileRetries;
    private _specFileRetriesDelay;
    private _skippedSpecs;
    private _inDebugMode;
    private _start;
    private _messages;
    constructor(_config: ConfigOptions, totalWorkerCnt: number, _isWatchMode?: boolean);
    setup(): void;
    onStart(): void;
    onSpecRunning(rid: string): void;
    onSpecRetry(rid: string, job: Job, retries: number): void;
    onSpecPass(rid: string, job: Job, retries: number): void;
    onSpecFailure(rid: string, job: Job, retries: number): void;
    onSpecSkip(rid: string, job: Job): void;
    onJobComplete(cid: string, job?: Job, retries?: number, message?: string, _logger?: Function): any;
    onTestError(payload: CLIInterfaceEvent): any[];
    getFilenames(specs?: string[]): string;
    addJob({ cid, caps, specs, hasTests }: Job & {
        cid: string;
    }): void;
    clearJob({ cid, passed, retries }: {
        cid: string;
        passed: boolean;
        retries: number;
    }): void;
    log(...args: any[]): any[];
    onMessage(event: CLIInterfaceEvent): boolean | void | any[];
    sigintTrigger(): false | any[];
    printReporters(): void;
    printSummary(): any[];
    finalise(): void;
}
export {};
//# sourceMappingURL=interface.d.ts.map