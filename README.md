# Box Office Hawk

Compare movies based on box office performance.

## What it is

A simple web app (basically a bunch of vanilla JavaScript stitching together a bunch of not-so-vanilla dependencies) that lets you search for movies and see their daily box office results charted together.

## How it works

Nothing fancy. This app talks to an instance of the [bomojo API][1].

## Running it yourself

The server side of things is a simple [bottle][2] app which you can run via the Procfile using something like [foreman][3] or [honcho][4], i.e.:

The front end is built using webpack. To run it:

```
webpack --watch
```

The following features are configurable via environment variables:

### HOST

Exactly what you'd think. Defaults to localhost.

### PORT

Also what you'd think. Defaults to 8080.

### API_HOST

Where the API is hosted. A live instance is currently running (as of July 22, 2017 anyway) at api.boxofficehawk.com.

### GA_TRACKING_ID

Got a Google Analytics tracking ID? Great! You can supply this and the app will
include the necessary JavaScript snippet.

[1]: https://bitbucket.org/dtao/bomojo
[2]: https://bottlepy.org/docs/dev/
[3]: https://github.com/ddollar/foreman
[4]: https://github.com/nickstenning/honcho
