import React, { Component } from "react"
import {connect} from 'react-redux'
import {dce} from "channels_endpoints"


class Logs extends Component {
    constructor(props) {
        super(props)

        this.state = {
            logs: [],
            num_last_strings: 20
        }
        this.promises = []
        this.tail_token = null
    }

    cancel = () => {
        if (this.tail_token) {
            this.tail_token.cancel()
            this.tail_token = null
        }
    }

    dce_cancelable = (action, data) => {
        this.cancel()
        let t = {}
        let p = dce(action, data, t, null)
        this.tail_token = t
        return p
    }

    componentDidMount() {
        dce('chatik.get_logs').then(
            logs => {
                this.setState({
                    ...this.state,
                    logs: logs
                })
            },
            error => {
                console.log(error)
            }
        )
    }

    componentWillUnmount() {
        this.cancel()
    }

    set_num_strings = (_, event) => {
        this.setState({
            num_last_strings: event.target.value
        })
    }

    tail = (log) => {
        const promise = this.dce_cancelable('chatik.tail', {log: log, num_last_strings: this.state.num_last_strings})
        promise.then(
            response => {},
            error => {
                if (error.error !== 'CancelledError') {
                    throw error.error
                }
            }
        )
    }

    render() {
        const logs = this.state.logs.map((log) => {
            return <li key={log} className="list-inline-item" style={{paddingBottom: '8px'}}>
                <button type="submit" className="btn btn-success" onClick={() => this.tail(log)}>{log}</button>
            </li>
        })

        return (
            <React.Fragment>
                <section className="py-2 text-center container">
                    <h4 className="fw-light">Hit the button, open js console and see logs realtime</h4>
                </section>
                <div className="container py-4">
                    <div className="row align-items-md-stretch">
                        <div className="col-md-3">
                            <form>
                                <input type="text" className="form-control" id="numStrings" aria-describedby="numStringsHelp"
                                       onChange={this.set_num_strings.bind(this)}
                                       value={this.state.num_last_strings}
                                />
                                <div id="numStringsHelp" className="form-text">Enter number of file last strings</div>
                            </form>
                        </div>
                        <div className="col-md-9">
                            <ul className="list-inline">{logs}</ul>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default Logs
