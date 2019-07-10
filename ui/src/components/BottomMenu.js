import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import MenuIcon from '@material-ui/icons/Menu';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
// import Snackbar from '@material-ui/core/Snackbar';


import {drawerToggle} from '../actions/NavigationActions';
import { writeApi, readApi, dropOneNode, dropOneDataCenter, resetAllNodes, snackbarToggle, rollingRestart } from '../actions/actions';

import classNames from 'classnames';

const drawerWidth = '100%';

const styles = theme => ({
    root: {
        // backgroundColor: '#ff1919',
        // color: 'black',
        // height: '50px',
        // width: 'fit-content',
        // fontSize: '14px'
    },
    grow: {
        flexGrow: 1,
    },
    text: {
        paddingTop: theme.spacing.unit * 4,
        paddingLeft: theme.spacing.unit * 2,
        paddingRight: theme.spacing.unit * 2,
    },
    paper: {
        height: '62px',
        // paddingTop: '55px',
        paddingBottom: '50px',
        backgroundColor: 'white',
    },
    appBar: {
        top: 'auto',
        bottom: 0,
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['height', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
        }),
    },
    menuButton: {
        marginLeft: 0,
        marginRight: 28,
        color: "white"
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        // height: theme.spacing.unit * 7 + 1,
        [theme.breakpoints.up('sm')]: {
          height: theme.spacing.unit * 0,
        },
    },
    controlContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
    },
    button: {
        margin: '3px 40px',
        color: 'contrast',
    },
    title: {
        color: 'white',
    }
});


class BottomMenu extends React.Component{

        render() {
            const { classes } = this.props;  
            return (
                <div className={classes.root}>
                    <AppBar position="fixed" color="primary" className={classes.appBar} style={{flexDirection: 'row'}}>
                        <Toolbar>
                        <IconButton onClick={() => { this.props.drawerToggle(!this.props.drawerOpen)}} className={classes.menuButton}  aria-label="Open drawer">
                            <MenuIcon />
                        </IconButton>
                        </Toolbar>
                    </AppBar>

                    <Drawer
                        anchor="bottom"
                        variant="permanent"
                        className={classNames(classes.drawer, {
                            [classes.drawerOpen]: this.props.drawerOpen,
                            [classes.drawerClose]: !this.props.drawerOpen,
                        })}
                        classes={{
                            paper: classNames({
                            [classes.drawerOpen]: this.props.drawerOpen,
                            [classes.drawerClose]: !this.props.drawerOpen,
                            }),
                        }}
                        open={this.props.drawerOpen}
                        >
                        <Paper square className={classes.paper}>
                            <div className={classes.controlContainer}>
                                <Button variant="contained" color="secondary" className={classes.button} size="large" onClick={() => {this.props.getReads('dc0', 'DDAC')}}>READ DDAC</Button>
                                <Button variant="contained" color="secondary" className={classes.button} size="large" onClick={() => {this.props.getWrites('dc0', 'DDAC')}}>WRITE DDAC</Button>

                                <Button variant="contained" color="secondary" className={classes.button} size="large" onClick={() => {this.props.getReads('dc1', 'OSSC')}}>READ OSSC</Button>
                                <Button variant="contained" color="secondary" className={classes.button} size="large" onClick={() => {this.props.getWrites('dc1', 'OSSC')}}>WRITE OSSC</Button>

                                {/* <Button variant="contained" color="secondary" className={classes.button} size="large" onClick={() => {this.props.dropOneNode()}}>TOGGLE CLUSTERS</Button> */}
                            </div>
                        </Paper>
                    </Drawer>

                </div>
            );
        }

    componentDidMount(){
    this.props.init()
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        drawerOpen: state.NavigationReducer.drawerOpen,
        page: state.NavigationReducer.page,
        writes: state.app.writes,
        reads: state.app.reads,
        // snackbarOpen: state.app.snackbarOpen
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        init: () => {

        },
        getWrites: (dc, cluster) => {
            dispatch(writeApi(dc, cluster))
        },
        getReads: (dc, cluster) => {
            dispatch(readApi(dc, cluster))
        },
        dropOneNode: () => {
            dispatch(dropOneNode())
        },
        dropOneDataCenter: () => {
            dispatch(dropOneDataCenter())
        },
        resetAllNodes: () => {
            dispatch(resetAllNodes())
        },
        rollingRestart: () => {
            dispatch(rollingRestart())
        },
        drawerToggle: (drawerOpen) => {
            dispatch(drawerToggle(drawerOpen))
        },
        // snackbarToggle: () => {
        //     dispatch(snackbarToggle())
        // },
        changeScreen: (page) => {
            dispatch(changeScreen(page))
            dispatch(drawerToggle(false))
        }
    }
}

const BottomMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(BottomMenu))
export default BottomMenuContainer
