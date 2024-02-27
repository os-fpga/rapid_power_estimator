import { formatString } from "./common"
const config = require("./../../rpe.config.json")
const server = config.server;
const port = config.port;

export const devices = formatString("{0}:{1}/devices", server, port)

export function peripheralPath(deviceId, url) {
    return formatString("{0}/{1}/peripherals/{2}", devices, deviceId, url)
}

export function deviceInfo(deviceId) {
    return formatString("{0}/{1}", devices, deviceId);
}

export const Elem = {
    clocking: 'clocking',
    io: 'io',
    bram: 'bram',
    dsp: 'dsp',
    fle: 'fabric_le',
    peripherals: 'peripherals',
};

export let api = {
    fetch: function (func, deviceId) {
        return formatString("{0}/{1}/{2}", devices, deviceId, func);
    },

    consumption: function (func, deviceId) {
        return formatString("{0}/{1}/{2}/consumption", devices, deviceId, func);
    },

    index: function (func, deviceId, index) {
        return formatString("{0}/{1}/{2}/{3}", devices, deviceId, func, index);
    },
}
