import * as actions from "./actions"
import {consumer} from './dce'


@consumer
export class RoomsConsumer {
    static getClassName() {return 'RoomsConsumer'}

    consumer(data, error, error_data) {
        if (error) {
            throw new RoomsConsumerError(error, error_data)
        } else {
            console.log('RoomsConsumer: ', data)
            actions.delete_room(data.room)
        }
    }
}

@consumer
export class UserListConsumer {
    static getClassName() {return 'UserListConsumer'}

    consumer(data, error, error_data) {
        if (error) {
            throw new UserListConsumerError(error, error_data)
        } else {
            console.log('UserListConsumer: ', data)
            if (data.action === 'join') {
                actions.add_user_to_userlist(data.nickname)
                actions.add_message({text: `${data.nickname} joined`, type: 'service'})
            } else if (data.action === 'leave') {
                actions.rem_user_from_userlist(data.nickname)
                actions.add_message({text: `${data.nickname} leave`, type: 'service'})
            } else {

            }
        }
    }
}

@consumer
export class MessageConsumer {
    static getClassName() {return 'MessageConsumer'}

    consumer(data, error, error_data) {
        if (error) {
            throw new MessageConsumerError(error, error_data)
        } else {
            console.log('MessageConsumer: ', data)
            actions.add_message(data)
        }
    }
}