import {webextension} from "./storage/webextension";
import {requestApi} from "./request/requestWebextension";
import {settingsClass} from "./settings";

export var storage = webextension;

export var request = requestApi;

export var settings = settingsClass;
