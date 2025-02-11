import {
    Firebot
} from "@crowbartools/firebot-custom-scripts-types";
// import { AllUnitConverterEffects } from "./effects";

import {
    logger,
    initModules
} from "@shared/firebot-modules";

import * as packageInfo from "../package.json";

const script: Firebot.CustomScript = {
    getScriptManifest: () => {
        return {
            name: "Unit Converter",
            description: packageInfo.description,
            author: packageInfo.author,
            version: packageInfo.version,
            firebotVersion: "5",
            startupOnly: true
        };
    },
    getDefaultParameters: () => ({}),
    run: ({ modules }) => {
        // Setup globals
        initModules(modules);
        logger.info("Loading Unit Converter...");

        // Register Effects
        /*for (const effect of AllUnitConverterEffects) {
        effect.definition.id = `${namespace}:${effect.definition.id}`;

        effectManager.registerEffect(
            effect as Effects.EffectType<{ [key: string]: any }>
        );
        }*/
        logger.info("Unit Converter loaded");
    },
    stop: () => {
        logger.info("Unloading Unit Converter...");

        logger.info("Unit Converter unloaded");
    }
};

export default script;
