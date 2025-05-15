import "@/mocks/firebot-modules";
import { logger } from "./shared/firebot-modules";
import { RunRequest } from "@crowbartools/firebot-custom-scripts-types";
import customScript from "./main";

test("main default export is the custom script", () => {
    expect(customScript).not.toBeUndefined();
    expect(customScript.run).not.toBeUndefined();
    expect(customScript.stop).not.toBeUndefined();
    expect(customScript.getScriptManifest).not.toBeUndefined();
    expect(customScript.getDefaultParameters).not.toBeUndefined();
});

test("run() calls logger.info with the right messages", async () => {
    jest.clearAllMocks();

    const runRequest = {
        parameters: {},
        modules: { logger: logger }
    } as unknown as RunRequest<{}>; // eslint-disable-line @typescript-eslint/no-empty-object-type

    await customScript.run(runRequest);

    expect(logger.info).toHaveBeenCalledWith("Loading Unit Converter...");
    expect(logger.info).toHaveBeenCalledWith("Unit Converter loaded");

    expect(logger.warn).not.toHaveBeenCalled();
});

test('stop() calls logger.info with the right messages', () => {
    customScript.stop?.();

    expect(logger.info).toHaveBeenCalledWith("Loading Unit Converter...");
    expect(logger.info).toHaveBeenCalledWith("Unit Converter loaded");
});

test('getdefaultParameters', () => {
    expect(customScript.getDefaultParameters()).toMatchObject({});
});

test('getScriptManifest', () => {
    const scriptManifest = customScript.getScriptManifest();
    expect(scriptManifest).not.toBeUndefined();
    expect(scriptManifest).toHaveProperty('name', 'Unit Converter');
    expect(scriptManifest).toHaveProperty('description');
    expect(scriptManifest).toHaveProperty('author');
    expect(scriptManifest).toHaveProperty('version');
    expect(scriptManifest).toHaveProperty('firebotVersion', '5');
    expect(scriptManifest).toHaveProperty('startupOnly', true);
});