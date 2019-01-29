import React from 'react';
import {IndexRoute, Route} from 'react-router';
// import { isLoaded as isAuthLoaded, load as loadAuth } from 'redux/modules/auth';
import {
    App,
    Home,
    NotFound,

    TaggerLogin,
    TaggerSpace,
    TaggerCreate,
    TaggerImport,
    TaggerStats,
    TaggerExport,
    TaggerProjects,
    TaggerAdd,
    TaggerOveriew,
    TaggerVisualize,
    TaggerEdit,
    TaggerOrg,
    TaggerOrgProject,
    TaggerError,
    TaggerKeyBind,
    TaggerContributors
  } from 'containers';

export default (store) => {
  const requireLogin = (nextState, replace, cb) => {
    const { auth: { user }} = store.getState();
    if (!user) {
      // oops, not logged in, so can't be here!
      replace('/projects/login');
    }
    cb();
  };

  /**
   * Please keep routes in alphabetical order
   */
  return (
    <Route path="/" component={App}>
      { /* Home (main) route */ }
      <IndexRoute component={Home}/>

      { /* Routes requiring login */ }
      <Route onEnter={requireLogin}>
        <Route path="projects/create" component={TaggerCreate}/>
        <Route path="projects/edit" component={TaggerEdit}/>
        <Route path="projects/:orgName/create" component={TaggerCreate}/>
        <Route path="projects/:orgName/import" component={TaggerImport}/>
        <Route path="projects/:orgName/:projectName/edit" component={TaggerEdit}/>
        <Route path="projects/:orgName/:projectName/keybind" component={TaggerKeyBind}/>
    </Route>

    { /* Dataturks tool */}
      <Route path="projects/login" component={TaggerLogin}/>
      <Route path="projects/import" component={TaggerImport}/>
      <Route path="projects/space" component={TaggerSpace}/>
      <Route path="projects/stats" component={TaggerStats}/>
      <Route path="projects/export" component={TaggerExport}/>
      <Route path="projects" component={TaggerProjects}/>
      <Route path="projects/add" component={TaggerAdd}/>
      <Route path="projects/overview" component={TaggerOveriew}/>
      <Route path="projects/visualize" component={TaggerVisualize}/>

      <Route path="projects/errors" component={TaggerError}/>
      <Route path="projects/:orgName" component={TaggerOrg} />
      <Route path="projects/:orgName/:projectName" component={TaggerOrgProject} />
      <Route path="projects/:orgName/:projectName/space" component={TaggerSpace}/>
      <Route path="projects/:orgName/:projectName/export" component={TaggerExport}/>
      <Route path="projects/:orgName/:projectName/overview" component={TaggerOveriew}/>
      <Route path="projects/:orgName/:projectName/visualize" component={TaggerVisualize}/>
      <Route path="projects/:orgName/:projectName/contributors" component={TaggerContributors}/>


      { /* Catch all route */ }
      <Route path="*" component={NotFound} status={404} />
    </Route>
  );
};
