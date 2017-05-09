import $ from 'cash-dom';
import Navigo from 'navigo';
import Axios from 'axios';

let elem = $('#content');

let fillElem = template =>
    Axios.get(`/dash/templates/${template}`)
        .then(response => elem.html(response.data))
        .catch(error => console.dir(error));

let router = new Navigo();
router
    .on('/page/:id', params => fillElem(params.id))
    .on('*', () => router.navigate('/page/default'))
    .resolve();
