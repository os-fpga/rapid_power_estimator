import React from "react";
import CPUComponent from "../CPUComponent";
import Peripherals from "../Peripherals";
import { Table } from "../../utils/common";
import TitleComponent from "../TitleComponent";
import ACPUComponent from "../ACPUComponent";
import BCPUComponent from "../BCPUComponent";

import "./../style/SOCTable.css"

function SOCTable({ device, setOpenedTable, power, acpuStateChanged, bcpuStateChanged }) {
    function getDynamic() {
        return power.acpu + power.bcpu + power.peripherals + power.dma + power.interconnect + power.memory
    }
    function getStatic() {
        // TODO, calculated at backend
        return 0;
    }

    return <div className="top-l2-col1">
        <div className="top-l2-col1-row1">
            <div className="top-l2-col1-row1-elem clickable" onClick={() => setOpenedTable(Table.ACPU)}>
                <ACPUComponent device={device} power={power} stateChanged={acpuStateChanged} />
            </div>
            <div className="top-l2-col1-row1-elem clickable" onClick={() => setOpenedTable(Table.BCPU)}>
                <BCPUComponent device={device} power={power} stateChanged={bcpuStateChanged} />
            </div>
            <div className="top-l2-col1-row1-elem-text">
                <TitleComponent
                    title={'SOC'}
                    staticText={'Static'}
                    dynamicPower={getDynamic()}
                    staticPower={getStatic()}
                />
            </div>
        </div>
        <div className="top-l2-col1-row2">
            <div className="top-l2-col1-row2-elem clickable" onClick={() => setOpenedTable(Table.DMA)}>
                <CPUComponent title={"DMA"} power={power.dma} />
            </div>
            <div className="top-l2-col1-row2-elem clickable" onClick={() => setOpenedTable(Table.Connectivity)}>
                <CPUComponent title={"Connectivity"} power={power.interconnect} />
            </div>
        </div>
        <Peripherals setOpenedTable={setOpenedTable} power={power.peripherals} device={device} />
    </div>
}

export default SOCTable;