import React from "react";
import {
  Switch,
  Route,
  Redirect,
  useRouteMatch,
  match as Match,
} from "react-router-dom";

import { RouteName } from "src/utils/routes";
import { TYPE_FILTER, SearchType } from "src/pages/search";

import CompanyPage from "./components/CompanyPage";

/**
 * Page router will either:
 *  - redirect to search with a filter of only companies
 *  - display a company and its jobs
 */
const CompaniesPage = () => {
  const match = useRouteMatch() as Match;

  return (
    <>
      <Switch>
        <Route path={`${match.path}/:companySlug`}>
          <CompanyPage />
        </Route>

        <Route path={match.path}>
          <Redirect
            to={`${RouteName.FIND}?${TYPE_FILTER}=${SearchType.COMPANIES}`}
          />
        </Route>
      </Switch>
    </>
  );
};

export default CompaniesPage;
