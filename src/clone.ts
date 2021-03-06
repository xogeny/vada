// This makes a shallow copy of a given object (new object, but
// all values are the same).  It does this in a way that conveys
// the correct type constraint.
//
// NB - This iterates over 
export function clone<T extends {}>(obj: T): T {
    var ret: T = {} as T;
    for(let k in obj) {
        if (obj.hasOwnProperty(k)) {
            ret[k] = obj[k];
        }
    }
    return ret;
}

// This function makes a shallow copy of a given object and then
// applies function to it that has the potential to mutate it.  It
// then returns the mutated version.
export function overlay<T extends {}>(obj: T, f: (t: T) => void):T {
    // Make a copy of obj
    let c = clone(obj);

    // Call a function that may (or may not) mutate it
    f(c);

    // If we find that a key has been changed, we return the clone.
    // This means we only return a different value if we absolutely
    // need to.
    for(let k in obj) {
        if (obj.hasOwnProperty(k)) {
            if (c[k]!==obj[k]) {
                return c;
            }
        }
    }

    // If no changes were found, return the original object
    return obj;
}

// This function avoids cloning unless the condition is met
export function overlayIf<T extends {}>(obj: T, p: boolean, f: (t: T) => void): T {
    if (!p) return obj;
    return overlay(obj, f);
}
