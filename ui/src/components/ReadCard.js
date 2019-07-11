import React from "react";
import { connect } from 'react-redux';
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import Card from 'material-kit-react/components/Card/Card';
import CardBody from 'material-kit-react/components/Card/CardBody';


class ReadCard extends React.Component {
  state = {
    reset: true,
  }


  componentWillReceiveProps(this.props.reset) {
    this.setState({reset: this.props.reset})
  }
    componentDidMount() {
        this.props.init();
    }
    render() {
        return (
            <div className={"root"}>
                <Card className={"classes"}>
                  <Typography variant='h5' className={"cardTitle"} style={{fontFamily: 'Raleway'}}>Cluster Activity</Typography>
                  <Divider variant='middle' className={"cardDivider"} style={{width: '92%', margin: '20px auto 0'}}/>
                  <CardBody className={"cardbody"}>
                      <div className={"cardtext"}>
                          {
                              [...this.props.reads].reverse().map((read, index) => {
                                  let imageUrl="";
                                  if (read.targetCluster === "DDAC"){
                                      imageUrl = require('../images/ddac.png')
                                  }
                                  if (read.targetCluster === "OSSC"){
                                      imageUrl = require('../images/cassandra.png')
                                  }
                                  return (
                                      <div key={index}>
                                          <img src={imageUrl} alt={read.targetCluster}  height="36" width="58" style={{ paddingRight: "2em"}} />
                                          Count: {read.count}, Result: {read.result}
                                      </div>
                                  )
                              })
                          }
                      </div>
                  </CardBody>
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
