// Import the Express module
import Express from 'express';
import Shell from 'shelljs';
import _ from 'lodash';
import Path from 'path';

/** The router that serves up the contents of dashboard tabs */
let router = Express.Router();

// Serve Pug dashboard templates
router.get('/templates/:id', (req, res) =>
    res.render(`dash/templates/${req.params.id}`, {
        Shell: Shell,
        _: _,
        Path: Path
    }));

// For all other requests to this router, just render the index template
router.get('/*', (req, res) => res.render('dash/index'));

// Export the router object as the default export of the module
export default router;
