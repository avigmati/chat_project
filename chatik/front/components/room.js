import React, { Component } from "react"
import {connect} from "react-redux"
import * as actions from "../actions"
// import {dce, consumer} from "../dce"
import {dce} from "channels_endpoints"
import Nickname from "./nickname"


class Room extends Component {
    constructor(props) {
        super(props)

        this.state = {
            message: null
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // room deleted
        if ((prevProps.current_room !== this.props.current_room) && !this.props.current_room) {
            this.props.history.push((`/chat`)) // leave room
        }
    }

    changeMessage(event) {
        this.setState({
            message: event.target.value
        })
    }

    send = (event) => {
        event.preventDefault()
        if (this.state.message) dce('chatik.send', {'message': this.state.message}, null, null, true)
    }

    componentDidMount() {
        // redirect to rooms chat page for setting nickname
        if (!this.props.user.nickname) {
            this.props.history.push((`/chat`))
        } else {
            // join room
            dce('chatik.join_room', {'room_id': this.props.room_id}).then(
                room => {
                    actions.join_room(room)
                }
            )
        }
    }

    leaveRoom = (e) => {
        e.preventDefault()
        this.props.history.push((`/chat`))
        dce('chatik.leave_room').then(
            response => {
                actions.leave_room()
            }
        )
    }

    render() {
        const current_room = () => {
            if (this.props.current_room) {
                return (
                    <h2><button type="button" className="btn btn-light btn-md" onClick={this.leaveRoom}>
                        <i className="bi bi-x-circle"> </i></button> {this.props.current_room.name} </h2>
                )
            } else {
                return (
                    <h2><button type="button" className="btn btn-light btn-md" onClick={this.leaveRoom}>
                        <i className="bi bi-x-circle"> </i></button>  </h2>
                )
            }
        }

        const users = () => {
            let users = []
            if (this.props.current_room) {
                return this.props.current_room.users.map((user, key) => {
                        return (
                            <div key={key}
                                 className={this.props.user.nickname === user ?
                                     "list-group-item d-flex justify-content-between list-group-item-success" :
                                     "list-group-item d-flex justify-content-between"}
                                     >
                                 {user}
                            </div>
                        )
                    }
                )
            }
            return users
        }

        const messages = () => {
            if (this.props.current_room && this.props.current_room.messages) {
                return this.props.current_room.messages.map((msg, key) => {
                        if (msg.type && msg.type === 'service') {
                            return (
                                <div key={key}>
                                    <span className="text-decoration-underline">{msg.text}</span>
                                    <br />
                                </div>
                            )
                        } else {
                            return (
                                <div key={key}>
                                    <span>{msg.user}</span>: <span>{msg.text}</span>
                                    <br />
                                </div>
                            )
                        }
                    }
                )
            }
        }

        if (!this.props.user.nickname) {
            return (<Nickname />)
        } else {
            return (
                <React.Fragment>
                    <section className="py-5 container">
                        {current_room()}
                        <div className="row">
                            <div className="col-md-10" >
                                <div className="p-2 bg-light border rounded-3 overflow-auto" style={{height: 550}}>
                                    {messages()}
                                </div>
                            </div>
                            <div className="col-md-2">
                                <div className="p-0 bg-light border rounded-3 overflow-auto" style={{height: 550}}>
                                    <ul className="list-group list-group-flush">
                                        {users()}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 p-3" >
                                <form>
                                    <div className="row">
                                        <div className="col-md-10">
                                            <div className="mb-3">
                                                <input type="text" className="form-control" id="message" onChange={this.changeMessage.bind(this)}/>
                                            </div>
                                        </div>
                                        <div className="col-md-2" >
                                            <button type="submit" className="btn btn-primary" onClick={this.send}>send</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </section>
                </React.Fragment>
            )
        }
    }
}

const mapStateToProps = function(store) {
    return {
        user: store.chatik_state.user,
        current_room: store.chatik_state.current_room,
        rooms: store.chatik_state.rooms
    }
}

export default connect(mapStateToProps)(Room)
