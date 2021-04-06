import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter, matchPath } from 'react-router-dom';
import Page from '../src/Page.jsx';
import template from './template.js';
import store from '../src/store.js';
import routes from '../src/routes.js';

async function render(req, res) {
	let initialData;
	const activeRoute = routes.find(
		route => matchPath(req.path, route),
	);

	if (activeRoute && activeRoute.component.fetchData) {
		const match = matchPath(req.path, activeRoute);
		const index = req.url.indexOf('?');
		const search = index !== -1 ? req.url.substr(index) : null;
		initialData = await activeRoute.component
			.fetchData(match, search, req.headers.cookie);
	}

	const userData = await Page.fetchData(req.headers.cookie);
	store.initialData = initialData;
	store.userData = userData;
	const staticContext = {};
	const element = (
		<StaticRouter location={req.url} context={staticContext}>
			<Page />
		</StaticRouter>
	);
	const html = ReactDOMServer.renderToString(element);

	if (staticContext.url) {
		res.redirect(301, staticContext.url);
	} else {
		res.send(template(html, initialData, userData));
	}
}

export default render;
