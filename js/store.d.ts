export interface SimpleStore<T> {
    getState(): T;
    subscribe(listener: () => void): () => void;
}
export declare class SubStore<P, C> implements SimpleStore<C> {
    protected store: SimpleStore<P>;
    protected smap: (s: P) => C;
    constructor(store: SimpleStore<P>, smap: (s: P) => C);
    getState(): C;
    subscribe(listener: () => void): () => void;
}
