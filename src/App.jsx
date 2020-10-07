import React, { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import { connect } from 'react-redux';
import { userState } from './Store/Actions/Login';
import Loading from './Components/Animation/Loading';
import { ToastProvider } from 'react-toast-notifications';
import Content from './Components/Animation/Content';
import Header from './Components/Home/Header/Header';
import Toast from './Components/Utils/Toast';
import socket from './Components/Functions/Users';
import './Styles/main.css';
import { RecieveMessage } from './Store/Actions/Message';
import Peer from './Components/Channel/Chat/Utils/Peer';
import { RecieveFiles } from './Store/Actions/Peer';

const Auth = lazy(() => import('./Components/Auth/Login'));
const Home = lazy(() => import('./Components/Home/Home'));
const About = lazy(() => import('./Components/About/About'));
const Invite = lazy(() => import('./Components/Invite/Invite'));
const Settings = lazy(() => import('./Components/Settings/Settings'));
const Create = lazy(() => import('./Components/Create/Create'));
const Logout = lazy(() => import('./Components/Utils/Logout'));
const Channel = lazy(() => import('./Components/Invite/Channel'));
const Room = lazy(() => import('./Components/Channel/Channel'));
const Page404 = lazy(() => import('./Components/404/FNF'));

function App({ loginState, init, recieveMessage, connected, reciveFiles }) {
  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    recieveMessage();
  }, [recieveMessage]);

  useEffect(() => {
    const obj = {
      uid: loginState.user?.uid || null,
      displayName: loginState.user?.displayName || 'Anonymous',
      online: true,
    };

    if (loginState.authenticated) {
      Peer.Init();
      Peer.on('connected', (data) => {
        console.log('From the frontEnd');
        connected(data);
        reciveFiles(Peer.peer);
      });
      socket.emit('authenticated', obj);
    }
  }, [loginState, connected, reciveFiles]);

  const path = window.location.pathname;
  const slug = path.split('/')[2];

  return (
    <Router>
      {/* Wait for the AuthState */}

      {loginState.isLoginLoading && <Loading />}

      {/*  Check for Auth State and Redirect */}

      {!loginState.isLoginLoading &&
        !loginState.authenticated &&
        !path.includes('/invite') && <Redirect to="/login" />}

      {!loginState.isLoginLoading &&
        loginState.authenticated &&
        path.includes('/invite') && <Redirect to={'/channel/' + slug} />}

      {/* Unauthenticated Route */}
      <Suspense fallback={<Content />}>
        <Switch>
          <Route path="/login" component={Auth} />
          <Route path="/invite/:id" component={Invite} />
        </Switch>
      </Suspense>

      <ToastProvider>
        <Toast />
      </ToastProvider>

      {/* Protected Routes */}

      {loginState.authenticated && (
        <div className="lg:grid lg:grid-cols-4 ">
          <Header />
          <Suspense fallback={<Content />}>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/r/:id" component={Room} />
              <Route path="/settings" component={Settings} />
              <Route path="/about" component={About} />
              <Route path="/create" component={Create} />
              <Route path="/logout" component={Logout} />
              <Route path="/channel/:id" component={Channel} />
              <Route component={Page404} />
            </Switch>
          </Suspense>
        </div>
      )}
    </Router>
  );
}

const mapStateToProps = (state) => ({
  loginState: state.authReducer,
});

const mapDispatchToProps = (dispatch) => ({
  init: () => dispatch(userState()),
  connected: (bool) => dispatch({ type: 'PEER_CONNECTED', payload: bool }),
  recieveMessage: () => dispatch(RecieveMessage()),
  reciveFiles: (Peer) => dispatch(RecieveFiles(Peer)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
