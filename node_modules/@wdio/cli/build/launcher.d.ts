/// <reference types="webdriverio/webdriverio-core" />
/// <reference types="webdriver" />
import { ConfigParser, ConfigOptions, Capabilities } from '@wdio/config';
import CLInterface from './interface';
import { RunCommandArguments } from './types';
interface EndMessage {
    cid: string;
    exitCode: number;
    specs: string[];
    retries: number;
}
declare class Launcher {
    private _configFilePath;
    private _args;
    private _isWatchMode;
    configParser: ConfigParser;
    isMultiremote: boolean;
    runner: WebdriverIO.RunnerInstance;
    interface: CLInterface;
    private _exitCode;
    private _hasTriggeredExitRoutine;
    private _schedule;
    private _rid;
    private _runnerStarted;
    private _runnerFailed;
    private _launcher?;
    private _resolve?;
    constructor(_configFilePath: string, _args?: Partial<RunCommandArguments>, _isWatchMode?: boolean);
    run(): Promise<number>;
    runMode(config: Required<ConfigOptions>, caps: Capabilities): Promise<number>;
    runSpecs(): boolean;
    getNumberOfRunningInstances(): number;
    getNumberOfSpecsLeft(): number;
    startInstance(specs: string[], caps: WebDriver.DesiredCapabilities | WebDriver.W3CCapabilities | WebdriverIO.MultiRemoteCapabilities, cid: number, rid: string | undefined, retries: number): Promise<void>;
    getRunnerId(cid: number): string;
    endHandler({ cid: rid, exitCode, specs, retries }: EndMessage): void;
    exitHandler(callback?: (value: void) => void): void | Promise<void>;
    private _isWatchModeHalted;
}
export default Launcher;
//# sourceMappingURL=launcher.d.ts.map