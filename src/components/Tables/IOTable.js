import React from "react";
import { BsFillTrashFill } from "react-icons/bs"
import { FaPlus } from "react-icons/fa6";
import { PiNotePencil } from "react-icons/pi";
import IOModal from "../ModalWindows/IOModal";
import IOPowerTable from "./IOPowerTable";
import { io } from "../../utils/serverAPI"
import { fixed } from "../../utils/common";
import { PercentsCell, SelectionCell, PowerCell } from "./TableCells"

import "./../style/ComponentTable.css"
import {
    direction,
    io_standard,
    drive_strength,
    slew_rate,
    differential_termination,
    io_data_type,
    synchronization,
    io_pull_up_down,
    bank_type
} from "../../utils/io"

const IOTable = ({ device, totalPowerCallback }) => {
    const [editIndex, setEditIndex] = React.useState(null);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [ioData, setIoData] = React.useState([]);
    const [powerTotal, setPowerTotal] = React.useState(0);
    const [powerTable, setPowerTable] = React.useState(null);

    const defaultPowerData = {
        "io_usage": [
            {
                "total_banks_available": 0,
                "total_io_available": 0,
                "type": "HP",
                "usage": [
                    {
                        "banks_used": 0,
                        "io_available": 0,
                        "io_used": 0,
                        "voltage": 1.2
                    },
                    {
                        "banks_used": 0,
                        "io_available": 0,
                        "io_used": 0,
                        "voltage": 1.5
                    },
                    {
                        "banks_used": 0,
                        "io_available": 0,
                        "io_used": 0,
                        "voltage": 1.8
                    }
                ]
            },
            {
                "total_banks_available": 0,
                "total_io_available": 0,
                "type": "HR",
                "usage": [
                    {
                        "banks_used": 0,
                        "io_available": 0,
                        "io_used": 0,
                        "voltage": 1.8
                    },
                    {
                        "banks_used": 0,
                        "io_available": 0,
                        "io_used": 0,
                        "voltage": 2.5
                    },
                    {
                        "banks_used": 0,
                        "io_available": 0,
                        "io_used": 0,
                        "voltage": 3.3
                    }
                ]
            }
        ],
    };

    const defaultIOData = {
        name: '',
        bus_width: 0,
        direction: 0,
        io_standard: 0,
        drive_strength: 2,
        clock: '',
        toggle_rate: 0,
        duty_cycle: 0,
        slew_rate: 0,
        differential_termination: 0,
        io_pull_up_down: 0,
        io_data_type: 0,
        input_enable_rate: 0,
        output_enable_rate: 0,
        synchronization: 0,
    };

    React.useEffect(() => {
        if (device !== null)
            fetchIoData(device)
    }, [device]);

    const fetchIoData = (deviceId) => {
        console.log('fetchIoData')
        if (deviceId !== null) {
            fetch(io.fetch(deviceId))
                .then((response) => response.json())
                .then((data) => {
                    setIoData(data);

                    fetch(io.consumption(deviceId))
                        .then((response) => response.json())
                        .then((data) => {
                            const total = data.total_block_power + data.total_interconnect_power + data.total_on_die_termination_power;
                            setPowerTotal(total);
                            totalPowerCallback(total);
                            console.log(data)
                            setPowerTable(data);
                        });
                });
        } else {
        }
    }

    function modifyRow(index, row) {
        fetch(io.index(device, index), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(row),
        }).then((response) => {
            if (response.ok) {
                fetchIoData(device);
            } else {
                //
            }
        });
    }

    const deleteRow = (index) => {
        fetch(io.index(device, index), {
            method: "DELETE",
        }).then((response) => {
            if (response.ok) {
                fetchIoData(device);
            }
        });
    }

    function addRow(newData) {
        if (device === null) return;
        fetch(io.fetch(device), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newData),
        }).then((response) => {
            if (response.ok) {
                fetchIoData(device);
            }
        });
    }

    const handleSubmit = (newRow) => {
        if (editIndex !== null)
            modifyRow(editIndex, newRow);
        else
            addRow(newRow);
    };

    return <div className="component-table-head">
        <div className="main-block">
            <div className="layout-head">
                <label>FPGA &gt; IO</label>
                <button className="plus-button" onClick={() => setModalOpen(true)}><FaPlus /></button>
            </div>
            <div className="table-wrapper">
                <table className="table-style">
                    <thead>
                        <tr>
                            <th>RTL Port Name</th>
                            <th>Bus</th>
                            <th>Dir</th>
                            <th>IO Standard</th>
                            <th>Drive Strength</th>
                            <th>Slew Rate</th>
                            <th>Differential Termination</th>
                            <th>Data Type</th>
                            <th>Clock</th>
                            <th>Toggle Rate</th>
                            <th>Duty Cycle</th>
                            <th>Sync</th>
                            <th>Input En</th>
                            <th>Output En</th>
                            <th>Pullup / Pulldown</th>
                            <th>Bank Type</th>
                            <th>Bank #</th>
                            <th>VCCIO</th>
                            <th>Signal Rate</th>
                            <th>Block Power</th>
                            <th>Intc. Power</th>
                            <th>%</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            ioData.map((row, index) => {
                                return <tr key={index}>
                                    <td>{row.name}</td>
                                    <td>{row.bus_width}</td>
                                    <SelectionCell val={row.direction} values={direction} />
                                    <SelectionCell val={row.io_standard} values={io_standard} />
                                    <SelectionCell val={row.drive_strength} values={drive_strength} />
                                    <SelectionCell val={row.slew_rate} values={slew_rate} />
                                    <SelectionCell val={row.differential_termination} values={differential_termination} />
                                    <SelectionCell val={row.io_data_type} values={io_data_type} />
                                    <td>{row.clock}</td>
                                    <PercentsCell val={row.toggle_rate} precition={1} />
                                    <PercentsCell val={row.duty_cycle} />
                                    <SelectionCell val={row.synchronization} values={synchronization} />
                                    <PercentsCell val={row.input_enable_rate} />
                                    <PercentsCell val={row.output_enable_rate} />
                                    <SelectionCell val={row.io_pull_up_down} values={io_pull_up_down} />
                                    <SelectionCell val={row.consumption.bank_type} values={bank_type} />
                                    <td>{row.consumption.bank_number}</td>
                                    <td>{row.consumption.vccio_voltage}</td>
                                    <PercentsCell val={row.consumption.io_signal_rate} />
                                    <PowerCell val={row.consumption.block_power} />
                                    <PowerCell val={row.consumption.interconnect_power} />
                                    <td>{fixed(row.consumption.percentage, 0)} %</td>
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
                    <IOModal
                        closeModal={() => {
                            setModalOpen(false);
                            setEditIndex(null);
                        }}
                        onSubmit={handleSubmit}
                        defaultValue={editIndex !== null && ioData[editIndex] || defaultIOData}
                    />
                )}
            </div>
        </div>
        <div className="power-table-wrapper">
            <IOPowerTable title="IO power"
                total={powerTotal}
                resources={powerTable !== null ? powerTable : defaultPowerData} />
        </div>
    </div>
}

export default IOTable;