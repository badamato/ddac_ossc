import {connect} from 'react-redux';
import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import TopMenu from './TopMenu';
import MainPage from './MainPage';
import BottomMenu from './BottomMenu';
import MainView from './MainPage';

import style from '../style.css';

const theme = createMuiTheme({
    root: {
        height: '100vh',
    },
    typography: {
        useNextVariants: true,
    },
    palette: {
        primary: {
        main: '#8031A7',
        contrastText: 'white',
        },
        secondary: {
        main: '#3cc5e7',
        // main: '#0CB7E1',
        },
    },
    text:{
        primary: {
        main: '#000000',
        },
        secondary: {
        main: '#FFFFFF',
        },
    },
});

class App extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        this.props.app.engine.unregisterCallbacks();
    }

    render() {
        return (
        <MuiThemeProvider theme={theme}>
            <TopMenu />
            <MainPage />
            <BottomMenu />
        </MuiThemeProvider>
        );
    }
}


const mapStateToProps = state => state;
const dispatchToProps = dispatch => ({dispatch});

export default connect(mapStateToProps, dispatchToProps)(App);
