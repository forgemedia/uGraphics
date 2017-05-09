import Path from 'path';

import Express from 'express';

let settings = {
    port: 3000
}

var app = Express();
app.set('view engine', 'pug');

for (let url of [
    'assets',
    'jspm_packages'
]) app.use(`/${url}`, Express.static(Path.join(__dirname, url)));

app.all('/dash/templates/:id', (req, res) => res.render(`dash/templates/${req.params.id}`));
app.all('/dash*', (req, res) => res.render('dash/index'));

app.listen(settings.port, () => console.log(`Listening on port ${settings.port}`));
