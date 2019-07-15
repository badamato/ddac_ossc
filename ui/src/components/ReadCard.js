import React from "react";
import { connect } from 'react-redux';
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'


class ReadCard extends React.Component {
  
    componentDidMount() {
        this.props.init();
    }
    render() {
        return (
            <div className={"root"}>
                <Card className={"classes"}>
                  <Typography variant='h5' className={"cardTitle"} style={{fontFamily: 'Raleway'}}>Cluster Activity</Typography>
                  <Divider variant='middle' className={"cardDivider"} style={{width: '92%', margin: '20px auto 0'}}/>
                  <CardContent className={"cardbody"}>
                      <div className={"cardtext"}>
                          {
                              [...this.props.reads].reverse().map((read, index) => {
                                  let imageUrl="";
                                  if (read.dc === "dc0"){
                                      imageUrl = require('../images/ddac.png')
                                  }
                                  if (read.dc === "dc1"){
                                      imageUrl = require('../images/cassandra.png')
                                  }
                                  return (
                                      <div key={index} style={{padding: '10px 0 10px 0', display: 'flex'}}>
                                          <img src={imageUrl} alt={read.targetCluster}  top="5" height="36" width="58" style={{ paddingRight: "2em", alignItems: 'center'}} />
                                          Count: {read.count}, Result: {read.result}
                                      </div>
                                  )
                              })
                          }
                      </div>
                  </CardContent>
                </Card>
            </div>
        );

    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        reads: state.app.reads
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        init: () => {
        },
    }
}

const ReadCardContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ReadCard)
export default ReadCardContainer;
