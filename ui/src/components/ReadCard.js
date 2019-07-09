import React from "react";
import { connect } from 'react-redux';
import Card from 'material-kit-react/components/Card/Card';
import CardHeader from 'material-kit-react/components/Card/CardHeader';
import CardBody from 'material-kit-react/components/Card/CardBody';


class ReadCard extends React.Component {
    componentDidMount() {
        this.props.init();
    }
    render() {
        return (
            <div className={"root"}>
                <Card className={"classes"}>
                    <CardHeader className={"cardheader"} style={{paddingTop: '11px', paddingBottom: '11px', backgroundColor: '#d8d8d8', marginTop: '-12px'}}>BROWSING CATALOG</CardHeader>
                    <CardBody className={"cardbody"}>
                        <div className={"cardtext"}>
                            {
                                [...this.props.reads].reverse().map((read, index) => {
                                    let imageUrl= "";
                                    if (read.targetCluster === "DDAC"){
                                        imageUrl = require('../images/ddac.png')
                                    }
                                    if (read.targetCluster === "OSSC"){
                                        imageUrl = require('../images/cassandra.png')
                                    }
                                    return (
                                        <div key={index}>
                                            <img src={imageUrl} alt={read.targetCluster}  height="36" width="58" style={{ "padding-right": "2em"}} />
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
