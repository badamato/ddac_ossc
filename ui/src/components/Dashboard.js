import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import MoonLoader from 'react-spinners/MoonLoader'
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

import {updateValue, getNodeInfo} from '../actions/actions'


const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    clusterCard: {
      maxWidth: '550px',
      margin: '15px auto'
    },
    clusterMedia: {
      height: '70px',
      backgroundSize: 'contain',
    }
});

class Dashboard extends React.Component {
    componentDidMount() {
        this.props.init();
    }

    render ({ classes } = this.props){
        let dataCenterDetails = []

        let nodeList = this.props.nodeList
            .sort(function(a, b){
                return a.dc.localeCompare(b.dc)
            })

        let dcs = Array.from(new Set (nodeList.map((node) => node.dc)))
        let coords = [[-74.0060, 40.7128], [-122.4194,37.7749], [-0.1278,51.5074], [ 139.817413,35.672855,]]

        nodeList.map((node, id) => {
            // Set data for bubble chart
            node.name = node.node_ip;
            node.coordinates = coords[dcs.indexOf(node.dc)];
            if (node.mode === 'stopping') {
                node.last_seen = -2;
            }
            if (node.mode === 'starting') {
                node.last_seen = -1;
            }

            var oldNodeList = this.props.oldNodeList
            if (node.last_seen > 0) {
                node.last_seen = 1
                if (oldNodeList === undefined || oldNodeList[id] === undefined) {
                    return node
                }
                if (oldNodeList[id].mode === 'starting') {
                    node.mode = 'starting';
                    node.last_seen = -1;
                }
                return node
            }if (node.last_seen === 0){
                    if (oldNodeList === undefined || oldNodeList[id] === undefined) {
                        return node
                    }
                    if (oldNodeList[id].last_seen === -2) {
                        node.mode = 'stopping';
                        node.last_seen = -2;
                }
                return node
            }
        })

        nodeList.map((node, id) => {
            let newDcDetail = {};
            newDcDetail.name = node.dc
            let nodeCondition = [0, -1, 1, -2];
            let nodeConditionName = ['countUp', 'starting', 'countDown', 'stopping'];

            if (dataCenterDetails.length === 0 ){
                nodeCondition.map((value, index) => {
                    if (node.last_seen === value) {
                        newDcDetail[nodeConditionName[index]] = 1;
                    } else {
                        newDcDetail[nodeConditionName[index]] = 0;
                    }
                }) 
                dataCenterDetails.push(newDcDetail)
            } else {
                let dcIsMissing = true;
                dataCenterDetails.map(detail => {
                    if (detail.name === node.dc) {
                        dcIsMissing = false;
                        nodeCondition.map((value, index) => {
                            if (node.last_seen === value) {
                                detail[nodeConditionName[index]] = detail[nodeConditionName[index]] + 1
                            } else {
                                detail[nodeConditionName[index]] = detail[nodeConditionName[index]]
                            }
                        })
                    }
                })
                if (dcIsMissing) {
                    nodeCondition.map((value, index) => {
                        if (node.last_seen === value) {
                            newDcDetail[nodeConditionName[index]] = 1;
                        } else {
                            newDcDetail[nodeConditionName[index]] = 0;
                        }
                    }) 
                    dataCenterDetails.push(newDcDetail)
                }
            }
        })

        return (
          <div className={classes.root}>
            <Grid container spacing={24}>
              <Grid item xs={6} style={{padding: 0}}>
                <Card className={classes.clusterCard}>
                  <CardActionArea style={{padding: '10px'}}>
                    <CardMedia
                      className={classes.clusterMedia}
                      image={require('../images/ddac.png')}
                      title="DDAC"
                      style={{marginTop: '10px', marginBottom: '10px'}}
                    />
                    <Divider variant='middle' />
                    <CardContent className={classes.clusterCardBody}>
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                          <Typography variant='h6' component='div' style={{color: '#ca5f14', margin: '10px 60px 0 20px'}}>
                            NODE STATUS CODES
                          </Typography>
                          <Typography variant='h6' component='div' style={{color: '#ca5f14', margin: '10px 50px 0 0'}}>
                            ACTIVE
                          </Typography>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'center', textAlign: 'center'}}>
                          <div style={{maxHeight: '200px', maxWidth: '200px', margin: '10px 40px 0 40px', fontSize: '90px'}}>
                            DL
                          </div>
                          <div style={{maxHeight: '200px', maxWidth: '200px', margin: '30px 30px 0 60px'}}>
                            ____ ____ ____
                            {/* <MoonLoader color={'#006600'} /> */}
                          </div>
                        </div>
                    </CardContent>
                  </CardActionArea>
                  <CardActions>
                    <Button size="small" color="primary" variant='outlined'>
                      Select Cluster
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={6} style={{padding: 0}}>
                <Card className={classes.clusterCard}>
                  <CardActionArea style={{padding: '10px'}}>
                    <CardMedia
                      className={classes.clusterMedia}
                      image={require('../images/cassandra.png')}
                      title="OSSC"
                      style={{marginTop: '10px', marginBottom: '10px'}}
                    />
                    <Divider variant='middle' />
                    <CardContent className={classes.clusterCardBody}>
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                          <Typography variant='h6' component='div' style={{color: '#ca5f14', margin: '10px 60px 0 20px'}}>
                            NODE STATUS CODES
                          </Typography>
                          <Typography variant='h6' component='div' style={{color: '#ca5f14', margin: '10px 50px 0 0'}}>
                            ACTIVE
                          </Typography>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'center', textAlign: 'center'}}>
                          <div style={{maxHeight: '200px', maxWidth: '200px', margin: '10px 40px 0 40px', fontSize: '90px'}}>
                            UN
                          </div>
                          <div style={{maxHeight: '200px', maxWidth: '200px', margin: '30px 30px 0 60px'}}>
                            {/* ____ ____ ____ */}
                            <MoonLoader color={'#006600'} />
                          </div>
                        </div>
                    </CardContent>
                  </CardActionArea>
                  <CardActions>
                      <Button size="small" color="primary" variant='outlined'>
                        Select Cluster
                      </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </div>
            //     <div className={
            //     (this.props.fullscreen === "dc-paper") ?  
            //         "dashboardroot-full" 
            //     : 
            //         "dashboardroot"
            //     }>
            //     { !this.props.mapView ?
            //         <div className="spanningDiv">
            //             <Button 
            //                 variant="contained" 
            //                 color="secondary" 
            //                 className={"button"} 
            //                 size="large" 
            //                 onClick={() => {this.props.updateValue("mapView", !this.props.mapView)}}
            //             >
            //             Map
            //             </Button>
            //             <Table className={classes.table}>
            //                 <TableHead style={{backgroundColor: 'silver'}}>
            //                     <TableRow>
            //                         <TableCell className={classes.tablecell} style={{color: 'black', fontSize: '25px'}}>NODE</TableCell>
            //                         <TableCell className={classes.tablecell} style={{color: 'black', fontSize: '25px'}} align='center'>ONLINE</TableCell>
            //                         <TableCell className={classes.tablecell} style={{color: 'black', fontSize: '25px'}} align='center'>STARTING</TableCell>
            //                         <TableCell className={classes.tablecell} style={{color: 'black', fontSize: '25px'}} align='center'>OFFLINE</TableCell>
            //                         <TableCell className={classes.tablecell} style={{color: 'black', fontSize: '25px'}} align='center'>
            //                             { this.props.fullscreen != "dc-paper" ? 
            //                                     <IconButton 
            //                                         color="primary" 
            //                                         onClick={() => { this.props.updateValue("fullscreen", "dc-paper")}} 
            //                                         className={classes.menuButton}  
            //                                         aria-label="Fullscreen"
            //                                     >
            //                                         <FullscreenIcon />
            //                                     </IconButton>
            //                                     : 
            //                                     <IconButton 
            //                                         onClick={() => { this.props.updateValue("fullscreen", "")}} 
            //                                         className={classes.menuButton} 
            //                                         color="primary" 
            //                                         aria-label="Fullscreen Exit"
            //                                     >
            //                                         <FullscreenExitIcon />
            //                                     </IconButton>
            //                             } </TableCell>
            //                     </TableRow>
            //                 </TableHead>
            //             <TableBody>
            //                 {dataCenterDetails.map ((detail, id) => {
            //                     return (
            //                         <TableRow key={id}>
            //                             <TableCell style={{fontSize: '30px', color: 'gray'}} className={classes.tablecell}>{detail.name}</TableCell>
            //                             <TableCell style={{color: 'limegreen'}} className={classes.tablecell} align='center'>{detail.countUp}</TableCell>
            //                             <TableCell style={{color: '#ffc966'}} className={classes.tablecell} align='center'>{detail.starting}</TableCell>
            //                             <TableCell style={{color: 'red'}} className={classes.tablecell} align='center'>{detail.countDown + detail.stopping}</TableCell>
            //                         </TableRow>
            //                         )
            //                     })}
            //             </TableBody>
            //         </Table>
            //         </div>
            //         : <div className={"spanningDiv"} onWheel = {(e) => this.handleWheel(e)} >
            //             <Button 
            //                 variant="contained" 
            //                 color="secondary" 
            //                 className={"button"} 
            //                 size="large" 
            //                 onClick={() => {this.props.updateValue("mapView", !this.props.mapView)}}
            //             >
            //             Table
            //             </Button>
            //             <DataCenterMapContainer/>
            //         </div>
            //     }
            // </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        drawerOpen: state.NavigationReducer.drawerOpen,
        page: state.NavigationReducer.page,
        nodeList: state.app.nodeList,
        oldNodeList: state.app.oldNodeList,
        dcList: state.app.dcList,
        mapView: state.app.mapView,
        mapZoom: state.app.mapZoom,
        fullscreen: state.app.fullscreen,
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        init: () => {
            dispatch(getNodeInfo())
        },
        drawerToggle: (drawerOpen) => {
            dispatch(drawerToggle(drawerOpen))
        }, 
        changeScreen: (page) => {
            dispatch(changeScreen(page))
            dispatch(drawerToggle(false))
        },
        updateValue: (key, value) => {
            dispatch(updateValue(key, value))
        } 
    }
}

const DashboardContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(Dashboard))
export default DashboardContainer
