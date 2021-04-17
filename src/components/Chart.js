import React from "react";

import {
    Card,
    CardHeader,
    CardBody,
    Row,
    Modal,
    ModalHeader
} from "reactstrap";

import { Chart as GoogleChart } from "react-google-charts";


export default class Chart extends React.Component {

    render () {

        const {
            selectedCity,
            historicalData,
            setState,
            getClassName
        } = this.props;

        const city_data = historicalData[selectedCity]

        var data = [["Time", selectedCity]]

        const aqis = []

        const data1 = city_data.map(obj => {
            const time = new Date(obj.time)
            aqis.push(obj.aqi)
            return [`${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`, obj.aqi]
        })

        data = data.concat(data1)

        const options = {
            chartArea:{top:0,width:"90%"},
            width: "100%",
            height: "100%",
            curveType: 'function',
            legend: { position: 'bottom' }
        }

        const avg = aqis.reduce((a,v,i)=>(a*i+v)/(i+1));
        const liveAqi = city_data[city_data.length - 1].aqi

        return (
            <Modal
                isOpen={typeof selectedCity === "string"}
                toggle={()=>setState({selectedCity: null})}
                className='modal-dialog-centered'
                size="xl"
                backdrop="static"
            >
                <ModalHeader toggle={() => setState({selectedCity: null})}>
                    AQI for {selectedCity}
                </ModalHeader>
                <Card>
                    <CardHeader className="border-0">
                        <Row className="align-items-center">
                            <div className="col-8">
                                <h3 className="mb-0">
                                    <span className="live-badge"></span>
                                    Live
                                    <small className="text-sm ml-2">
                                        <span className={`p-1 ${getClassName(liveAqi)}`}>{liveAqi.toFixed(2)}</span>
                                    </small>
                                </h3>
                            </div>
                            <div className="text-right col-4 search-input-container">
                                Average AQI: <span className={`p-1 ${getClassName(avg)}`}>{avg.toFixed(2)}</span>
                            </div>
                        </Row>
                    </CardHeader>
                    <CardBody>
                        <GoogleChart
                            chartType="LineChart"
                            data={data}
                            height="400px"
                            options={options}
                        />
                    </CardBody>
                </Card>
            </Modal>
        )
    }
}
