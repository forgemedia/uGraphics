import $ from 'jquery';
import _ from 'lodash';
import SocketIO from 'socket.io-client';
import Navigo from 'navigo';
import Axios from 'axios';
import Rivets from 'rivets';

import * as BugCtrl from './dash/bug';
import * as TestCtrl from './dash/test';

$('#loading').remove();

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

let navbar = $('#mainNav');

for (let id in controllers) {
    navbar.append(`<li class="nav-item" id="${id}Link" data-fgroute><a class="nav-link" href="page/${id}" data-navigo>${controllers[id].name}</a></li>`)
}

let bindings = {};
let defaultRoute = _.keys(controllers)[0];

let elem = $('#content');

let setRoute = id => {
    Axios.get(`/dash/templates/${id}`)
        .then(response => {
            elem.html(response.data);
            bindings[id] = controllers[id].controller.Bind(`#${id}Panel`);
        })
        .catch(error => router.navigate(`/page/${defaultRoute}`));
    navbar.children('li').each((i, v) => $(v).removeClass('active'));
    $(`#${id}Link`).addClass('active');
};

let router = new Navigo();
router
    .on('/page/:id', params => setRoute(params.id))
    .on('*', () => router.navigate(`/page/${defaultRoute}`))
    .resolve();

let io = SocketIO.connect();
