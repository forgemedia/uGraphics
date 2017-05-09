import $ from 'jquery';
import SocketIO from 'socket.io-client';
import Navigo from 'navigo';
import Axios from 'axios';

import * as BugCtrl from './dash/bug';
import * as TestCtrl from './dash/test';

let controllers = {
    bug: {
        name: 'Bug',
        controller: BugCtrl
    },
    test: {
        name: 'Test',
        controller: TestCtrl
    }
};

let bindings = {};

let elem = $('#content');
let defaultRoute = 'bug';

let setRoute = id => {
    Axios.get(`/dash/templates/${id}`)
        .then(response => {
            elem.html(response.data);
            bindings[id] = controllers[id].controller.Bind(`#${id}Panel`);
        })
        .catch(error => router.navigate(`/page/${defaultRoute}`));
};

let router = new Navigo();
router
    .on('/page/:id', params => setRoute(params.id))
    .on('*', () => router.navigate(`/page/${defaultRoute}`))
    .resolve();

let io = SocketIO.connect();
