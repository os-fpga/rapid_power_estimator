import React from "react";
import { Table, fixed } from "../../utils/common";

import "./../style/FpgaTable.css"

function FpgaTable({ clocking, fle, dsp, bram, io, tableOpen }) {
    return <div className="fpga-main">
        <div className="fpga-main-head">
            <div><label>FPGA</label></div>
            <div><label>info</label></div>
            <div><label>info</label></div>
            <div><label>info</label></div>
        </div>
        <div className="fpga-rowx">
            <div className="clickable" onClick={() => tableOpen(Table.Clocking)}>Clocking<br />{fixed(clocking)} W</div>
            <div className="clickable" onClick={() => tableOpen(Table.FLE)}>FLE<br />{fixed(fle)} W</div>
        </div>
        <div className="fpga-rowx">
            <div className="clickable" onClick={() => tableOpen(Table.BRAM)}>BRAM<br/>{fixed(bram)} W</div>
            <div className="clickable" onClick={() => tableOpen(Table.DSP)}>DSP<br />{fixed(dsp)} W</div>
        </div>
        <div className="fpga-rowx">
            <div className="clickable" id="io" onClick={() => tableOpen(Table.IO)}>IO<br/>{fixed(io)} W</div>
        </div>
    </div>;
}

export default FpgaTable;
