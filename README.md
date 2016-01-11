# Viewless, Action Driven Architecture

![VadaLogo](https://raw.githubusercontent.com/xogeny/vada/master/images/logo.png)

## Getting

You can install this module using `npm` with:

```
npm install vada
```

## Introduction

While both migrating existing applications and creating new ones,
incorporating `redux` and `react` into my applications has pushed me
toward an approach that takes a hard line in the separation of view
form application logic.

My main motivation was around making testing as easy as possible.  My
goal was to create applications where the view was completely external
to the application (hence the term "viewless").  Following this
approach, the flow of the application is entirely described via a
`redux` store and actions dispatched against that store (hence the
term "action driven").

Another motivation behind this module, which probably not of much
interest to the larger Javascript development community, was to
provide type constraints around many of these patterns.  So if you use
TypeScript, you can benefit from my efforts to include as many type
constraints as possible.  But the module should still be useful for
ordinary Javascript developers as well.

This repository implements several patterns that I found useful in
trying to achieve these goals.  There are three main pieces of
functionality that this library provides...

## Routing

The first challenge I ran into was how to provide routing *without
involving a view*.  Libraries like
[UI-router](http://angular-ui.github.io/ui-router/) and
[`react-router`](https://github.com/rackt/react-router) are widely
used and well engineered approaches to routing.  However, they both
integrate with the view to provide their functionality.  So I wanted
to create an alternative approach.  There are several viewless routing
tools and I've chosen to build my approach on top of
[crossroads](http://millermedeiros.github.io/crossroads.js/).  But the
contribution of this library is to connect `crossroads` with a set of
actions that can be used to manipulate application state contained in
a `redux` store so that the entire collection of routes associated
with an application can be completely external to the view.

My initial goal with this approach was to migrate code from `angular`
to `react` by externalizing all the routing specific code from any
particular view framework.  But just as important, this view agnostic
approach means that applications can be written independent of a
particular view framework.  This means that the same application code
could be used across desktop, web and mobile applications.  In other
words, by keeping as much logic as possible out of the view, it makes
it easier to reuse application code between web and mobile versions.

It should be noted that if you are working with TypeScript, these
implementations also provide some type constraints that help to ensure
that route parameters can be statically checked at compile time.

## Reactors

In trying to improve application testing, I wanted to see how far I
could push logic out of my view.  My goal was to be able to go back to
doing testing with simple tools like `mocha` instead of having to
build up tests that used tools like PhantomJS, etc. to actually
traverse my UI.  I find the UI design is too fluid to build testing
on.  But the underlying application structure can be relatively
invariant.

The obstacle here is that it is so [common and relatively
convenient](https://medium.com/@learnreact/container-components-c0e67432e005)
to embed logic in a view.  But I think this is actually unwise for
many reasons.  Not only does it mix view and application logic in such
a way that the view must become part of the testing.  It also makes it
difficult to modularize the application.

So I wanted to get the application logic out of my view.  But the
question was...where to put it?  What form should this logic take and
how can I incorporate it into applications?  I was inspired by [this
article](http://jamesknelson.com/join-the-dark-side-of-the-flux-responding-to-actions-with-actors/)
on Actors.  But I found the implementation to be problematic.  So I
came up with a similar approach that I called `reactors`.  The `re`
prefix applies on several levels.  First, this pattern provides a way
to *react* to changes in the application state unilaterally.  Second,
the functionality itself is not associated with the `redux` store, but
rather with the *reducer*.  Finally, I find that it really helps keep
the actions simple and *reusable* while providing a way to extend the
application with additional functionality.

## Operations

I think `redux` is a great way to incorporate state monads into
Javascript applications.  I think @gaeron has done a great job of
keeping the API clean, simple and composable.  What I've tried to do
with the concept of operations is to build on those basic abstractions
the ability to create both actions and reducers in a way that is more
natural to me.  In a typical `redux` application you'll find both a
`reducers.js` file and `actions.js` file.  One defines the identities
of the actions and other provides the effect of the actions.

I find it a bit confusing to keep these two things segregated.  So I
created a reducer implementation that allows me to combine the actions
and effects into what I call an *operation*.  This allows me to define
everything in one place.  I've also incorporated a scheme for
generating unique action names so as to avoid action naming conflicts.
Finally, if you are working with TypeScript, of providing some nice
type constraints for type checking action payloads.

