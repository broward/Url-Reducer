var express = require('express');
var app = express();
var config = require('config');
app.set('port', (process.env.PORT || config.app.port));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// A browser's default method is 'GET', so this
// is the route that express uses when we visit
// our site initially.
app.get('/', function(req, res) {
    // The form's action is '/' and its method is 'POST',
    // so the `app.post('/', ...` route will receive the
    // result of our form
    var html = '<form action="/input" method="post">' +
        '<h2>Url Reducer</h2>' +
        '<br><br>' +
        'Enter your redirection url here:  ' +
        '<input type="text" name="url" style="margin-left:10px;width:400px;" placeholder="..." />' +
        '<br><br>' +
        'Enter your custom url here:  ' +
        '<input type="text" name="customUrl" width="300" style="margin-left:30px;width:400px;" placeholder="..." />' +
        '  (optional) <br><br><br>' +
        '<button type="submit">Submit</button>' +
        '</form>';

    html = html +
        '<br><br>REST API<br><br>' +

        '<pre>http://nintex.herokuapp.com/url				to execute a reduced url</pre>' +
        '<pre>http://nintex.herokuapp.com/seed			initialize or diplay the current generated url</pre>' +
        '<pre>http://nintex.herokuapp.com/read			read an existing url record</pre>' +
        '<pre>http://nintex.herokuapp.com/write			create a url record</pre>' +
        '<pre>http://nintex.herokuapp.com/findKeys?url=url 		find all the keys for a particular url</pre>' +
        '<pre>http://nintex.herokuapp.com/configuration		show current host configuration</pre><br>' +

        'Examples<br><br>' +

        '<pre>http://nintex.herokuapp.com/url/myKey</pre>' +
        '<pre>http://nintex.herokuapp.com/seed</pre>' +
        '<pre>http://nintex.herokuapp.com/read?key=myKey</pre>' +
        '<pre>http://nintex.herokuapp.com/write?key=myKey&url=www.google.com</pre>' +
        '<pre>http://nintex.herokuapp.com/findKeys?url=www.google.com</pre>';

    res.send(html);
});

var routes = require('./routes/couchbase.js');
app.use('/', routes);

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
