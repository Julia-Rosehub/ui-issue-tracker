import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import routes from './routes.js';

const Contents = () => {
	const newRoutes = routes.map(attrs => <Route {...attrs} key={attrs.path} />);
	return (
		<Switch>
			<Redirect exact from="/" to="/issues" />
			{newRoutes}
		</Switch>
	);
};

export default Contents;
