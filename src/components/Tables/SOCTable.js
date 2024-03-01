import React from "react";
import CPUComponent from "../CPUComponent";
import Peripherals from "../Peripherals";
import { Table } from "../../utils/common";
import TitleComponent from "../TitleComponent";
import ACPUComponent from "../ACPUComponent";

import "./../style/SOCTable.css"

function SOCTable({ device, setOpenedTable, bcpuPower, peripheralsPower, stateChanged }) {
    function getDynamic() {
        return 0;
    }
    function getStatic() {
        return 0;
    }

    return <div className="top-l2-col1">
        <div className="top-l2-col1-row1">
            <div className="top-l2-col1-row1-elem clickable" onClick={() => setOpenedTable(Table.ACPU)}>
                <ACPUComponent device={device} stateChanged={stateChanged}/>
            </div>
            <div className="top-l2-col1-row1-elem clickable" onClick={() => setOpenedTable(Table.BCPU)}>
                <CPUComponent title={"BCPU"} power={bcpuPower} />
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
                <CPUComponent title={"DMA"} power={0} />
            </div>
            <div className="top-l2-col1-row2-elem clickable" onClick={() => setOpenedTable(Table.Connectivity)}>
                <CPUComponent title={"Connectivity"} power={0} />
            </div>
        </div>
        <Peripherals setOpenedTable={setOpenedTable} power={peripheralsPower} device={device} />
    </div>
}

export default SOCTable;