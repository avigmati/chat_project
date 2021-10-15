import React, { Component } from "react"
import {connect} from "react-redux"
import * as actions from '../actions'
import CreateRoom from "./create_room"
import {dce} from "channels_endpoints"


class Rooms extends Component {
    constructor(props) {
        super(props)

        this.state = {
            warning_show: false
        }
    }

    componentDidMount() {
        // load rooms list
        dce('chatik.get_rooms').then(
            rooms => {
                rooms = rooms.map((room, key) => {
                    return {name: room.fields.name, id: room.pk}
                })
                actions.set_rooms(rooms)
            }
        )
    }

    gotoRoom = (room_id) => {
        this.props.history.push((`/chat/${room_id}`))
    }

    deleteRoom = (room_id) => {
        dce('chatik.delete_room', {'room_id': room_id}).then(
            response => {
                // actions.delete_room(room_id)
            },
            error => {
                if (error.error === 'AccessForbidden') {
                    this.setState({
                        warning_show: true
                    })
                }
                else {
                    throw error
                }
            }
        )
    }

    changeNickname = () => {
        actions.set_user_nickname(null)
    }

    render() {
        const rooms = this.props.rooms.map((room, key) =>
            <div key={key} className="list-group-item d-flex w-100 justify-content-between">
                <a className="link-primary" onClick={this.gotoRoom.bind(this, room.id)}><h5 className="mb-1">{room.name}</h5></a>
                <span>{room.owner === USER.id ? "(owner)": ""}</span>
                <button key={key} type="button" className="btn btn-secondary btn-sm"
                        onClick={this.deleteRoom.bind(this, room.id)}><i className="bi bi-trash"> </i> delete</button>
            </div>
        )

        const warning = () => {
            if (this.state.warning_show) {
                return (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        You can`t delete this room, you are not the owner!
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"> </button>
                    </div>
                )
            } else {}
        }

        return (
            <React.Fragment>
                <section className="py-5 text-center container">
                    <div className="row">
                        <h1 className="fw-light">Welcome <a className="link-primary" onClick={this.changeNickname.bind(this)}>{this.props.user.nickname}</a>!
                        </h1>
                    </div>
                </section>
                <div className="container py-4">
                    <div className="row align-items-md-stretch">
                        <div className="col-md-6">
                            <div className="h-100 p-5 bg-light rounded-3">
                                <CreateRoom history={this.props.history} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="h-100 p-5 bg-light rounded-3">
                                <h3>Join rooms</h3>
                                <div className="alert alert-primary alert-dismissible fade show" role="alert">
                                    Try to delete the room not by its owner or admin.
                                    Also configure settings.ADMINS and mail settings to receive errors to your email address.
                                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"> </button>
                                </div>
                                 {warning()}
                                <div className="list-group">{rooms}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = function(store) {
    return {
        rooms: store.chatik_state.rooms,
        user: store.chatik_state.user
    }
}


export default connect(mapStateToProps)(Rooms)


