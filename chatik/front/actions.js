import store from './store'
import * as types from './actions_types'
import {DELETE_ROOM, SET_USER_NICKNAME} from "./actions_types";


export function set_user_connected(connected) {
    store.dispatch({
        type: types.SET_USER_CONNECTED,
        connected
    })
}

export function set_user_uuid(user_uuid) {
    store.dispatch({
        type: types.SET_USER_UUID,
        user_uuid
    })
}

export function set_user_nickname(nickname) {
    store.dispatch({
        type: types.SET_USER_NICKNAME,
        nickname
    })
}

export function add_room(room) {
    store.dispatch({
        type: types.ADD_ROOM,
        room
    })
}

export function delete_room(room_id) {
    store.dispatch({
        type: types.DELETE_ROOM,
        room_id
    })
}

export function set_rooms(rooms) {
    store.dispatch({
        type: types.SET_ROOMS,
        rooms
    })
}

export function join_room(room) {
    store.dispatch({
        type: types.JOIN_ROOM,
        room
    })
}

export function leave_room() {
    store.dispatch({
        type: types.LEAVE_ROOM
    })
}

export function add_user_to_userlist(user) {
    store.dispatch({
        type: types.ADD_USER_TO_USERLIST,
        user
    })
}

export function rem_user_from_userlist(user) {
    store.dispatch({
        type: types.REM_USER_FROM_USERLIST,
        user
    })
}

export function add_message(message) {
    store.dispatch({
        type: types.ADD_MESSAGE,
        message
    })
}
