import { formatString } from "./common"
const config = require("./../../rpe.config.json")
const server = config.server;
const port = config.port;

export const devices = formatString("{0}:{1}/devices", server, port)

export function deviceInfo(deviceId) {
    return formatString("{0}/{1}", devices, deviceId);
}

export let clocking = {
    fetch: function (deviceId) {
        return formatString("{0}/{1}/clocking", devices, deviceId);
    },

    consumption: function (deviceId) {
        return formatString("{0}/{1}/clocking/consumption", devices, deviceId);
    },

    index: function (deviceId, index) {
        return formatString("{0}/{1}/clocking/{2}", devices, deviceId, index);
    },
}

export let fle = {
    fetch: function (deviceId) {
        return formatString("{0}/{1}/fabric_le", devices, deviceId);
    },

    consumption: function (deviceId) {
        return formatString("{0}/{1}/fabric_le/consumption", devices, deviceId);
    },

    index: function (deviceId, index) {
        return formatString("{0}/{1}/fabric_le/{2}", devices, deviceId, index);
    },
}

export let dsp = {
    fetch: function (deviceId) {
        return formatString("{0}/{1}/dsp", devices, deviceId);
    },

    consumption: function (deviceId) {
        return formatString("{0}/{1}/dsp/consumption", devices, deviceId);
    },

    index: function (deviceId, index) {
        return formatString("{0}/{1}/dsp/{2}", devices, deviceId, index);
    },
}
