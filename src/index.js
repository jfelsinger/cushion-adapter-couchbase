'use strict';

var debug = require('debug')('cc-adapter:couchbase');

var Adapter = require('./adapter'),
    cushionMethods = require('./cushion-methods');
    async = require('async');

/**
 * An ODM class for communicating with Couchbase
 *
 * @class
 */
function AdapterCouchbaseInstaller() {
    this.options = options || {};
}

module.exports = exports = new AdapterCouchbaseInstaller();


/**
 * Sets or gets an option
 *
 * @param {string} option
 * @param {*} [value]
 * @returns {*}
 */
AdapterCouchbaseInstaller.prototype.getOption =
AdapterCouchbaseInstaller.prototype.setOption =
function(option, value) {
    if (arguments.length === 2) {
        debug('setting option: ' + option + ' = ' + value);

        this.options[option] = value;

        return this;

    } else {
        debug('getting option: ' + option);

        return this.options[option];

    }
};


/**
 * Install a database adapter for use
 */
AdapterCouchbaseInstaller.prototype.install =
function installCouchbase(cushion, options) {
    options = options || this.options;

    var adapter = new Adapter();

    cushion._adapter = adapter;
    debug('set cushion adapter to this');

    if (!options.skipMethods) {
        var methods = cushionMethods(adapter.Cb);
        for (var key in cushionMethods) {
            if (cushion[key]) continue;

            cushion[key] = cushionMethods[key].bind(cushion);
            debug('bound method `'+key+'` to cushion');
        }
    }

    if (!options.skipProperties) {

        // Add the Cb properties to the cushion instance itself
        cushion.prototype.Cb =
        cushion.prototype.Couchbase =
            adapter.Couchbase;

    }

    return this;
};
