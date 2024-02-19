import React from "react";
import { BsFillTrashFill } from "react-icons/bs"
import { FaPlus } from "react-icons/fa6";
import { PiNotePencil } from "react-icons/pi";
import { DspModal } from "./DspModal";
import PowerTable from "./PowerTable";
import { dsp } from "./../assets/serverAPI"
import { fixed, GetText, showFreq } from "../assets/common";
import { dsp_mode, pipelining } from "../assets/dsp";

import "./style/ComponentTable.css"

const FleTable = ({ device, totalPowerCallback }) => {
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
            fetch(dsp.fetch(deviceId))
                .then((response) => response.json())
                .then((data) => {
                    setDspData(data);

                    fetch(dsp.consumption(deviceId))
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
        let data = {};
        data["name"] = row.name;
        data["number_of_multipliers"] = parseInt(row.number_of_multipliers, 10);
        data["dsp_mode"] = parseInt(row.dsp_mode, 10);
        data["a_input_width"] = parseInt(row.a_input_width, 10);
        data["b_input_width"] = parseInt(row.b_input_width, 10);
        data["clock"] = row.clock;
        data["toggle_rate"] = row.toggle_rate;
        data["pipelining"] = parseInt(row.pipelining, 10);
        fetch(dsp.index(device, index), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).then((response) => {
            if (response.ok) {
                fetchDspData(device);
            } else {
                //
            }
        });
    }

    const deleteRow = (index) => {
        fetch(dsp.index(device, index), {
            method: "DELETE",
        }).then((response) => {
            if (response.ok) {
                fetchDspData(device);
            }
        });
    }

    function addRow(newData) {
        if (device === null) return;
        let data = {
            enable: true,
            name: newData.name,
            number_of_multipliers: parseInt(newData.number_of_multipliers, 10),
            dsp_mode: parseInt(newData.dsp_mode, 10),
            a_input_width: parseInt(newData.a_input_width, 10),
            b_input_width: parseInt(newData.b_input_width, 10),
            clock: newData.clock,
            pipelining: parseInt(newData.pipelining, 10),
            toggle_rate: newData.toggle_rate,
        };
        fetch(dsp.fetch(device), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
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

    return <div className="component-table-head">
        <div className="main-block">
            <div className="layout-head">
                <label>FPGA &gt; DSP</label>
                <button className="plus-button" onClick={() => setModalOpen(true)}><FaPlus /></button>
            </div>
            <div className="table-wrapper">
                <table className="table-style">
                    <thead>
                        <tr>
                            <th className="expand">Name/Hierarchy</th>
                            <th>XX</th>
                            <th>DSP Mode</th>
                            <th className="no-wrap">A-W</th>
                            <th className="no-wrap">B-W</th>
                            <th>Clock</th>
                            <th>Pipeline</th>
                            <th>T-Rate</th>
                            <th>Block Used</th>
                            <th>Clock Freq</th>
                            <th>O/P Sig Rate</th>
                            <th>Block Power</th>
                            <th>Intc. Power</th>
                            <th>%</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            dspData.map((row, index) => {
                                return <tr key={index}>
                                    <td>{row.name}</td>
                                    <td>{row.number_of_multipliers}</td>
                                    <td>{GetText(row.dsp_mode, dsp_mode)}</td>
                                    <td>{row.a_input_width}</td>
                                    <td>{row.b_input_width}</td>
                                    <td>{row.clock}</td>
                                    <td>{GetText(row.pipelining, pipelining)}</td>
                                    <td>{row.toggle_rate}%</td>
                                    <td>{row.consumption.dsp_blocks_used}</td>
                                    <td>{showFreq(row.consumption.clock_frequency)}</td>
                                    <td>{fixed(row.consumption.output_signal_rate, 1)} MTr/S</td>
                                    <td>{fixed(row.consumption.block_power)}W</td>
                                    <td>{fixed(row.consumption.interconnect_power)}W</td>
                                    <td>{fixed(row.consumption.percentage, 0)}%</td>
                                    <td>
                                        <span className="actions">
                                            <PiNotePencil className="edit" onClick={() => { setEditIndex(index); setModalOpen(true) }} />
                                            <BsFillTrashFill className="delete" onClick={() => deleteRow(index)} />
                                        </span>
                                    </td>
                                </tr>
                            })
                        }
                    </tbody>
                </table>
                {modalOpen && (
                    <DspModal
                        closeModal={() => {
                            setModalOpen(false);
                            setEditIndex(null);
                        }}
                        onSubmit={handleSubmit}
                        defaultValue={editIndex !== null && {
                            name: dspData[editIndex].name,
                            number_of_multipliers: dspData[editIndex].number_of_multipliers,
                            dsp_mode: dspData[editIndex].dsp_mode,
                            a_input_width: dspData[editIndex].a_input_width,
                            b_input_width: dspData[editIndex].b_input_width,
                            clock: dspData[editIndex].clock,
                            pipelining: dspData[editIndex].pipelining,
                            toggle_rate: dspData[editIndex].toggle_rate,
                        } || {
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
        </div>
        <div className="power-table-wrapper">
            <PowerTable title="DSP power"
                total={powerTotal}
                resourcesHeaders={resourcesHeaders}
                resources={powerTable} /></div>
    </div>
}

export default FleTable;