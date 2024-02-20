import React from "react";
import { fixed } from "../assets/common";

import "./style/PowerTable.css"

function PowerTable({ title, total, resourcesHeaders, resources }) {
    return <div className="power-table-main">
        <div className="header">{title}</div>
        <div>
            <table className="total-table header">
                <tbody>
                    <tr>
                        <td>Total</td>
                        <td>{fixed(parseFloat(total))} W</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div className="header">Resources</div>
        <div>
            <table className="resources-table">
                <thead>
                    <tr className="innerHeader">
                        <th></th>
                        {
                            resourcesHeaders.map((item, idx) => {
                                return <th key={idx}>{item}</th>
                            })
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        resources.map((item, index) => {
                            return <tr key={index}>
                                <td className="innerHeader">{item[0]}</td>
                                <td>{item[1]}</td>
                                <td>{item[2]}</td>
                                <td className="no-space">{item[3]}{item.length === 4 ? '%' : ''}</td>
                                <td className="no-space">{item[4]}{item.length === 5 ? '%' : ''}</td>
                            </tr>
                        })
                    }
                </tbody>
            </table>
        </div>
    </div>
}

export default PowerTable;