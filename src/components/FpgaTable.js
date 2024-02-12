import React from "react";

function FpgaTable({clocking}) {
    return <div className="fpgaMain">
        <div><label>FPGA</label></div>
        <div><label>info</label></div>
        <table className="fpgaTable">
            <thead>
                <tr>
                    <td><button>Clocking<br/>{clocking || "(n/a)"} W</button></td>
                    <td><button>FLE</button></td>
                </tr>
                <tr>
                    <td><button>BRAM</button></td>
                    <td><button>DSP</button></td>
                </tr>
                <tr>
                    <td colSpan={2}><button>IO</button></td>
                </tr>
            </thead>
        </table>
    </div>;
}

export default FpgaTable;