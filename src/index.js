'use strict';

var debug = require('debug')('cc-adapter:couchbase');

var Adapter = require('./adapter'),
    CushionMethods = require('./cushion-methods'),
    async = require('async');

/**
 * An ODM class for communicating with Couchbase
 *
 * @class
 */
function AdapterCouchbaseInstaller(options) {
    this.options = options || {};
}

module.exports = exports = AdapterCouchbaseInstaller;


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
        var methods = CushionMethods(cushion, adapter.Cb);
        for (var key in methods) {
            if (cushion[key]) continue;

            cushion[key] = methods[key].bind(cushion);
            debug('bound method `'+key+'` to cushion');
        }
    }

    if (!options.skipProperties) {

        // Add the Cb properties to the cushion instance itself
        cushion.Cb =
        cushion.Couchbase =
            adapter.Couchbase;

    }

    return this;
};
