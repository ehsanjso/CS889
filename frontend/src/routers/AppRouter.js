import React from "react";
import { Router, Route, Switch } from "react-router";
import { createBrowserHistory } from "history";
import { NavProvider } from "../contexts/NavProvider";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

import Signup from "../components/Signup";
import Login from "../components/Login";
import Dashboard from "../components/Dashboard";
import NotFound from "../components/NotFound";

export const history = createBrowserHistory();

const AppRouter = (props) => {
  return (
    <NavProvider>
      <Router history={history}>
        <Switch>
          <PublicRoute path="/login" component={Login} exact={true} />
          <PublicRoute path="/signup" component={Signup} exact={true} />
          <PrivateRoute path="/" component={Dashboard} exact={true} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </NavProvider>
  );
};

export default AppRouter;
