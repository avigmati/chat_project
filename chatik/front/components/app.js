import { hot } from 'react-hot-loader/root'
import React, { Component } from "react"
import {  HashRouter as Router, Switch, Route, Link,  } from 'react-router-dom'

import Home from './home'
import Chat from './chat'
import Logs from './logs'


class App extends Component {
    render() {
        return (
            <Router>
                <React.Fragment>
                    <header className="site-header sticky-top py-1">
                        <nav className="navbar navbar-expand-lg navbar-light bg-light rounded" aria-label="Twelfth navbar example">
                            <div className="container-fluid">
                                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#navbarsExample10" aria-controls="navbarsExample10"
                                        aria-expanded="false" aria-label="Toggle navigation">
                                    <span className="navbar-toggler-icon"> </span>
                                </button>

                                <div className="collapse navbar-collapse justify-content-md-center" id="navbarsExample10">
                                    <ul className="navbar-nav">
                                        <li className="nav-item">
                                            <Link to={'/'} className="nav-link" aria-current="page" href="#">Home</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to={'/chat'} className="nav-link" aria-current="page" href="#">Chat</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to={'/logs'} className="nav-link" aria-current="page" href="#">Logs</Link>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" href="/admin">Admin</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </nav>
                    </header>

                    <Switch>
                        <Route exact path='/' component={Home} />
                        <Route exact path='/chat' component={Chat} />
                        <Route exact path='/chat/:room_id' component={Chat} />
                        <Route exact path='/logs' component={Logs} />
                    </Switch>
                </React.Fragment>
            </Router>
        )
    }
}

export default hot(App)
