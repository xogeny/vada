import redux = require('redux');

export interface EvalAction<P> extends redux.Action {
	payload: P;
}

export type EvalActionCreator<P> = (p: P) => EvalAction<P>;
export type Evaluator<T,P> = (s: T, payload: P) => T;

export interface ActionInfo<T,P> {
  type: string;
  create: EvalActionCreator<P>;
  evaluate: (s: T, p: P) => T;
}

export function DefineAction<T,P>(type: string, evaluate: Evaluator<T,P>) {
  return {
    type: type,
    create: (p: P) => { return { type: type, payload: p } },
    evaluate: evaluate,
  }
}

export type Evaluators<T> = Array<ActionInfo<T,any>>;

export type EvaluatorMap<T> = { [key: string]: Evaluator<T,any> }

/*
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
*/

export function EvalReducer<T>(state0: T, evals: Evaluators<T>): redux.Reducer<T> {
	return (state: T = state0, action: EvalAction<any>) => {
    evals.forEach((info: ActionInfo<T,any>) => {
      if (info.type===action.type) {
        state = info.evaluate(state, action.payload);
      }
    })
    return state;
	}
}
