/// <reference types="webdriver" />
/// <reference types="webdriverio/webdriverio-core" />
/// <reference types="node" />
/// <reference types="@wdio/cucumber-framework" />
import SeleniumStandalone from 'selenium-standalone';
declare type SeleniumStartArgs = Partial<import('selenium-standalone').StartOpts>;
declare type SeleniumInstallArgs = Partial<import('selenium-standalone').InstallOpts>;
export default class SeleniumStandaloneLauncher {
    capabilities: WebDriver.DesiredCapabilities[] | WebdriverIO.MultiRemoteCapabilities;
    logPath?: string;
    args: SeleniumStartArgs;
    installArgs: SeleniumInstallArgs;
    skipSeleniumInstall: boolean;
    watchMode: boolean;
    process: SeleniumStandalone.ChildProcess;
    drivers?: {
        chrome?: string;
        firefox?: string;
        chromiumedge?: string;
        ie?: string;
        edge?: string;
    };
    constructor(options: WebdriverIO.ServiceOption, capabilities: WebDriver.DesiredCapabilities[] | WebdriverIO.MultiRemoteCapabilities, config: WebdriverIO.Config);
    onPrepare(config: WebdriverIO.Config): Promise<void>;
    onComplete(): void;
    _redirectLogStream(): void;
    _stopProcess: () => void;
    private isSimplifiedMode;
}
export {};
//# sourceMappingURL=launcher.d.ts.map