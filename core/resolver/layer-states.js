const LAYER_STATES = {
  RAW: { statusCode: 0, description: 'Layer has been loaded by the file loaded, and has not yet been recognized by the Resolver.' },
  DEFINED: { statusCode: 1, description: 'Layer has run its setup method, where it may have discovered more about what it depends on.' },
  MAPPED: { statusCode: 2, description: 'Layer has been loaded by the resolver. It is awaiting injection of depenedencies by the Resolver.' },
  INJECTED: { statusCode: 3, description: 'Layer has had its depenedencies injected.'},
  READY: { statusCode: 4, description: 'Layer has had its depenedencies injected and is now ready for use.'}
};

export { LAYER_STATES }
