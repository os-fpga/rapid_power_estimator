import React from "react";
import { Table } from "../utils/common";

import "./style/Peripherals.css"

function Peripherals({ setOpenedTable }) {
    return <div className="periph-top" onClick={() => setOpenedTable(Table.Peripherals)}>
        <div className="periph-row-head">Peripherals</div>
        <div className="periph-row">
            <div className="periph-rowx">UART0</div>
            <div className="periph-rowx">UART1</div>
            <div className="periph-rowx">USB 2.0</div>
        </div>
        <div className="periph-row">
            <div className="periph-rowx">I2C</div>
            <div className="periph-rowx">GPIO</div>
            <div className="periph-rowx">PWM</div>
        </div>
        <div className="periph-row">
            <div className="periph-rowx">SPI/QSPI</div>
            <div className="periph-rowx">JTAG</div>
            <div className="periph-rowx">GigI</div>
        </div>
    </div>
}

export default Peripherals;