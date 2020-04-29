#!/usr/bin/env node

var fs = require('fs')
var minimatch = require('minimatch')
var mkdirp = require('mkdirp')
var path = require('path')
var program = require('commander')
var readline = require('readline')

var MODE_0666 = parseInt('0666', 8)
var MODE_0755 = parseInt('0755', 8)
var TEMPLATE_DIR = path.join(__dirname, '..', 'template')
var VERSION = require('../package').version

var _exit = process.exit

process.exit = exit

// CLI

around(program, 'optionMissingArgument', function (fn, args) {
    program.outputHelp()
    fn.apply(this, args)
    return {
        args: [],
        unknown: []
    }
})

before(program, 'outputHelp', function () {
    this._helpShown = true
})

before(program, 'unknownOption', function () {
    this._allowUnknownOption = this._helpShown
    if (!this._helpShown) {
        program.outputHelp()
    }
})

program
    .name('avouch')
    .version(VERSION, '    --version')
    .usage('[options] [dir]')
    .option('-f, --force', 'force on non-empty directory')
    .parse(process.argv)

if (!exit.exited) {
    main()
}

function around(obj, method, fn) {
    var old = obj[method]
    obj[method] = function () {
        var args = new Array(arguments.length)
        for (var i = 0; i < args.length; i++) args[i] = arguments[i]
        return fn.call(this, old, args)
    }
}

function before(obj, method, fn) {
    var old = obj[method]

    obj[method] = function () {
        fn.call(this)
        old.apply(this, arguments)
    }
}

function confirm(msg, callback) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    rl.question(msg, function (input) {
        rl.close()
        callback(/^y|yes|ok|true$/i.test(input))
    })
}

function copyTemplate(from, to) {
    write(to, fs.readFileSync(path.join(TEMPLATE_DIR, from), 'utf-8'))
}

function copyTemplateMulti(fromDir, toDir, nameGlob) {
    fs.readdirSync(path.join(TEMPLATE_DIR, fromDir))
        .filter(minimatch.filter(nameGlob, {
            matchBase: true
        }))
        .forEach(function (name) {
            copyTemplate(path.join(fromDir, name), path.join(toDir, name))
        })
}


function createApplication(name, dir) {
    console.log()


    if (dir !== '.') {
        mkdir(dir, '.')
    }
    const packageJson = require(TEMPLATE_DIR+'/package.json');
    packageJson.name = name;
    packageJson.version = "1.0.0";
    fs.writeFileSync(dir+'/package.json', JSON.stringify(packageJson));
    copyTemplateMulti('.', dir + '', '*.gitignore')
    copyTemplateMulti('.', dir + '', '*.js')
    copyTemplateMulti('.', dir + '', '*.MD')
    mkdir(dir, '/config');
    copyTemplateMulti('config', dir + '/config', '*.json')
    copyTemplateMulti('config', dir + '/config', '*.js')
    mkdir(dir, 'connections')
    copyTemplateMulti('connections', dir + '/connections', '*.js')
    mkdir(dir, 'connections/schema')
    copyTemplateMulti('connections/schema', dir + '/connections/schema', '*.js')
    mkdir(dir, 'controller')
    copyTemplateMulti('controller', dir + '/controller', '*.js')
    mkdir(dir, 'logDir')
    mkdir(dir, 'models')
    copyTemplateMulti('models', dir + '/models', '*.js')
    mkdir(dir, 'routes')
    copyTemplateMulti('routes', dir + '/routes', '*.js')
    mkdir(dir, 'utils')
    copyTemplateMulti('utils', dir + '/utils', '*.js')

    var prompt = launchedFromCmd() ? '>' : '$'

    if (dir !== '.') {
        console.log()
        console.log('   change directory:')
        console.log('     %s cd %s', prompt, dir)
    }

    console.log()
    console.log('   install dependencies:')
    console.log('     %s npm install', prompt)
    console.log()
    console.log('  run the ddl script in postgres server before updating the config ')
    console.log('  DDL Location:: https://github.com/arunkumarpalaniappan/avouch/blob/master/template/ddl.sql')
    console.log()
    console.log('  Postman collection for API :: https://github.com/arunkumarpalaniappan/avouch/blob/master/postman/collection.json')
    console.log()
    console.log('  update config:')
    console.log('  to update the config, read the documentation provided at https://github.com/arunkumarpalaniappan/avouch/blob/master/README.MD#update-config')
    console.log()
    console.log('   run the app:')

    if (launchedFromCmd()) {
        console.log('     %s node index.js', prompt)
    } else {
        console.log('     %s node index.js', prompt)
    }

    console.log()
}


function createAppName(pathName) {
    return path.basename(pathName)
        .replace(/[^A-Za-z0-9.-]+/g, '-')
        .replace(/^[-_.]+|-+$/g, '')
        .toLowerCase()
}

function emptyDirectory(dir, fn) {
    fs.readdir(dir, function (err, files) {
        if (err && err.code !== 'ENOENT') throw err
        fn(!files || !files.length)
    })
}


function exit(code) {

    function done() {
        if (!(draining--)) _exit(code)
    }

    var draining = 0
    var streams = [process.stdout, process.stderr]

    exit.exited = true

    streams.forEach(function (stream) {
        draining += 1
        stream.write('', done)
    })

    done()
}

function launchedFromCmd() {
    return process.platform === 'win32' &&
        process.env._ === undefined
}



function main() {
    var destinationPath = program.args.shift() || '.';
    var appName = createAppName(path.resolve(destinationPath)) || 'hello-world';
    emptyDirectory(destinationPath, function (empty) {
        if (empty || program.force) {
            createApplication(appName, destinationPath)
        } else {
            confirm('destination is not empty, continue? [y/N] ', function (ok) {
                if (ok) {
                    process.stdin.destroy()
                    createApplication(appName, destinationPath)
                } else {
                    console.error('aborting')
                    exit(1)
                }
            })
        }
    })
}


function mkdir(base, dir) {
    var loc = path.join(base, dir)

    console.log('   \x1b[36mcreate\x1b[0m : ' + loc + path.sep)
    mkdirp.sync(loc, MODE_0755)
}

function write(file, str, mode) {
    fs.writeFileSync(file, str, {
        mode: mode || MODE_0666
    })
    console.log('   \x1b[36mcreate\x1b[0m : ' + file)
}