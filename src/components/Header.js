import React from "react";

import {
    Navbar,
    Nav,
    Container
} from "reactstrap";

export default class Header extends React.Component {
    render () {
        return (
            <Navbar className="navbar-top navbar-dark bg-gradient-info" expand="md" id="navbar-main">
                <Container fluid>
                    <Nav className="align-items-center d-md-flex primary-text" navbar>
                        Air Quality Index
                    </Nav>
                </Container>
            </Navbar>
        )
    }
}
