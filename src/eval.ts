import redux = require('redux');

export interface EvalAction<P> extends redux.Action {
	payload: P;
}

export function DefineAction<T,P>(id: string, create: (p: P) => EvalAction<P>, evaluate: (s: T, a: EvalAction<P>) => T) {
  return {
    id: id,
    create: (p: P) => { return { type: id, payload: create(p) } },
    evaluate: evaluate,
  }
}

export type EvaluatorMap<T> = { [key: string]: Evaluator<T,any> }
export type Evaluator<T,P> = (s: T, payload: P) => T;

export function EvalReducer<T>(state0: T, map: EvaluatorMap<T>): redux.Reducer<T> {
	return (state: T = state0, action: EvalAction<any>) => {
		var actions: EvaluatorMap<T> = {};
		var evaluator = map[action.type] as Evaluator<T,any>
		if (!evaluator) {
      return state;
    }
    if (action.payload===undefined) {
      console.warn("A supposed instance of an EvalAction was missing its payload: ", action)
      return state;
    }
		return evaluator(state, action.payload);
	}
}
