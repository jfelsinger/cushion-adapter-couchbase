'use strict';

var debug = require('debug')('cc-adapter:couchbase');

var Couchbase = require('couchbase'),
    request = require('superagent'),
    async = require('async');

/**
 * An adapter class for dealing with a Coucbase DB
 *
 * @class
 */
function AdapterCouchbase() {
    this.options = {};
}


// Expose the instance of Couchbase that we're using
AdapterCouchbase.prototype.Cb =
AdapterCouchbase.prototype.Couchbase = Couchbase;


/**
 * Sets or gets an option
 *
 * @param {string} option
 * @param {*} [value]
 * @returns {*}
 */
AdapterCouchbase.prototype.getOption =
AdapterCouchbase.prototype.setOption = function(option, value) {
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
 * Connect to a Couchbase cluster and specified bucket
 *
 * @param {{host: string, bucket: string, bucketPassword: string}} options
 * @returns {AdapterCouchbase}
 */
AdapterCouchbase.prototype.connect = function connect(options) {
    options = options || {};

    var cluster = new Couchbase.Cluster(options.host);
    var bucket = options.bucketPassword ?
        cluster.openBucket(options.bucket, options.bucketPassword) :
        cluster.openBucket(options.bucket);

    // Set timeouts
    if (options.connectionTimeout)
        bucket.connectionTimeout = options.connectionTimeout;
    if (options.operationTimeout)
        bucket.operationTimeout = options.operationTimeout;
    if (options.viewTimeout)
        bucket.viewTimeout = options.viewTimeout;
    if (options.managementTimeout)
        bucket.managementTimeout = options.managementTimeout;

    // Optionally, enable n1ql on the bucket
    if (options.n1qlEndpoints) {
        bucket.enableN1ql(options.n1qlEndpoints);

        // Save endpoint
        this.options.n1qlEndpoint = options.n1qlEndpoints;
        if (Array.isArray(this.options.n1qlEndpoint))
            this.options.n1qlEndpoint = this.options.n1qlEndpoint[0];
    }


    this.options.cluster = cluster;
    this.options.bucket = bucket;

    return this;
};


/**
 * Get objects from Couchbase
 */
AdapterCouchbase.prototype.get =
function get(names) {
    if (!Array.isArray(names)) {
        debug('get (1) doc: ', names);

        this.options.bucket.get.apply(
            this.options.bucket,
            arguments
        );
    } else {
        debug('get ('+names.length+') docs');


        this.options.bucket.getMulti.apply(
            this.options.bucket,
            arguments
        );
    }

    return this;
};


/**
 * Save objects to Couchbase
 */
AdapterCouchbase.prototype.save =
AdapterCouchbase.prototype.upsert =
function save(names, data, cb) {
    if (!Array.isArray(names)) {
        debug('save (1) doc: ', names);
        names = [names];
    } else {
        debug('save ('+names.length+') docs');
    }

    var requests = names.map(function(name) {
        return function(cb) {
            this.options.bucket.upsert(name, data, cb);
        }.bind(this);
    }.bind(this));

    async.parallel(requests, cb);

    return this;
};


/**
 * Remove objects from Couchbase
 */
AdapterCouchbase.prototype.del =
AdapterCouchbase.prototype.remove =
AdapterCouchbase.prototype.delete =
function del(names, cb) {
    if (!Array.isArray(names)) {
        debug('delete (1) doc: ', names);
        names = [names];
    } else {
        debug('delete ('+names.length+') docs');
    }

    var requests = names.map(function(name) {
        return function(cb) {
            this.options.bucket.remove(name, cb);
        }.bind(this);
    }.bind(this));

    async.parallel(requests, cb);

    return this;
};


// --- Optional Methods ---


/**
 * Insert objects to Couchbase
 */
AdapterCouchbase.prototype.insert =
function insert(names, data, cb) {
    if (!Array.isArray(names)) {
        debug('insert (1) doc: ', names);
        names = [names];
    } else {
        debug('insert ('+names.length+') docs');
    }

    var requests = names.map(function(name) {
        return function(cb) {
            this.options.bucket.insert(name, data, cb);
        }.bind(this);
    }.bind(this));

    async.parallel(requests, cb);

    return this;
};


/**
 * Update objects in Couchbase
 */
AdapterCouchbase.prototype.update =
AdapterCouchbase.prototype.replace =
function update(names, data, cb) {
    if (!Array.isArray(names)) {
        debug('update (1) doc: ', names);
        names = [names];
    } else {
        debug('update ('+names.length+') docs');
    }

    var requests = names.map(function(name) {
        return function(cb) {
            this.options.bucket.replace(name, data, cb);
        }.bind(this);
    }.bind(this));

    async.parallel(requests, cb);

    return this;
};


/**
 * Query objects from Couchbase
 */
AdapterCouchbase.prototype.query =
function query(q) {
    if (typeof(q) === 'string' ||
        q instanceof Couchbase.N1qlQuery) {
        this.n1qlQuery.apply(this, arguments);
    } else {
        this.options.bucket.query.apply(
            this.options.bucket,
            arguments
        );
    }

    return this;
};


/**
 * Patch n1ql querying with direct http access
 */
AdapterCouchbase.prototype.n1qlQuery =
function n1qlQuery(query, cb) {
    if (typeof(query.toObject) === 'function') {
        query = query.toObject();
    } else {
        query = { statement: query };
    }

    request
        .get(this.options.n1qlEndpoint)
        .query(query)
        .end(function(err, res) {
            var body, rows;

            try {
                body = JSON.parse(res && res.text);
                rows = body && body.results;
            } catch(e) {
                console.log(e);
                console.log(res.text);
                body = res.body || res.text || res;
                rows = body && body.results;
            }

            cb(err, rows || body || res, res);
        });

    return this;
};





module.exports = AdapterCouchbase;
