## Overview

This repository is currently just a place to keep some useful code
when working on both TypeScript and redux.  I had some code that I was
sharing between projects and I wanted to create a more structured way
of re-using that code.  I hope to organize it a little better in the
future.

## Immutability

This includes some code that allows you to build an immutable store
around a given type.  Look `examples/CounterTest.ts` to see how this
works.

The bottom line is that it defines some typical actions you might
perform on the state and uses the `updeep` library to transform from
one state to another.

## Tests

You can run the tests with just `npm test`
