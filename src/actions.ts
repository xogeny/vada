import { Action } from "redux";

// Grab some types from the redux package so we can properly type actions
// defined here

// FSA-compliant action (from redux-actions.d.ts)
// See: https://github.com/acdlite/flux-standard-action
export interface FluxStandardAction<P, M> extends Action {
    payload?: P;
    error?: boolean;
    meta?: M;
}
