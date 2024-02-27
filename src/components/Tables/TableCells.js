import React from "react";
import { fixed, GetText } from "../../utils/common";

function showFreq(value) {
    if (value < 999)
        return fixed(value, 0) + ' Hz';
    if (value < 999999)
        return fixed(value / 1000, 0) + ' kHz';
    return fixed(value / 1000000, 0) + ' MHz';
}

export function PercentsCell(props) {
    return <td rowSpan={props.rowSpan}>{fixed(props.val * 100, props.precition ? props.precition : 0)} %</td>;
}

export function FrequencyCell(props) {
    return <td rowSpan={props.rowSpan}>{showFreq(props.val)}</td>;
}

export function PowerCell(props) {
    return <td rowSpan={props.rowSpan}>{fixed(props.val, 3)} W</td>;
}

export function SelectionCell(props) {
    return <td>{GetText(props.val, props.values)}</td>;
}