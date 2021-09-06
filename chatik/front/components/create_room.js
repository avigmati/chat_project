import React, { Component } from "react"
import {connect} from "react-redux"
import * as actions from '../actions'
import {dce} from "channels_endpoints"


class CreateRoom extends Component {
    constructor(props) {
        super(props)

        this.state = {
            name: {
                value: '',
                errors: null,
                help: 'Enter unique room name'
            }
        }
    }

    createRoom = (event) => {
        event.preventDefault()
        dce('chatik.create_room', {'name': this.state.name.value}).then(
            room => {
                this.setState({
                    name: {value: '', errors: null}
                })
                actions.add_room(room)
                this.props.history.push((`/chat/${room.id}`))
            },
            error => {
                if (error.error === 'ValidationError') {
                    this.setState({
                        name: {
                            errors: error.data
                        }
                    })
                }
                else if (error.error === 'AccessForbidden') {
                    this.setState({
                        name: {
                            errors: "Only authenticated users can create rooms. Please login."
                        }
                    })
                }
                else {
                    throw error
                }
            }
        )
    }

    changeRoomName(event) {
        this.setState({
            name: {
                errors: null,
                value: event.target.value
            }
        })
    }

    render() {
        const roomNameHelp = () => {
            if (this.state.name.errors) {
                return ( <div id="roomNameHelp" className="invalid-feedback">{this.state.name.errors}</div> )
            } else {
                return ( <div id="roomNameHelp" className="form-text">{this.state.name.help}</div> )
            }
        }

        return (
            <React.Fragment>
                <h3>Create room</h3>
                <form>
                    <div className="mb-3">
                        <input type="text" className={this.state.name.errors ? "form-control is-invalid" : "form-control"}
                               id="roomName" aria-describedby="roomNameHelp" onChange={this.changeRoomName.bind(this)}/>
                        {roomNameHelp()}
                    </div>
                    <button type="submit" className="btn btn-primary" onClick={this.createRoom}>Create and join</button>
                </form>
            </React.Fragment>
        )
    }
}

const mapStateToProps = function(store) {
    return {
        user: store.chatik_state.user
    }
}

export default connect(mapStateToProps)(CreateRoom)
