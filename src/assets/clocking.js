export const sources = [
    { id: 0, text: "IO" },
    { id: 1, text: "RC Oscillator" },
    { id: 2, text: "Boot Clock" },
    { id: 3, text: "PLL0 -> Fabric" },
    { id: 4, text: "PLL1 -> Fabric" },
    { id: 5, text: "PLL1 -> SERDES" },
    { id: 6, text: "PLL2 -> SERDES" },
];

export const states = [
    { id: 1, text: "Active" },
    { id: 2, text: "Gated" },
];

export function GetText(id, map) {
    for (let i = 0; i < map.length; i++) {
        if (map[i].id == id) {
            return map[i].text;
        }
    }
}