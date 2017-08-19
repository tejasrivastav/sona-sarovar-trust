import React from 'react';
import {Route} from 'react-router-dom';
import BaseContainer from '../components/AdminPanel/BaseContainer';
import BasicSideNav from '../components/AdminPanel/BasicSideNav';
import HomePanel from '../components/AdminPanel/HomePanel';
import ProjectsPanel from '../components/AdminPanel/ProjectsPanel';

const AdminPanel = ({match}) => {
  return (
    <main id="admin-panel">
      <div className="admin-panel-wrapper" style={{display: 'flex'}}>
        <BaseContainer style={{background: '#2c3e50', color: '#FFF'}}>
          <BasicSideNav adminMatch={match}/>
        </BaseContainer>
        <div className="controller-holder">
          <Route path="/admin/home" component={HomePanel}/>
          <Route path="/admin/projects" component={ProjectsPanel}/>
        </div>
      </div>
    </main>
  );
};

export default AdminPanel;
