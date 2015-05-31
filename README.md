# Cushion Adapter Couchbase [![Build Status](https://secure.travis-ci.org/jfelsinger/cushion-adapter-couchbase.png?branch=master)](https://travis-ci.org/jfelsinger/cushion-adapter-couchbase) [![Analytics](https://ga-beacon.appspot.com/UA-46797352-2/cushion-adapter-couchbase/index)](https://github.com/igrigorik/ga-beacon)
## An adapter for connecting to a Couchbase DB through Couch-cushion

### Installation

```
npm install --save cushion-adapter-couchbase
```

```javascript
var cushion = require('couch-cushion'),
    adapter = require('cushion-adapter-couchbase');

cushion.install(adapter);
cushion.connect({ /* adapter config */ });
```


# Configuration

Configuration is initially done through the `connect` function, which passes the
options on to the adapter.

## Configuration Options

```
{
    host:       undefined,  // The host that the CB cluster is located on
    bucket:     'default',  // The bucket name to connect to

    bucketPass: null,       // If there is a password on the bucket


    // Optional, timeouts for different operations.
    // See CB docs for details

    connectionTimeout:  undefined,
    opartionTimeout:    undefined,
    opartionTimeout:    undefined,
    managementTimeout:  undefined,

    // N1ql server endpoints to be enabled via:
    // bucket.enableN1ql(/* ... */)

    n1qlEndpoints:      undefined,
}
```

# Mock Interface

The adapter can be setup to use Couchbase SDK's mock interface for testing.

```javascript
var cushion = require('couch-cushion'),
    adapter = require('cushion-adapter-couchbase');

cushion.install(adapter.Mock); // Install Mock adapter
cushion.connect({ /* adapter config */ });
```

# Couch Cushion Methods and Properties

After installing the Couchbase adapter a number of new properties and methods
become available to the base CouchCushion object. The new methods and properties
are to ease the process of communicating with Couchbase through the adapter.

## Properties

*Cb / Couchbase*:

Allows access to the same Couchbase instance used by the adapter.

ex: `cushion.Cb` / `cushion.Couchbase`


## Methods

### CouchCushion.getOne(*model*, *cb*, *search*[, *key*[, *doc*[, *db*]]])

Gets a single model from Couchbase using a query. The method accepts either an
already constructed query or arguments that can be used to create a query. The
result that is returned is the first doc that Couchbase returns.

Ex:

```javascript
var cb = function(err, model, res) {
    /* ... */
}

// Using a query
var query = cushion.CB.ViewQuery
    .from('userDesignDoc', 'by_username')
    .key('jfelsinger');

cushion.getOne('User', cb, query);

// Using parts of a query
cushion.getOne('User', cb, 'by_username', 'jfelsinger', 'userDesignDoc');
```


### CouchCushion.getMany(*model*, *cb*, *search*[, *key*[, *doc*[, *db*]]])

Same as above, but returns an array of objects.

Ex:

```javascript
var cb = function(err, models, res) {
    /* ... */
}

// Using a query
var query = cushion.CB.ViewQuery
    .from('userDesignDoc', 'by_status')
    .key('online');

cushion.getOne('User', cb, query);

// Using parts of a query
cushion.getMany('User', cb, 'by_status', 'online', 'userDesignDoc');
```


### CouchCushion.fromQuery(*model*, *cb*, *query*[, *db*])

Gets an array of models from a query, much like `getMany()`.

Ex:

```javascript
// Using a query
var query = cushion.CB.ViewQuery
    .from('userDesignDoc', 'by_status')
    .key('online');

cushion.fromQuery('User', cb, query);
```


### CouchCushion.oneFromQuery(*model*, *cb*, *query*[, *db*])

Gets a single model from a query, much like `getOne()`.

Ex:

```javascript
// Using a query
var query = cushion.CB.ViewQuery
    .from('userDesignDoc', 'by_username')
    .key('jfelsinger');

cushion.oneFromQuery('User', cb, query);
```


### CouchCushion.fromView(*model*, *cb*, *view*, *key*, *doc*[, *db*[, *isMultiKey*]])

Gets an array of models from a view query, much like `getMany()`.

Ex:

```javascript
cushion.fromView('User', cb, 'by_status', 'online', 'userDesignDoc');
```


### CouchCushion.oneFromView(*model*, *cb*, *view*, *key*, *doc*[, *db*[, *isMultiKey*]])

Gets a single model from a view query, much like `getOne()`.

Ex:

```javascript
cushion.oneFromView('User', cb, 'by_username', 'jfelsinger', 'userDesignDoc');
```
