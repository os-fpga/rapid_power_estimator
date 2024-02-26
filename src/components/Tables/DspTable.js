import React from "react";
import { FaPlus } from "react-icons/fa6";
import DspModal from "../ModalWindows/DspModal";
import PowerTable from "./PowerTable";
import { api, Elem } from "../../utils/serverAPI"
import { fixed, GetText } from "../../utils/common";
import { dsp_mode, pipelining } from "../../utils/dsp";
import { PercentsCell, FrequencyCell, PowerCell } from "./TableCells"
import { TableBase, Actions } from "./TableBase";

import "./../style/ComponentTable.css"

const DspTable = ({ device, totalPowerCallback }) => {
    const [editIndex, setEditIndex] = React.useState(null);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [dspData, setDspData] = React.useState([]);
    const [powerTotal, setPowerTotal] = React.useState(0);
    const [powerTable, setPowerTable] = React.useState([]);

    React.useEffect(() => {
        if (device !== null)
            fetchDspData(device)
    }, [device]);

    const fetchDspData = (deviceId) => {
        if (deviceId !== null) {
            fetch(api.fetch(Elem.dsp, deviceId))
                .then((response) => response.json())
                .then((data) => {
                    setDspData(data);

                    fetch(api.consumption(Elem.dsp, deviceId))
                        .then((response) => response.json())
                        .then((data) => {
                            const total = data.total_dsp_block_power + data.total_dsp_interconnect_power;
                            setPowerTotal(total);
                            totalPowerCallback(total);
                            setPowerTable([
                                [
                                    "DSP Blocks",
                                    data.total_dsp_blocks_used,
                                    data.total_dsp_blocks_available,
                                    fixed(data.total_dsp_blocks_used / data.total_dsp_blocks_available * 100, 0),
                                ],
                            ]);
                        });
                });
        } else {
        }
    }

    function modifyRow(index, row) {
        fetch(api.index(Elem.dsp, device, index), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(row),
        }).then((response) => {
            if (response.ok) {
                fetchDspData(device);
            } else {
                //
            }
        });
    }

    const deleteRow = (index) => {
        fetch(api.index(Elem.dsp, device, index), {
            method: "DELETE",
        }).then((response) => {
            if (response.ok) {
                fetchDspData(device);
            }
        });
    }

    function addRow(newData) {
        if (device === null) return;
        fetch(api.fetch(Elem.dsp, device), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newData),
        }).then((response) => {
            if (response.ok) {
                fetchDspData(device);
            }
        });
    }

    const handleSubmit = (newRow) => {
        if (editIndex !== null)
            modifyRow(editIndex, newRow);
        else
            addRow(newRow);
    };

    const resourcesHeaders = [
        "Used", "Available", "%"
    ];

    const mainTableHeader = [
        "Name/Hierarchy", "XX", "DSP Mode", { className: "no-wrap", text: "A-W" }, { className: "no-wrap", text: "B-W" },
        "Clock", "Pipeline", "T-Rate",
        "Block Used", "Clock Freq", "O/P Sig Rate", "Block Power", "Intc. Power", "%", "Action"
    ]

    return <div className="component-table-head">
        <div className="main-block">
            <div className="layout-head">
                <label>FPGA &gt; DSP</label>
                <button className="plus-button" onClick={() => setModalOpen(true)}><FaPlus /></button>
            </div>
            <TableBase
                header={mainTableHeader}
                data={
                    dspData.map((row, index) => {
                        return <tr key={index}>
                            <td>{row.name}</td>
                            <td>{row.number_of_multipliers}</td>
                            <td>{GetText(row.dsp_mode, dsp_mode)}</td>
                            <td>{row.a_input_width}</td>
                            <td>{row.b_input_width}</td>
                            <td>{row.clock}</td>
                            <td>{GetText(row.pipelining, pipelining)}</td>
                            <PercentsCell val={row.toggle_rate} precition={1} />
                            <td>{row.consumption.dsp_blocks_used}</td>
                            <FrequencyCell val={row.consumption.clock_frequency} />
                            <td>{fixed(row.consumption.output_signal_rate, 1)} MTr/S</td>
                            <PowerCell val={row.consumption.block_power} />
                            <PowerCell val={row.consumption.interconnect_power} />
                            <td>{fixed(row.consumption.percentage, 0)} %</td>
                            <Actions
                                onEditClick={() => { setEditIndex(index); setModalOpen(true) }}
                                onDeleteClick={() => deleteRow(index)}
                            />
                        </tr>
                    })
                }
            />
            {modalOpen && (
                <DspModal
                    closeModal={() => {
                        setModalOpen(false);
                        setEditIndex(null);
                    }}
                    onSubmit={handleSubmit}
                    defaultValue={editIndex !== null && dspData[editIndex] || {
                        name: '',
                        number_of_multipliers: 0,
                        dsp_mode: 0,
                        a_input_width: 0,
                        b_input_width: 0,
                        clock: '',
                        pipelining: 0,
                        toggle_rate: 0,
                    }}
                />
            )}
        </div>
        <div className="power-table-wrapper">
            <PowerTable title="DSP power"
                total={powerTotal}
                resourcesHeaders={resourcesHeaders}
                resources={powerTable} /></div>
    </div>
}

export default DspTable;