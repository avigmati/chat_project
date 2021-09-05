import React, { Component } from "react"
import {connect} from 'react-redux'
import * as actions from '../actions'
// import {dce} from "../dce"
import {dce} from "channels_endpoints"


class Nickname extends Component {
    constructor(props) {
        super(props)

        this.state = {
            nickname: {
                value: '',
                errors: null,
                help: 'Enter unique nickname'
            }
        }
    }

    componentDidMount() {
        // request current user nickname from backend
        dce('chatik.get_nickname').then(
            nickname => {
                if (nickname) {
                    this.setState({
                        nickname: {
                            errors: null,
                            value: nickname
                        }
                    })
                }
            }
        )
    }

    changeNickname(event) {
        this.setState({
            nickname: {
                errors: null,
                value: event.target.value
            }
        })
    }

    setNickname = (event) => {
        event.preventDefault()
        const nickname = this.state.nickname.value

        dce('chatik.set_nickname', {'nickname': nickname}).then(
            response => {
                this.setState({
                    nickname: {errors: null}
                })
                actions.set_user_nickname(nickname)
            },
            error => {
                if (error.error === 'ValidationError') {
                    this.setState({
                        nickname: {
                            errors: error.data
                        }
                    })
                }
                else {
                    throw error
                }
            }
        )
    }

    render() {
        const nicknameHelp = () => {
            if (this.state.nickname.errors) {
                return ( <div id="nicknameHelp" className="invalid-feedback">{this.state.nickname.errors}</div> )
            } else {
                return ( <div id="roomNameHelp" className="form-text">{this.state.nickname.help}</div> )
            }
        }
        return (
            <React.Fragment>
               <section className="py-5 text-center container">
                    <div className="row py-lg-5">
                        <div className="col-lg-6 col-md-8 mx-auto">
                            <h1 className="fw-light">Enter your nickname</h1>
                            <form>
                                <div className="mb-3">
                                    <input type="text" className={this.state.nickname.errors ? "form-control is-invalid" : "form-control"}
                                           id="nickname" aria-describedby="nicknameHelp" onChange={this.changeNickname.bind(this)}
                                           value={this.state.nickname.value || ""}
                                    />
                                    {nicknameHelp()}
                                </div>
                                <button type="submit" className="btn btn-primary" onClick={this.setNickname}>Set</button>
                            </form>
                        </div>
                    </div>
                </section>
            </React.Fragment>
        )
    }
}

const mapStateToProps = function(store) {
    return {
        user: store.chatik_state.user
    }
}

export default connect(mapStateToProps)(Nickname)
