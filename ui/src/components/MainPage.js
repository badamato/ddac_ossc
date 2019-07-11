import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import ReadCard from './ReadCard';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import { writeApi, readApi } from '../actions/actions';

const styles = theme => ({
  paper: {
      display: 'flex',
      width: '70%',
      height: '80px',
      margin: '0 auto',
      backgroundColor: 'white',
  },
  controlContainer: {
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
  },
  button: {
      margin: '20px 30px',
      color: 'contrast',
  },
  title: {
      color: 'white',
  }
});


class MainPage extends Component {

  componentDidMount(){
    this.props.init()
    }

    render() {
        const { classes } = this.props;
        
        return (
            <div className={"gridroot"} >
                <Grid container justify='center' >
                    <Grid item xs={12} sm={8} style={{marginTop: '30px'}}>
                        <Paper className={"papercard"}>
                            <ReadCard />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={10}>
                        <Paper square className={classes.paper}>
                            <div className={classes.controlContainer}>
                                <Button variant="contained" color="secondary" className={classes.button} size="large" onClick={() => {this.props.getReads('dc0', 'DDAC')}}>READ DDAC</Button>
                                <Button variant="contained" color="secondary" className={classes.button} size="large" onClick={() => {this.props.getWrites('dc0', 'DDAC')}}>WRITE DDAC</Button>
                            </div>
                            <div className={classes.controlContainer}>
                                <Button variant="contained" color="default" className={classes.button} size="large" onClick={() => {this.props.getReads('dc1', 'OSSC')}}>READ OSSC</Button>
                                <Button variant="contained" color="default" className={classes.button} size="large" onClick={() => {this.props.getWrites('dc1', 'OSSC')}}>WRITE OSSC</Button>
                            </div>
                        </Paper>
                    </Grid>
                </Grid>
            </div>
        );
    }

}

const mapStateToProps = (state, ownProps) => {
  return {
      reads: state.app.reads,
      writes: state.app.writes
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
      init: () => {

      },
      getReads: (dc, cluster) => {
          dispatch(readApi(dc, cluster))
      },
      getWrites: (dc, cluster) => {
          dispatch(writeApi(dc, cluster))
      }
  }
}

const MainPageContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MainPage))
export default MainPageContainer;
