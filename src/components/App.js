import React from "react";

import {
    Container,
    Row,
    Col,
    Card,
    CardHeader,
    Table,
    Modal,
    ModalHeader,
    ModalBody,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText
} from "reactstrap";

import Header from './Header'
import Chart from './Chart'

import '../assets/App.css';


export default class App extends React.Component {

    ws_url = 'wss://city-ws.herokuapp.com/'

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            historicalData: {},
            ws: null,
            toogleHelpModal: false,
            search: '',
            selectedCity: null
        };
    }

    // single websocket instance for the own application and constantly trying to reconnect.
    componentDidMount() {
        this.connect();
    }

    timeout = 250; // Initial timeout duration as a class variable

     /**
      * @function connect
      * This function establishes the connect with the websocket and also ensures constant reconnection if connection closes
      */
    connect = () => {
        var ws = new WebSocket(this.ws_url);
        let that = this; // cache the this
        var connectInterval;

        // websocket onopen event listener
        ws.onopen = () => {
            console.log("connected websocket main component");

            this.setState({ ws: ws });

            that.timeout = 250; // reset timer to 250 on open of websocket connection 
            clearTimeout(connectInterval); // clear Interval on on open of websocket connection
        };

        // websocket onmessage event listener
        ws.onmessage = e => {
            console.debug("WebSocket message received");

            const live_data = JSON.parse(e.data)

            var {data, historicalData } = this.state;

            const currentTime = new Date()
            live_data.forEach((liveObj, index) => {
                let row = data.filter(obj => obj.city === liveObj.city)[0]

                liveObj.updatedAt = currentTime

                let historicalObj = {time: liveObj.updatedAt, aqi: liveObj.aqi}
                if (row) {
                    row.aqi = liveObj.aqi
                    row.updatedAt = liveObj.updatedAt
                } else {
                    data.push(liveObj)
                    historicalData[liveObj.city] = []
                }
                historicalData[liveObj.city].push(historicalObj)
            })

            data.sort((a, b) => b.aqi - a.aqi);

            this.setState({data, historicalData})
        };

        // websocket onclose event listener
        ws.onclose = e => {
            console.log(
                `Socket is closed. Reconnect will be attempted in ${Math.min(
                    10000 / 1000,
                    (that.timeout + that.timeout) / 1000
                )} second.`,
                e.reason
            );

            that.timeout = that.timeout + that.timeout; //increment retry interval
            connectInterval = setTimeout(this.check, Math.min(10000, that.timeout)); //call check function after timeout
        };

        // websocket onerror event listener
        ws.onerror = err => {
            console.error(
                "Socket encountered error: ",
                err.message,
                "Closing socket"
            );

            ws.close();
        };
    };

    /**
      * utilited by the @function connect to check if the connection is close, if so attempts to reconnect
    */
    check = () => {
        const { ws } = this.state;
        if (!ws || ws.readyState === WebSocket.CLOSED) this.connect(); //check if websocket instance is closed, if so call `connect` function.
    };

    getClassName = (aqi) => {
        var className;
        switch (true) {
            case (aqi <= 50):
                className = "good";
                break;
            case (aqi <= 100):
                className = "satisfactory";
                break;
            case (aqi <= 200):
                className = "moderate";
                break;
            case (aqi <= 300):
                className = "poor";
                break;
            case (aqi <= 400):
                className = "very-poor";
                break;
            default:
                className = "severe"
        }
        return `primary-text ${className}`
    }

    getUpdatedAt = (obj) => {
        const currentTime = new Date()
        const currentHour = currentTime.getHours()
        const currentMinute = currentTime.getMinutes()
        const currentSecond = currentTime.getSeconds()
        const timeHour = obj.updatedAt.getHours()
        const timeMinute = obj.updatedAt.getMinutes()
        const timeSecond = obj.updatedAt.getSeconds()

        var updatedAt;
      
        switch (true) {
            case (currentHour !== timeHour):
                updatedAt = `At ${obj.updatedAt.getHours()}:00`
                break;
            case (timeMinute !== currentMinute && timeMinute + 1 !== currentMinute):
                updatedAt = 'Few minutes ago'
                break;
            case (timeMinute + 1 === currentMinute || currentSecond > 30 + timeSecond):
                updatedAt = 'A minute ago'
                break;
            case (timeSecond === currentSecond):
                updatedAt = 'Just now'
                break;
            case (timeSecond - 10 < currentSecond < timeSecond + 10 ):
                updatedAt = 'few seconds ago'
                break;
            default:
                updatedAt = 'A Day ago'
        }
        return updatedAt
    }

    render() {

        const { toogleHelpModal, selectedCity, search, historicalData} = this.state;

        let {data} = this.state;
        if (search) {
            data = data.filter(obj => obj.city.toLowerCase().includes(search.toLowerCase()))
        }

        var chart;
        if (selectedCity) {
            chart = <Chart
                selectedCity={selectedCity}
                historicalData={historicalData}
                setState={this.setState.bind(this)}
                getClassName={this.getClassName.bind(this)} />
        }

        return (
            <>
                <Header/>
                <Container fluid className="mt-3 p-4">
                    {chart}
                    <Row>
                        <Col>
                            <Card>
                                <CardHeader className="border-0">
                                    <Row className="align-items-center">
                                        <div className="col-8">
                                            <h3 className="mb-0">
                                                <span className="live-badge"></span>
                                                Live
                                            </h3>
                                        </div>
                                        <div className="text-right col-4 search-input-container">
                                            <FormGroup className="mb-0">
                                                <InputGroup className="input-group-alternative">
                                                    <InputGroupAddon addonType="prepend">
                                                        <InputGroupText>
                                                            <i className="fa fa-search" />
                                                        </InputGroupText>
                                                    </InputGroupAddon>
                                                    <Input
                                                        className="form-control-alternative"
                                                        placeholder="Search City"
                                                        type="text"
                                                        name="search"
                                                        value={search}
                                                        onChange={ e=> this.setState({search: e.target.value})}
                                                    />
                                                </InputGroup>
                                            </FormGroup>
                                        </div>
                                    </Row>
                                </CardHeader>
                                <Table className="align-items-center table-flush" responsive>
                                    <thead className="thead-light">
                                        <tr>
                                            <th scope="col">City</th>
                                            <th scope="col">Current AQI</th>
                                            <th scope="col">Last Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((obj, index) => <tr 
                                            className={this.getClassName(obj.aqi)} key={`city-${index}`}
                                            onClick={ () => this.setState({selectedCity: obj.city})}
                                        >
                                            <th scope="row">
                                                <i className="fas fa-city"></i> &nbsp;
                                                {obj.city}
                                            </th>
                                            <td>
                                                {obj.aqi.toFixed(2)}
                                            </td>
                                            <td>{this.getUpdatedAt(obj)}</td>
                                        </tr>)}
                                        {data.length === 0 ? 
                                            <tr>
                                                <td colSpan={3} className="p-4 text-center">
                                                    No data available for "{search}"
                                                </td>
                                            </tr>
                                            : null
                                        }
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3}>
                                                <small className="text-muted float-right color-info" onClick={() => this.setState({toogleHelpModal: !toogleHelpModal})}>
                                                    *know about color band
                                                </small>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </Table>
                            </Card>
                        </Col>
                    </Row>
                    <Modal
                        isOpen={toogleHelpModal}
                        toggle={()=>this.setState({toogleHelpModal: !toogleHelpModal})}
                        className='modal-dialog-centered'
                        size="lg"
                    >
                        <ModalHeader toggle={()=>this.setState({toogleHelpModal: !toogleHelpModal})}>
                            Guide to AQI ( Air Quality Index)
                        </ModalHeader>
                        <ModalBody>
                            <img src="https://erwdev.s3.us-east-2.amazonaws.com/zaqi.png" alt="..."/>
                        </ModalBody>
                    </Modal>
                </Container>
            </>
        )
    }
}
