import React, { Component } from "react"
import {connect} from 'react-redux'


class Home extends Component {
    render() {
        return (
            <React.Fragment>
                <section className="py-5 text-center container">
                    <div className="row py-lg-5">
                        <div className="col-lg-6 col-md-8 mx-auto">
                            <h1 className="fw-light">Example chat project</h1>
                            <p className="lead text-muted">
                                This project created for demonstrate usage of channels_endpoints and servitin packages.
                            </p>
                        </div>
                    </div>
                </section>
            </React.Fragment>
        )
    }
}

const mapStateToProps = function(store) {
    return {
        selected_room: store.chatik_state.selected_room,
        nickname: store.chatik_state.nickname,
    }
}

export default connect(mapStateToProps)(Home)
