import React, { Component } from "react"
import store from '../store'
import {connect} from 'react-redux'
import * as actions from '../actions'
// import {dce, dce_connection} from "../dce"
import {dce, dce_connection} from "channels_endpoints"

import Rooms from './rooms'
import Room from './room'
import Nickname from './nickname'


class Chat extends Component {
    componentDidMount() {
        // register chat user
        dce('chatik.register_user', {uuid: this.props.user.uuid}).then(
            user_uuid => {
                if (user_uuid) {
                    actions.set_user_uuid(user_uuid)
                }
            }
        )
    }

    render() {
        if (!this.props.user.nickname) {
            return (<Nickname />)
        } else {
            if (this.props.match.params.room_id){
                return (<Room history={this.props.history} room_id={this.props.match.params.room_id}/>)
            } else {
                return (<Rooms history={this.props.history} />)
            }
        }
    }
}

const mapStateToProps = function(store) {
    return {
        user: store.chatik_state.user,
    }
}

export default connect(mapStateToProps)(Chat)


dce_connection.addEventListener("connected", () => {
        dce('chatik.connect_user', {uuid: store.getState().chatik_state.user.uuid}).then(
            response => {
                actions.set_user_connected(true)
            }
        )
    }
)

dce_connection.addEventListener("disconnected", () => {
        actions.set_user_connected(false)
    }
)