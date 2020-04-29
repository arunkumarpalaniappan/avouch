
var assert = require('assert')
var exec = require('child_process').exec
var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var rimraf = require('rimraf')
var spawn = require('child_process').spawn
var utils = require('./support/utils')
var validateNpmName = require('validate-npm-package-name')

var PKG_PATH = path.resolve(__dirname, '..', 'package.json')
var BIN_PATH = path.resolve(path.dirname(PKG_PATH), require(PKG_PATH).bin.avouch)
var NPM_INSTALL_TIMEOUT = 300000 // 5 minutes
var TEMP_DIR = utils.tmpDir()

describe('express(1)', function () {
  after(function (done) {
    this.timeout(30000)
    rimraf(TEMP_DIR, done)
  })

  describe('(no args)', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    it('should create basic app', function (done) {
      runRaw(ctx.dir, [], function (err, code, stdout, stderr) {
        if (err) return done(err)
        ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
        ctx.stderr = stderr
        ctx.stdout = stdout
        assert.strictEqual(ctx.files.length, 30)
        done()
      })
    })

    it('should have a package.json file', function () {
      var file = path.resolve(ctx.dir, 'package.json')
      var contents = fs.readFileSync(file, 'utf8')
      assert(contents.length > 16)
    })

    it('should have installable dependencies', function (done) {
      this.timeout(NPM_INSTALL_TIMEOUT)
      npmInstall(ctx.dir, done)
    })

    describe('when directory contains spaces', function () {
      var ctx0 = setupTestEnvironment('foo bar (BAZ!)')

      it('should create basic app', function (done) {
        run(ctx0.dir, [], function (err, output) {
          if (err) return done(err)
          assert.strictEqual(utils.parseCreatedFiles(output, ctx0.dir).length, 30)
          done()
        })
      })

      it('should have a valid npm package name', function () {
        var file = path.resolve(ctx0.dir, 'package.json')
        var contents = fs.readFileSync(file, 'utf8')
        var name = JSON.parse(contents).name
        assert.ok(validateNpmName(name).validForNewPackages, 'package name "' + name + '" is valid')
        assert.strictEqual(name, 'foo-bar-baz')
      })

      removeTestEnvironment(ctx0, 'foo bar (BAZ!)')
    })

    describe('when directory is not a valid name', function () {
      var ctx1 = setupTestEnvironment('_')

      it('should create basic app', function (done) {
        run(ctx1.dir, [], function (err, output) {
          if (err) return done(err)
          assert.strictEqual(utils.parseCreatedFiles(output, ctx1.dir).length, 30)
          done()
        })
      })

      it('should default to name "hello-world"', function () {
        var file = path.resolve(ctx1.dir, 'package.json')
        var contents = fs.readFileSync(file, 'utf8')
        var name = JSON.parse(contents).name
        assert.ok(validateNpmName(name).validForNewPackages)
        assert.strictEqual(name, 'hello-world')
      })
      removeTestEnvironment(ctx1, '_')
      removeTestEnvironment(ctx, this.fullTitle())
    })
  })

  describe('(unknown args)', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    it('should exit with code 1', function (done) {
      runRaw(ctx.dir, ['--foo'], function (err, code, stdout, stderr) {
        if (err) return done(err)
        assert.strictEqual(code, 1)
        done()
      })
    })

    it('should print usage', function (done) {
      runRaw(ctx.dir, ['--foo'], function (err, code, stdout, stderr) {
        if (err) return done(err)
        assert.ok(/Usage: avouch /.test(stdout))
        assert.ok(/--help/.test(stdout))
        assert.ok(/--version/.test(stdout))
        assert.ok(/error: unknown option/.test(stderr))
        done()
      })
    })

    it('should print unknown option', function (done) {
      runRaw(ctx.dir, ['--foo'], function (err, code, stdout, stderr) {
        if (err) return done(err)
        assert.ok(/error: unknown option/.test(stderr))
        done()
      })
    })

    removeTestEnvironment(ctx, this.fullTitle())
  })

  describe('<dir>', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    it('should create basic app in directory', function (done) {
      runRaw(ctx.dir, ['foo'], function (err, code, stdout, stderr) {
        if (err) return done(err)
        ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
        ctx.stderr = stderr
        ctx.stdout = stdout
        assert.strictEqual(ctx.files.length, 31)
        done()
      })
    })

    it('should provide change directory instructions', function () {
      assert.ok(/cd foo/.test(ctx.stdout))
    })

    it('should provide install instructions', function () {
      assert.ok(/npm install/.test(ctx.stdout))
    })

    removeTestEnvironment(ctx, this.fullTitle())
  })

  describe('-h', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    it('should print usage', function (done) {
      run(ctx.dir, ['-h'], function (err, stdout) {
        if (err) return done(err)
        var files = utils.parseCreatedFiles(stdout, ctx.dir)
        assert.strictEqual(files.length, 0)
        assert.ok(/Usage: avouch /.test(stdout))
        assert.ok(/--help/.test(stdout))
        assert.ok(/--version/.test(stdout))
        done()
      })
    })

    removeTestEnvironment(ctx, this.fullTitle())
  })

  describe('--help', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    it('should print usage', function (done) {
      run(ctx.dir, ['--help'], function (err, stdout) {
        if (err) return done(err)
        var files = utils.parseCreatedFiles(stdout, ctx.dir)
        assert.strictEqual(files.length, 0)
        assert.ok(/Usage: avouch /.test(stdout))
        assert.ok(/--help/.test(stdout))
        assert.ok(/--version/.test(stdout))
        done()
      })
    })

    removeTestEnvironment(ctx, this.fullTitle())
  })
})

function npmInstall (dir, callback) {
  var env = utils.childEnvironment()

  exec('npm install', { cwd: dir, env: env }, function (err, stderr) {
    if (err) {
      err.message += stderr
      callback(err)
      return
    }

    callback()
  })
}

function run (dir, args, callback) {
  runRaw(dir, args, function (err, code, stdout, stderr) {
    if (err) {
      return callback(err)
    }

    process.stderr.write(utils.stripWarnings(stderr))

    try {
      assert.strictEqual(utils.stripWarnings(stderr), '')
      assert.strictEqual(code, 0)
    } catch (e) {
      return callback(e)
    }

    callback(null, utils.stripColors(stdout))
  })
}

function runRaw (dir, args, callback) {
  var argv = [BIN_PATH].concat(args)
  var binp = process.argv[0]
  var stderr = ''
  var stdout = ''

  var child = spawn(binp, argv, {
    cwd: dir
  })

  child.stdout.setEncoding('utf8')
  child.stdout.on('data', function ondata (str) {
    stdout += str
  })
  child.stderr.setEncoding('utf8')
  child.stderr.on('data', function ondata (str) {
    stderr += str
  })

  child.on('close', onclose)
  child.on('error', callback)

  function onclose (code) {
    callback(null, code, stdout, stderr)
  }
}

function setupTestEnvironment (name) {
  var ctx = {}
  ctx.dir = path.join(TEMP_DIR, name.replace(/[<>]/g, ''))
  mkdirp(ctx.dir)
  return ctx
}

function removeTestEnvironment (ctx, name) {
  after('cleanup environment', function (done) {
    this.timeout(30000)
    rimraf(ctx.dir, done)
  })
  return ctx
}
