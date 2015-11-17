import React = require('react');
import { SimpleStore } from './state';
export declare function bindClass<P, S>(store: SimpleStore<S>, elem: React.ComponentClass<P>, pmap: (s: S) => P): React.ClassicComponentClass<{}>;
