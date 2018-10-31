import {userscriptLegacy} from "./storage/userscriptLegacy";
import {requestUserscriptLegacy} from "./request/requestUserscriptLegacy";
import {settingsObj} from "./settings";

export var storage = userscriptLegacy;

export var request = requestUserscriptLegacy;

export var settings = settingsObj;

export var type = 'userscript';
