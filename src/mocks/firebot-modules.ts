import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { jest } from "@jest/globals";

jest.mock("@shared/firebot-modules", () => ({
    logger: {
        debug: jest.fn<ScriptModules["logger"]["debug"]>((str: string) => console.debug(`DEBUG: ${str}`)),
        info: jest.fn<ScriptModules["logger"]["info"]>((str: string) => console.info(`INFO: ${str}`)),
        warn: jest.fn<ScriptModules["logger"]["warn"]>((str: string) => console.warn(`WARNING: ${str}`)),
        error: jest.fn<ScriptModules["logger"]["error"]>((str: string) => console.error(`ERROR: ${str}`))
    },
    integrationManager: {
        getIntegrationById: jest.fn(() => null)
    },
    initModules: jest.fn((scriptModules: ScriptModules): void => {})
}));