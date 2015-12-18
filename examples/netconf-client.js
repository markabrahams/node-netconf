var netconf = require('./netconf');
var util = require('util');
var fs = require('fs');
var process = require('process');
var hb = require('handlebars');

var router = new netconf.Client('192.168.56.101', 22, 'daryl', 'Juniper');
//router.log.level('debug');

var data = '';
process.stdin.on('data', function (chunk) {
    data += chunk;
}).on('end', function () {
    render(JSON.parse(data), 'template.hb');
});

function render(data, template_file) {
    fs.readFile(template_file, function (err, buffer) {
        if (!err) {
            var template = hb.compile(buffer.toString());
            var result = template(data);
            configureRouter(result);
        } else {
            throw err;
        }
    });
}

function configureRouter(config) {
    router.open(function afterOpen(err) {
        if (!err) {
            router.load(config, commitConf);
        } else {
            throw err;
        }
    });
}

function commitConf(err, reply) {
    if (!err) {
        router.commit(function resultAndClose(err, reply) {
            console.log(util.inspect(reply, {depth:null, colors: true}));
            console.log('commited');
            router.close();
        });
    } else {
        throw err;
    }
}
