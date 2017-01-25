# SwiftyCore

Core for the Swifty.js simple API framework.

If you are seeing this you are likely a hacker.


# Layers

### So why do we use Layers?

Layers are the building blocks of a Swifty Application. An example of a Layer might be something like your serializers. When a request exists the controller, we may want to modify the response before sending it to a client. Another example of a Layer might be an auth solution, you could tell your application to route all requests through the Auth Layer, before making it to your application. With Layers, developers are given a powerful way of organizing the flow of requests through their application. Requests bounce from Layer to Layer, making for a clean separation of concerns and easy testability. This modularity has performance gains as well, as modules can be used/reused at the developer's discretion, and it's all done through easy configuration.

Using Layers, you can also get a great testing experience as a developer. Layers can be injected into each other all around your application, whether they are singletons or not, and Swifty handles all of this for the developer.

### How are they managed?

Layers are managed via a Resolver. One of the first things an Application does when it first spawns is create a Resolver. The Resolver then manages files inside the `app` directory, compiling them and turning them into Layers. Once they are Layers and registered with the Resolver, they are then set up by the Resolver. This *setup stage* involves a few things, and can vary from Layer to Layer, but dependency injection is a huge one that almost all Layers utilize. During this *setup stage*, Singleton Layers are also instantiated and loaded into the Application, for distribution throughout the app.

TODO List:
- Managing of injected Layers and their dependencies
- Move Layer States to Layer Instances
- Allow injecting of updated dependencies into Layers already in-use at runtime
- Error handling
- Protect against circular dependencies
- Routing
- Test framework
- CLI to generate project
