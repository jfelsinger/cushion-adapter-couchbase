# Cushion Adapter Couchbase
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
}
```
