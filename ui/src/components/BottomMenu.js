import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';


const BottomMenu = () => {
    return (
        <div>
            <AppBar position="fixed" color="primary" style={{top: 'auto', bottom: 0}}>
                  <Toolbar></Toolbar>
            </AppBar>
        </div>
    );
};

export default BottomMenu;
