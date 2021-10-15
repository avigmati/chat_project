import * as actions from "./actions"
import {consumer} from "channels_endpoints"


consumer('RoomsConsumer', (response) => {
    actions.delete_room(response.room)
})

consumer('UsersConsumer', (response) => {
    if (response.action === 'join') {
        actions.add_user_to_userlist(response.nickname)
        actions.add_message({text: `${response.nickname} joined`, type: 'service'})
    } else if (response.action === 'leave') {
        actions.rem_user_from_userlist(response.nickname)
        actions.add_message({text: `${response.nickname} leave`, type: 'service'})
    } else {

    }
})

consumer('MessageConsumer', (response) => {
    actions.add_message(response)
})

consumer('LogConsumer', (response) => {
    console.log(response)
})