import { combineReducers } from 'redux'
import * as types from './actions_types'


const chatik_initial = {
    user: {
        connected: false,
        nickname: null,
        uuid: null
    },
    rooms: [],
    current_room: null,
}


const chatik_reducer = (state=chatik_initial, action) => {
    switch(action.type) {

        case types.SET_USER_UUID:
            return {
                ...state,
                user: {
                    ...state.user,
                    uuid: action.user_uuid
                }
            }

        case types.SET_USER_CONNECTED:
            return {
                ...state,
                user: {
                    ...state.user,
                    connected: action.connected
                }
            }

        case types.SET_USER_NICKNAME:
            return {
                ...state,
                user: {
                    ...state.user,
                    nickname: action.nickname
                }
            }

        case types.ADD_ROOM:
            return {
                ...state,
                rooms: [...state.rooms, action.room]
            }

        case types.ADD_USER_TO_USERLIST:
            return {
                ...state,
                current_room: {
                    ...state.current_room,
                    users: [...state.current_room.users, action.user]
                }
            }

        case types.REM_USER_FROM_USERLIST:
            return {
                ...state,
                current_room: {
                    ...state.current_room,
                    users: state.current_room.users.filter(user => user !== action.user)
                }
            }

        case types.SET_ROOMS:
            return {
                ...state,
                rooms: action.rooms
            }

        case types.DELETE_ROOM:
            return {
                ...state,
                rooms: state.rooms.filter(room => room.id !== action.room_id),
                current_room: null
            }

        case types.JOIN_ROOM:
            return {
                ...state,
                current_room: action.room
            }

        case types.LEAVE_ROOM:
            return {
                ...state,
                current_room: null
            }

        case types.ADD_MESSAGE:
            return {
                ...state,
                current_room: {
                    ...state.current_room,
                    messages: state.current_room.messages ? [...state.current_room.messages, action.message] : [action.message]
                }
            }

    }
    return state
}

const reducers = combineReducers({
    chatik_state: chatik_reducer
})


export default reducers