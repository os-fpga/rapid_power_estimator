import React from "react";
import { Table, fixed } from "../assets/common";

import "./style/FpgaTable.css"

function FpgaTable({clocking, fle, tableOpen}) {
    return <div className="fpgaMain">
        <div><label>FPGA</label></div>
        <div><label>info</label></div>
        <table className="fpgaTable">
            <tbody>
                <tr>
                    <td className="td-fpga-table"><div className="fpga-table-btn" onClick={() => tableOpen(Table.Clocking)}>Clocking<br/>{fixed(clocking)} W</div></td>
                    <td className="td-fpga-table"><div className="fpga-table-btn" onClick={() => tableOpen(Table.FLE)}>FLE<br/>{fixed(fle)} W</div></td>
                </tr>
                <tr>
                    <td className="td-fpga-table"><div className="fpga-table-btn" onClick={() => tableOpen(Table.BRAM)}>BRAM</div></td>
                    <td className="td-fpga-table"><div className="fpga-table-btn" onClick={() => tableOpen(Table.DSP)}>DSP</div></td>
                </tr>
                <tr>
                    <td className="td-fpga-table" colSpan={2}><div className="fpga-table-btn" onClick={() => tableOpen(Table.IO)}>IO</div></td>
                </tr>
            </tbody>
        </table>
    </div>;
}

export default FpgaTable;