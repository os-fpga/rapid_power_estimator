import React from "react";
import PowerTable from "./PowerTable";
import { FaPlus } from "react-icons/fa6";
import * as server from "../../utils/serverAPI"
import { acpu_name, load_activity } from "./../../utils/acpu"
import { TableBase } from "./TableBase";
import ACPUModal from "../ModalWindows/ACPUModal";
import { PowerCell, SelectionCell, PercentsCell, Actions } from "./TableCells"
import { GetText } from "../../utils/common";

import "./../style/ACPUTable.css"

function ACPUTable({ device, onDataChanged }) {
    const [editIndex, setEditIndex] = React.useState(null);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [powerData, setPowerData] = React.useState([])
    const [acpuData, setAcpuData] = React.useState({})
    const [acpuUserData, setAcpuUserData] = React.useState({
        name: '',
        frequency: 0,
        load: 0
    })
    const [endpoint, setEndpoint] = React.useState({
        "name": "",
        "activity": 0,
        "read_write_rate": 0.5,
        "toggle_rate": 0.125,
        "consumption": {
            "calculated_bandwidth": 0,
            "noc_power": 0,
            "message": ""
        }
    })
    const [endpoints, setEndpoints] = React.useState([])
    const [href, setHref] = React.useState('')

    function fetchData(device) {
        setPowerData([
            ['ACPU', 0, 0],
        ])

        server.GET(server.api.fetch(server.Elem.peripherals, device), (data) => {
            let href = data['acpu'][0].href;
            setHref(href)
        })
    }

    React.useEffect(() => {
        if (device !== null) {
            fetchData(device)
        }
    }, [device])

    function fetchPort(port) {
        // TODO
        // server.GET(server.peripheralPath(device, href + '/' + port.href), (data) => {
        //     console.log(endpoints)
        //     if (data.name !== '') {
        //         setEndpoints([...endpoints, data])
        //     }
        // })
    }

    function fetchAcpuData() {
        if (href !== '') {
            server.GET(server.peripheralPath(device, href), (data) => {
                setAcpuData(data)
                // resolve cycling
                if (data.name !== acpuUserData.name ||
                    data.frequency !== acpuUserData.frequency ||
                    data.load !== acpuUserData.load) {
                    setAcpuUserData({
                        name: data.name,
                        frequency: data.frequency,
                        load: data.load
                    })
                }
                setEndpoints([])
                for (let port of data.ports) {
                    fetchPort(port)
                }
            })
        }
    }

    React.useEffect(() => {
        if (device !== null) {
            fetchAcpuData()
        }
    }, [href])

    React.useEffect(() => {
        if (device !== null && href !== '') {
            server.PATCH(server.peripheralPath(device, href), acpuUserData, fetchAcpuData)
        }
    }, [acpuUserData])

    const handleChange = (name, val) => {
        setAcpuUserData({ ...acpuUserData, [name]: val })
        onDataChanged()
    };

    function fetchTable() {
        //
    }

    const header = ['Endpoint', 'Activity', 'R/W', 'Toggle Rate', 'Bandwidth', 'Noc Power', 'Action']

    function modifyRow(index, row) {
    }

    const deleteRow = (index) => {
    }

    function addRow(newData) {
        if (device !== null) {
            var data = newData;
            data.name = GetText(newData.name, acpu_name)
            // TODO
            // server.PATCH(server.peripheralPath(device, href + '/ep/0'), data, fetchAcpuData)
        }
    }

    const handleSubmit = (newRow) => {
        if (editIndex !== null)
            modifyRow(editIndex, newRow);
        else
            addRow(newRow);
    };

    const powerHeader = ['Power', '%']
    return <div className="acpu-container">
        <div>
            <div className="acpu-group">
                <label>ACPU name</label>
                <input type={'text'} onChange={(e) => handleChange('name', e.target.value)} value={acpuUserData.name}></input>
            </div>
            <div className="acpu-group">
                <label>Frequency</label>
                <input type={'number'} step={1} onChange={(e) => handleChange('frequency', e.target.value)} value={acpuUserData.frequency}></input>
            </div>
            <div className="acpu-group">
                <label>Load</label>
                <select type={'text'} value={acpuUserData.load} onChange={(e) => handleChange('load', parseInt(e.target.value))}>
                    {
                        load_activity.map((it) => (
                            <option key={it.id} value={it.id}>{it.text}</option>
                        ))
                    }
                </select>
            </div>
        </div>
        <div className="main-block">
            <div className="layout-head">
                <label>FPGA &gt; ACPU</label>
                <button className="plus-button" onClick={() => setModalOpen(true)}><FaPlus /></button>
            </div>
            <TableBase
                header={header}
                data={
                    endpoints.map((row, index) => {
                        return <tr key={index}>
                            <td>{row.name}</td>
                            <SelectionCell val={row.activity} values={load_activity} />
                            <PercentsCell val={row.read_write_rate} />
                            <PercentsCell val={row.toggle_rate} precition={1} />
                            <PowerCell val={row.consumption.calculated_bandwidth} />
                            <PowerCell val={row.consumption.noc_power} />
                            <Actions
                                onEditClick={() => { setEditIndex(index); setModalOpen(true) }}
                                onDeleteClick={() => deleteRow(index)}
                            />
                        </tr>
                    })
                }
            />
            {modalOpen &&
                <ACPUModal
                    closeModal={() => {
                        setModalOpen(false);
                        setEditIndex(null);
                    }}
                    onSubmit={handleSubmit}
                    defaultValue={editIndex !== null && endpoint || {
                        "name": 0,
                        "activity": 0,
                        "read_write_rate": 0.5,
                        "toggle_rate": 0.125,
                    }}
                />}
        </div>
        <PowerTable title={'ACPU power'}
            total={0}
            resourcesHeaders={powerHeader}
            resources={powerData} />
    </div>
}

export default ACPUTable;