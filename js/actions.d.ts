import { Action } from 'redux';
export interface FluxStandardAction<P, M> extends Action {
    payload?: P;
    error?: boolean;
    meta?: M;
}
