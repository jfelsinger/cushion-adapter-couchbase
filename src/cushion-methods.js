'use strict';

module.exports = function(cushion, Couchbase) {
    var Model = cushion._Model;

    function getResults(response) {
        var value = response;

        if (value) {
            if (value.rows)
                return getResults(value.rows);

            if (value.value)
                return getResults(value.value);
        }

        return value;
    }

    function getOneResult(response) {
        var value = getResults(response);

        if (Array.isArray(value))
            return getOneResult(value[0]);

        return value;
    }

    /**
     * Build a view query
     */
    function buildViewQuery(view, key, doc, isMultiKeyQuery, stale) {
        if (!doc) {
            // Get the document name
        }

        var query = Couchbase.ViewQuery.from(doc, view);

        if (key) {
            if (isMultiKeyQuery && Array.isArray(key))
                query = query.keys(key);

            else if (key.id)
                query = query.key(key.id);

            else if (key._fields && key._fields.id)
                query = query.key(key._fields.id.get());

            else
                query = query.key(key);
        }

        // By default we don't want to use CB's annoying caching
        query = query.stale(stale || 1);

        return query;
    }


    return {

        /**
         * Get a single document from a search
         *
         * @param {Model|string} model - The model type that will be returned
         * @param {*} cb
         * @param {*} search - A Couchbase query to be executed
         * @param {*} key
         * @param {string} doc - A document name, for a view query
         * @param {*} adapter
         * @returns {AdapterCouchbase}
         */
        getOne: function(model, cb, search, key, doc, db) {
            if (search instanceof Couchbase.ViewQuery ||
               (search.keys && search.key && search.from)) {
                    return this.oneFromQuery(model, cb, search, db);
                } else {
                    return this.oneFromView(model, cb, search, key, doc, db);
                }
        },


        /**
         * Get an array of documents from a search
         *
         * @param {Model|string} model - The model type that will be returned
         * @param {*} cb
         * @param {*} search - A Couchbase query to be executed
         * @param {*} key
         * @param {string} doc - A document name, for a view query
         * @param {*} adapter
         * @returns {AdapterCouchbase}
         */
        getMany: function(model, cb, search, key, doc, db) {

            if (search instanceof Couchbase.ViewQuery ||
               (search.keys && search.key && search.from)) {
                return this.fromQuery(model, cb, search, db);
            } else if (typeof search === 'object' && search.bbox) {
                var query = Couchbase.SpatialQuery
                                     .from(search.ddoc, search.name)
                                     .bbox(search.bbox);

                return this.fromQuery(model, cb, query, db);
            } else {
                return this.fromView(model, cb, search, key, doc, db);

            }
        },


        // Query


        /**
         * Get a document from a query
         *
         * @param {Model|string} model - The model type that will be returned
         * @param {*} cb
         * @param {*} query - A Couchbase query to be executed
         * @param {*} adapter
         * @returns {AdapterCouchbase}
         */
        fromQuery: function(model, cb, query, db) {
            db = db || this._adapter;

            // Get the requested Model class that queried values represent
            var RequestModel = this.getModel(model);

            // If the Model couldn't be found give an error response
            if (!(RequestModel && RequestModel.prototype instanceof Model)) {
                var err = new Error('requested model type `'+model+'` not found');
                return cb(err, null, null);
            }

            db.query(query, function(err, res) {
                if (err) return cb(err, null, res);
                var models = [];

                if (res) {
                    var values = getResults(res);

                    // Convert results into instantiated models
                    for (var i = 0; i < values.length; i++) {
                        // Get the actual value for the row
                        var modelValue = values[i].value;
                        if (typeof(modelValue) === 'string')
                            modelValue = JSON.parse(modelValue);

                        // Instantiate new Model, set it's data, and add it to
                        // the result set.
                        var resultModel = new RequestModel({ adapter: db });
                        resultModel.set(modelValue);
                        models.push(resultModel);
                    }
                } else {
                    err = new Error('could not get documents from bucket');
                }

                cb(err, models, res);
            });

            return this;
        },


        /**
         * Get a single document from a query
         *
         * @param {Model|string} model - The model type that will be returned
         * @param {*} cb
         * @param {*} query - A Couchbase query to be executed
         * @param {*} adapter
         * @returns {AdapterCouchbase}
         */
        oneFromQuery: function(model, cb, query, db) {
            db = db || this._adapter;
            var RequestModel = this.getModel(model);

            if (!(RequestModel && RequestModel.prototype instanceof Model)) {
                var err = new Error('requested model type `'+model+'` not found');
                return cb(err, null, null);
            }

            db.query(query, function(err, res) {
                if (err) return cb(err, null, res);
                var resultModel = null;

                if (res) {
                    // Get the first value from the results
                    var resultValue = getOneResult(res);
                    if (typeof(resultValue) === 'string')
                        resultValue = JSON.parse(resultValue);

                    // Instantiate new Model and set it's data
                    if (resultValue) {
                        resultModel = new RequestModel({ adapter: db });
                        resultModel.set(resultValue);
                    }
                } else {
                    err = new Error('could not get documents from bucket');
                }

                return cb(err, resultModel, res);
            });

            return this;
        },


        // Views


        /**
         * Get an array of documents from a view query
         *
         * @param {Model|string} model - The model type that will be returned
         * @param {*} cb
         * @param {string} view - The view's name
         * @param {*} key
         * @param {string} doc - A document name, for a view query
         * @param {*} adapter
         * @returns {AdapterCouchbase}
         */
        fromView: function(model, cb, view, key, doc, db, isMultiKey) {
            var query = buildViewQuery(view, key, doc, isMultiKey, this.options.stale);
            return this.fromQuery(model, cb, query, db);
        },


        /**
         * Get a single document from a view query
         *
         * @param {Model|string} model - The model type that will be returned
         * @param {*} cb
         * @param {string} view - The view's name
         * @param {*} key
         * @param {string} doc - A document name, for a view query
         * @param {*} adapter
         * @returns {AdapterCouchbase}
         */
        oneFromView: function(model, cb, view, key, doc, db, isMultiKey) {
            var query = buildViewQuery(view, key, doc, isMultiKey, this.options.stale);
            return this.oneFromQuery(model, cb, query, db);
        },


        // getFromElasticsearch: function(es, cb, model, db) {
        //     db = db || this.options.db;
        //     var Model;
        //
        //     if (model)
        //         Model = this.getModel(model);
        //
        //     if (!(es && es.test))
        //         return cb(new Error('Malformed Elasticsearch Response'));
        //
        //     var hits = es.hits;
        //
        //     var docs = [];
        //     var requests = hits.map(function(val) {
        //         return function(cb) {
        //             var err;
        //             var doc = val._source.doc;
        //
        //             if (!Model && doc && doc.type) {
        //                 Model = this.getModel(doc.type.capitalize(true));
        //             }
        //
        //             if (Model) {
        //                 model = new Model();
        //                 model.set(doc);
        //             } else {
        //                 err = 'Could not get model: ' + (val && val.id) || val;
        //             }
        //
        //             debug('received doc: ' + (val && val.id) || val);
        //             docs.push(model);
        //             cb(err);
        //         };
        //     }.bind(this));
        //
        //     async.parallel(requests, function(err) {
        //         cb(err, docs, es);
        //     });
        // },
    };
};
