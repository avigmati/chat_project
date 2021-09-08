import * as actions from "./actions"
import {consumer} from "channels_endpoints"


consumer(function RoomsConsumer(response) {
    console.log('RoomsConsumer: ', response.data)
    actions.delete_room(response.data.room)
})

consumer(function UsersConsumer(response) {
    console.log('UsersConsumer: ', response.data)
    if (response.data.action === 'join') {
        actions.add_user_to_userlist(response.data.nickname)
        actions.add_message({text: `${response.data.nickname} joined`, type: 'service'})
    } else if (response.data.action === 'leave') {
        actions.rem_user_from_userlist(response.data.nickname)
        actions.add_message({text: `${response.data.nickname} leave`, type: 'service'})
    } else {

    }
})

consumer(function MessageConsumer(response) {
    console.log('MessageConsumer: ', response.data)
    actions.add_message(response.data)
})

consumer(function LogConsumer(response) {
    console.log(response.data)
})
