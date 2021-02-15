/// <reference types="webdriverio/webdriverio-core" />
/// <reference types="@wdio/cucumber-framework" />
/// <reference types="webdriver" />
import type { ConfigOptions, Capabilities } from '@wdio/config';
import { ReplCommandArguments, Questionnair, SupportedPackage, OnCompleteResult, ParsedAnswers } from './types';
export declare function runServiceHook(launcher: WebdriverIO.ServiceInstance[], hookName: keyof WebdriverIO.HookFunctions, ...args: any[]): Promise<undefined>;
export declare function runLauncherHook(hook: Function | Function[], ...args: any[]): Promise<void | any[]>;
export declare function runOnCompleteHook(onCompleteHook: Function | Function[], config: ConfigOptions, capabilities: Capabilities, exitCode: number, results: OnCompleteResult): Promise<(0 | 1)[]>;
export declare function getRunnerName(caps?: WebDriver.DesiredCapabilities): string;
export declare function findInConfig(config: string, type: string): RegExpMatchArray | null;
export declare function replaceConfig(config: string, type: string, name: string): string | undefined;
export declare function addServiceDeps(names: SupportedPackage[], packages: string[], update?: boolean): void;
export declare function convertPackageHashToObject(pkg: string, hash?: string): SupportedPackage;
export declare function renderConfigurationFile(answers: ParsedAnswers): Promise<void>;
export declare const validateServiceAnswers: (answers: string[]) => Boolean | string;
export declare function getCapabilities(arg: ReplCommandArguments): {
    capabilities: {
        deviceName: string;
        platformVersion: string;
        udid: string;
        platformName: string;
        automationName: string;
        app: string;
        browserName?: undefined;
    };
} | {
    capabilities: {
        deviceName: string;
        platformVersion: string;
        udid: string;
        platformName: string;
        automationName: string;
        browserName: string;
    };
} | {
    capabilities: {
        browserName: string;
    };
};
export declare function hasFile(filename: string): boolean;
export declare function generateTestFiles(answers: ParsedAnswers): Promise<void>;
export declare function getAnswers(yes: boolean): Promise<Questionnair>;
export declare function getPathForFileGeneration(answers: Questionnair): {
    destSpecRootPath: string;
    destStepRootPath: string;
    destPageObjectRootPath: string;
    relativePath: string;
};
//# sourceMappingURL=utils.d.ts.map