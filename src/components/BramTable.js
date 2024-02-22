import React from "react";
import { BsFillTrashFill } from "react-icons/bs"
import { FaPlus } from "react-icons/fa6";
import { PiNotePencil } from "react-icons/pi";
import PowerTable from "./PowerTable";
import { bram } from "./../assets/serverAPI"
import { fixed, GetText, showFreq } from "../assets/common";
import BramModal from "./BramModal";
import { bram_type } from "../assets/bram";

import "./style/ComponentTable.css"

const BramTable = ({ device, totalPowerCallback }) => {
    const [editIndex, setEditIndex] = React.useState(null);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [bramDisplayData, setBramDisplayData] = React.useState([]);
    const [bramWindowData, setBramWindowData] = React.useState([]);
    const [powerTotal, setPowerTotal] = React.useState(0);
    const [powerTable, setPowerTable] = React.useState([]);

    React.useEffect(() => {
        if (device !== null)
            fetchBramData(device)
    }, [device]);

    const fetchBramData = (deviceId) => {
        if (deviceId !== null) {
            fetch(bram.fetch(deviceId))
                .then((response) => response.json())
                .then((data) => {
                    var newBramData = [];
                    var newBramWindowData = [];
                    data.map((item, index) => {
                        newBramWindowData.push({
                            enable: item.enable,
                            name: item.name,
                            type: item.type,
                            bram_used: item.bram_used,
                            port_a_clock: item.port_a.clock,
                            port_a_width: item.port_a.width,
                            port_b_clock: item.port_b.clock,
                            port_b_width: item.port_b.width,
                            port_a_write_enable_rate: item.port_a.write_enable_rate,
                            port_a_read_enable_rate: item.port_a.read_enable_rate,
                            port_a_toggle_rate: item.port_a.toggle_rate,
                            port_b_write_enable_rate: item.port_b.write_enable_rate,
                            port_b_read_enable_rate: item.port_b.read_enable_rate,
                            port_b_toggle_rate: item.port_b.toggle_rate,
                        });
                        newBramData.push(item);
                        newBramData.push(item);
                    });
                    setBramWindowData(newBramWindowData);
                    setBramDisplayData(newBramData);

                    fetch(bram.consumption(deviceId))
                        .then((response) => response.json())
                        .then((data) => {
                            const total = data.total_bram_block_power + data.total_bram_interconnect_power;
                            setPowerTotal(total);
                            totalPowerCallback(total);
                            setPowerTable([
                                [
                                    "18K BRAM",
                                    data.total_18k_bram_used,
                                    data.total_18k_bram_available,
                                    fixed(data.total_18k_bram_used / data.total_18k_bram_available * 100, 0),
                                ],
                                [
                                    "36K BRAM",
                                    data.total_36k_bram_used,
                                    data.total_36k_bram_available,
                                    fixed(data.total_36k_bram_used / data.total_36k_bram_available * 100, 0),
                                ],
                            ]);
                        });
                });
        } else {
        }
    }

    function sendData(row) {
        let data = {};
        data["enable"] = true;
        data["name"] = row.name;
        data["type"] = parseInt(row.type, 10);
        data["bram_used"] = parseInt(row.bram_used, 10);
        var port_a = {
            width: parseInt(row.port_a_width, 10),
            clock: row.port_a_clock,
            write_enable_rate: row.port_a_write_enable_rate,
            read_enable_rate: row.port_a_read_enable_rate,
            toggle_rate: row.port_a_toggle_rate,
        }
        var port_b = {
            width: parseInt(row.port_b_width, 10),
            clock: row.port_b_clock,
            write_enable_rate: row.port_b_write_enable_rate,
            read_enable_rate: row.port_b_read_enable_rate,
            toggle_rate: row.port_b_toggle_rate,
        }
        data["port_a"] = port_a;
        data["port_b"] = port_b;
        return data;
    }

    function modifyRow(index, row) {
        fetch(bram.index(device, index), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sendData(row)),
        }).then((response) => {
            if (response.ok) {
                fetchBramData(device);
            } else {
                //
            }
        });
    }

    const deleteRow = (index) => {
        fetch(bram.index(device, index), {
            method: "DELETE",
        }).then((response) => {
            if (response.ok) {
                fetchBramData(device);
            } else {
                console.log('Error deleting row');
            }
        });
    }

    function addRow(newData) {
        if (device === null) return;
        fetch(bram.fetch(device), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sendData(newData)),
        }).then((response) => {
            if (response.ok) {
                fetchBramData(device);
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
                <label>FPGA &gt; BRAM</label>
                <button className="plus-button" onClick={() => setModalOpen(true)}><FaPlus /></button>
            </div>
            <div className="table-wrapper">
                <table className="table-style">
                    <thead>
                        <tr>
                            <th className="expand">Name/Hierarchy</th>
                            <th>BRAM Type</th>
                            <th>Used</th>
                            <th>Port</th>
                            <th>Clock</th>
                            <th>Width</th>
                            <th>Write En</th>
                            <th>Read En</th>
                            <th>Toggle Rate</th>
                            <th>Clock Freq</th>
                            <th>RAM Depth</th>
                            <th>O/P Sig Rate</th>
                            <th>Block Power</th>
                            <th>Intc. Power</th>
                            <th>%</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            bramDisplayData.map((row, index) => {
                                return (index % 2 === 0)
                                    ?
                                    <tr key={index}>
                                        <td rowSpan={2}>{row.name}</td>
                                        <td rowSpan={2}>{GetText(row.type, bram_type)}</td>
                                        <td rowSpan={2}>{row.bram_used}</td>
                                        <td>A - Write</td>
                                        <td>{row.port_a.clock}</td>
                                        <td>{row.port_a.width}</td>
                                        <td>{row.port_a.write_enable_rate} %</td>
                                        <td>{row.port_a.read_enable_rate} %</td>
                                        <td>{row.port_a.toggle_rate} %</td>
                                        <td>{showFreq(row.consumption.port_a.clock_frequency)}</td>
                                        <td>{fixed(row.consumption.port_a.output_signal_rate, 1)} MTr/S</td>
                                        <td>{row.consumption.port_a.ram_depth}</td>
                                        <td rowSpan={2}>{fixed(row.consumption.block_power)} W</td>
                                        <td rowSpan={2}>{fixed(row.consumption.interconnect_power)} W</td>
                                        <td rowSpan={2}>{fixed(row.consumption.percentage, 0)} %</td>
                                        <td rowSpan={2}>
                                            <span className="actions">
                                                <PiNotePencil className="edit" onClick={() => { setEditIndex(index / 2); setModalOpen(true) }} />
                                                <BsFillTrashFill className="delete" onClick={() => deleteRow(index / 2)} />
                                            </span>
                                        </td>
                                    </tr>
                                    :
                                    <tr key={index}>
                                        <td>B - Read</td>
                                        <td>{row.port_b.clock}</td>
                                        <td>{row.port_b.width}</td>
                                        <td>{row.port_b.write_enable_rate} %</td>
                                        <td>{row.port_b.read_enable_rate} %</td>
                                        <td>{row.port_b.toggle_rate} %</td>
                                        <td>{showFreq(row.consumption.port_b.clock_frequency)}</td>
                                        <td>{fixed(row.consumption.port_b.output_signal_rate, 1)} MTr/S</td>
                                        <td>{row.consumption.port_b.ram_depth}</td>
                                    </tr>
                            })
                        }
                    </tbody>
                </table>
                {modalOpen && (
                    <BramModal
                        closeModal={() => {
                            setModalOpen(false);
                            setEditIndex(null);
                        }}
                        onSubmit={handleSubmit}
                        defaultValue={editIndex !== null && bramWindowData[editIndex] || {
                            name: '',
                            type: 0,
                            bram_used: 0,
                            port_a_clock: '',
                            port_a_width: 0,
                            port_b_clock: '',
                            port_b_width: 0,
                            port_a_write_enable_rate: 0,
                            port_a_read_enable_rate: 0,
                            port_a_toggle_rate: 0,
                            port_b_write_enable_rate: 0,
                            port_b_read_enable_rate: 0,
                            port_b_toggle_rate: 0,
                        }}
                    />
                )}
            </div>
        </div>
        <div className="power-table-wrapper">
            <PowerTable title="BRAM power"
                total={powerTotal}
                resourcesHeaders={resourcesHeaders}
                resources={powerTable} /></div>
    </div>
}

export default BramTable;
