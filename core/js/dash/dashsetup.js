// -----------------------------------
// - Dashboard entry point
// -----------------------------------

// Package imports
import $ from 'jquery';
import _ from 'lodash';
import SocketIO from 'socket.io-client';
import Navigo from 'navigo';
import Axios from 'axios';
import Rivets from 'rivets';
import Bootstrap from 'bootstrap';

export default controllers => {
    console.debug('dash: begin');

    // Page elements
    /** The navbar element */
    let navbarElem = $('#mainNav');
    /** The content container element */
    let contentElem = $('#content');

    // When loaded, remove the 'Loading' message
    console.debug('dash: removing all [data-remove-loaded] elements');
    $('[data-remove-loaded]').each((i, v) => $(v).remove());

    // Add a navbar item for each controller
    for (let id in controllers) {
        console.debug(`dash: appending item for id ${id} to navbar`);
        navbarElem.append(`<li class="nav-item" id="${id}Link" data-fgroute><a class="nav-link" href="page/${id}" data-navigo>${controllers[id].name}</a></li>`)
    }

    /** A store of binding objects */
    let bindings = {};

    /** The fallback controller object when the requested route has no corresponding controller*/
    let defaultRoute = _.keys(controllers)[0];

    /** Set up a route */
    let setRoute = id => {
        console.debug(`dash: setting route for ${id}`);
        // Load the template from the server
        Axios.get(`/dash/templates/${id}`)
            .then(response => {
                // If successful, set the inner HTML of the content element
                // to the server's response, and add the binding to the list
                console.debug(`dash: setting inner HTML for id ${id} dashboard`);
                contentElem.html(response.data);
                bindings[id] = new controllers[id].controller(id);
            })
            // Otherwise, go to the default route
            .catch(error => {
                console.debug(`dash: could not set inner HTML for id ${id} dashboard (error ${error})`);
                router.navigate(`/page/${defaultRoute}`)
            });
        
        // Remove the 'active' class for all navbar items
        // then add it to the current one
        // Very possibly a hack-y workaround for functionality I've not yet grasped
        navbarElem.children('li').each((i, v) => $(v).children('a').removeClass('active'));
        $(`#${id}Link a`).addClass('active');
    };

    /** A Navigo router object */
    let router = new Navigo();
    // Set up the router to route requests and provide a fallback
    router
        .on('/page/:id', params => {
            console.debug(`dash: found route for id ${params.id}`);
            setRoute(params.id);
        })
        .on('*', () => {
            console.debug(`dash: wildcard route hit, returning to defaultRoute ${defaultRoute}`);
            router.navigate(`/page/${defaultRoute}`);
        })
        .resolve();

    // Connect to the socket.io server
    console.debug('dash: connecting socket.io');
    /** The socket.io client */
    let io = SocketIO.connect();
}
