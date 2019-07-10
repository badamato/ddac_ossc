import {createAction} from 'redux-actions';
import requestActions from './requestActions.js';
import { get } from '../common/requests.js';
import { post } from '../common/requests.js';
import { streamingRequest } from '../common/requests.js';

//const hostname = '3.17.77.103';
const hostname = window.location.hostname;

export function writeApi(dc, cluster) {
    var data = '{"dc":"' + dc + '", "count": 200000, "cl": "ONE", "targetCluster":"' + cluster +'"}';

    return(dispatch, getState) => {
        // dispatch(appendValue('events', 'Initiating writes for purchase transactions'))

        const url = 'http://'+hostname+':5000/demo/write';
        streamingRequest({
            url: url,
            params: data,
            success: function(response){
                var reader = response.body.getReader();
                readChunk(reader, dispatch, "writes")
            },
            dispatch: dispatch,
            method: "POST",
            description: 'initiating writes for purchase transaction'
        })
    }

}

export function readApi(dc, cluster) {
  var data = '{"dc":"' + dc + '", "count": 200000, "cl": "ONE", "targetCluster":"' + cluster +'"}';

    return(dispatch, getState) => {
        // dispatch(appendValue('events', 'Initiating reads for purchase transactions'))

        const url = 'http://'+hostname+':5000/demo/read';
        streamingRequest({
            url: url,
            params: data,
            success: function(response){
                var reader = response.body.getReader();
                readChunk(reader, dispatch, "reads")
            },
            dispatch: dispatch,
            method: "POST",
            description: 'initiating reads for purchase transaction'
        })
    }
}

export function getNodeInfo() {
    return(dispatch, getState) => {
        const url = 'http://'+hostname+':5000/demo/nodefull';
        const interval = setInterval(() => {
            get({
                url: url, 
                success: function(res){
                    let oldNodeList = []
                    Object.assign(oldNodeList, getState().app.nodeList)
                    oldNodeList = oldNodeList.map((node, id) => {
                          let olderNodeList = getState().app.oldNodeList
                          if (node.last_seen > 0) {
                            if (olderNodeList === undefined || olderNodeList[id] === undefined) {
                                return node
                            }
                            if (olderNodeList[id].mode === 'starting') {
                                node.mode = 'starting';
                                node.last_seen = -1;
                            }
                          } if(node.last_seen === 0){
                            if (olderNodeList === undefined || olderNodeList[id] === undefined) {
                                return node
                            }
                            if (olderNodeList[id].mode === 'stopping') {
                                node.mode = 'stopping';
                                node.last_seen = -2;
                            }
                          }
  return node
                    })

                    dispatch(updateValue('oldNodeList', oldNodeList))
                    dispatch(updateValue('nodeList', res.data))

                },
                dispatch: dispatch,
            });
        }, 5000)
    }
}


// export function getDataCenter(url) {
//     return(dispatch, getState) => {
//         get({
//             url: url, 
//             success: function(res){
//                 dispatch(updateValue('nodeList', res.data))

//                 let rawList = []
//                 rawList = res.data.map((data) => {
//                     if(data.dc) {
//                         return data.dc
//                     }
//                 });
//                 let dcList = [...new Set(rawList)]
//                 dispatch(updateValue('dcList', dcList))
//             },
//             dispatch: dispatch
//         });
//     }
// }

// export function readChunk(reader, dispatch, valueKey){
//     reader.read().then(function(result){
//         var decoder = new TextDecoder();
//         var chunk = decoder.decode(result.value || new Uint8Array, {stream: !result.done});
//         chunk.split("\n").forEach((chunkedLine) => {
//             if (chunkedLine.trim().length != 0){
//                 const incomingApiData = JSON.parse(chunkedLine);
//                 dispatch(appendValue(valueKey, incomingApiData));
//             }
//         });
//         if (result.done) {
//             // dispatch(removeRequest(key))
//             if (args == null){
//                 dispatch(runWhenDone())
//             }else {
//                 dispatch(runWhenDone(args))
//             }
//             return;
//         } else {
//             return readChunk(reader, dispatch, valueKey);
//         }
//     });
// }


export function updateValue(key, value){
    return(dispatch, getState) => {
            dispatch(updateData("UPDATE", {"key": key, "value": value}))
    }
}

export function appendValue(key, value) {
    return(dispatch, getState) => {
        const state = getState();
        var currentKeyState = state.app[key]

        currentKeyState.push(value)
        dispatch(updateData("UPDATE", {"key": key, "value": currentKeyState}))
    }
}

export const updateData = (type, data) => {
    return {
        type: type,
        data: data
    }
}

export default {writeApi, readApi, getNodeInfo, updateValue, appendValue, updateData};
