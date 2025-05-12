import {
    Firebot
} from "@crowbartools/firebot-custom-scripts-types";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import * as AllUnitConverterVariables from "./variables";
//import { AllUnitConverterVariables } from "./variables";

import {
    logger,
    initModules,
    variableManager
} from "@shared/firebot-modules";

import * as packageInfo from "../package.json";
import { PREFIXES, UNITS } from "./shared/data";
import { UnitParser } from "./unit-parser";

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

        // Register units
        logger.info("Loading units");
        UNITS.forEach((unit) => {
            UnitParser.registerUnit(unit);
        });

        // Register prefixes
        logger.info("Loading prefixes");
        PREFIXES.forEach((prefix) => {
            UnitParser.registerPrefix(prefix);
        });

        // Register ReplaceVariables
        logger.info("Loading variables");
        for (const variable of Object.values(AllUnitConverterVariables)) {
            variableManager.registerReplaceVariable(variable);
        }

        logger.info("Unit Converter loaded");
    },
    stop: () => {
        logger.info("Unloading Unit Converter...");

        logger.info("Unloading units");
        UnitParser.unregisterUnits();
        logger.info("Unloading prefixes");
        UnitParser.unregisterPrefixes();

        logger.info("Unit Converter unloaded");
    }
};

export default script;
