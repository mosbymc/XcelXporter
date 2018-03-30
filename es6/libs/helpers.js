/**
 * @signature invoke :: Function -> *
 * @description Accepts a single function and invokes it with no arguments. Good for getting an
 * iterator from a generator function.
 * @param {function|generator} fn - The function to be invoked
 * @return {*} - Returns the return value of the invoked function
 */
var invoke = fn => fn();

/**
 * @signature invoker :: ((*... -> a)) -> (*... -> a) -> [*] -> a
 * @description Used as a helper function, invoker takes any function that
 * requires a single function argument and one or more additional parameters
 * and partially applies that function.
 * @note This function is partially applied, not curried.
 * @see apply
 * @param {function} func - A non-curried, non-partially applied function
 * that expects at least two arguments
 * @return {function} - Returns a function that has turned the 'func' param
 * into a partially applied function.
 */
var invoker = func => fn => (...args) => func(fn, ...args);

function cacher(comparer) {
    var items = [];
    function cacheChecker(item) {
        if (undefined === item || items.some(function _checkEquality(it) {
            return comparer(it, item);
        })) {
            return true;
        }
        items[items.length] = item;
        return false;
    }

    cacheChecker.contains = function _contains(item) {
        return items.some(function _checkEquality(it) {
            return comparer(it, item);
        });
    };

    return cacheChecker;
}

/**
 * @signature compose :: (b -> c) -> (a -> b) -> (a -> c)
 * @description Takes one or more functions and feeds the result of each
 * into the following function. The return value of the last function is
 * the return value of this function. Note that the functions are invoked
 * in reverse order of how they are received. Use {@link pipe} if you want
 * the functions invoked in the same order they are received.
 * @note: This function is partially applied, not curried.
 * @see pipe
 * @param {function} fns - Two or more functions that should be composed
 * @return {*} - b
 *
 * @example
 *      var list = 6,
 *          mapFilter = compose(x => x > 5, x => x * 2);
 *
 *      mapFilter(list);    //10
 */
function compose(...fns) {
    fns = fns.reverse();
    return pipe(...fns);
}

/**
 * @signature constant :: a -> () -> a
 * @description A function that creates a constant function. When invoked
 * with any value, the constant function will return a new function. When
 * the new function is invoked, with or without values, it will always return
 * the value that was given to the initial function.
 * @param {*} item - Any value
 * @return {function} - Returns a function, that when invoked, will
 * return the item passed to the constant function as an argument.
 */
function constant(item) {
    return function _constant() {
        return item;
    };
}

/**
 * @signature curry :: (* -> a) -> (* -> a)
 * @description d
 * @note This function is partially applied, not curried.
 * @param {function} fn - a
 * @return {function|*} - b
 *
 * @example
 *      var c = curry((a, b, c, d) => a + b + c + d);
 *      c(1)(2, 3)(4)   //10
 */
function curry(fn) {
    if (1 >= fn.length) return fn;
    return _curry.call(this, fn.length, fn);
}

/**
 * @signature
 * @description d
 * @private
 * @param {number} arity - a
 * @param {function} fn - b
 * @param {Array} received - c
 * @return {*} - d
 */
function _curry(arity, fn, received = []) {
    if (fn.orig && fn.orig !== fn) return _curry.call(this, arity, fn.orig, received);
    function _curry_(...rest) {
        var combined = received.concat(rest);
        if (arity > combined.length) return _curry.call(this, arity, fn, combined);
        return fn.call(this, ...combined);
    }

    _curry_.orig = fn;
    _curry_.toString = () => `${fn.toString()}(${received.join(', ')})`;
    Object.defineProperties(_curry_, { length: { value: arity - received.length } });
    return _curry_;
}

/**
 * @signature defaultPredicate :: * -> Boolean
 * @description A function that always returns 'true'
 * @kind function
 * @function defaultPredicate
 * @return {boolean} - The return value of this function will always be 'true', regardless
 * of any arguments passed to it.
 */
var defaultPredicate = constant(true);

/**
 * @signature delegatesFrom :: {} -> {} -> Boolean
 * @description Accepts any two objects and returns a boolean indicating if the first
 * object is in the prototype chain of the second object.
 * @kind function
 * @function delegatesFrom
 * @param {object} delegate - The delegate object
 * @param {object} delegator - The delegator object
 * @return {boolean} - Returns 'true' if the delegator delegates to the delegate, 'false' otherwise.
 */
var delegatesFrom = curry((delegate, delegator) => delegate.isPrototypeOf(delegator));

/**
 * @signature delegatesTo :: {} -> {} -> Boolean
 * @description Accepts any two objects and returns a boolean indicating if the second
 * object is in the prototype chain of the first object.
 * @kind function
 * @function delegatesTo
 * @param {object} delegator - The delegator object
 * @param {object} delegate - The delegate object
 * @return {boolean} - Returns 'true' if the delegator delegates to the delegate, 'false' otherwise.
 */
var delegatesTo = curry((delegator, delegate) => delegate.isPrototypeOf(delegator));

/**
 * @description - Prototype of a generator; used to detect if a function
 * argument is a generator or a regular function.
 * @typedef {Object}
 */
var generatorProto = Object.getPrototypeOf(function *_generator(){});

/**
 * @signature Identity :: a -> a
 * @description Identity function; takes any item and returns same item when invoked
 * @param {*} item - Any value of any type
 * @return {*} - returns item
 */
var identity = item => item;

/**
 * @signature ifElse :: Function -> ( Function -> ( Function -> (a -> b) ) )
 * @description Takes a predicate function that is applied to the data; If a truthy value
 * is returned from the application, the provided ifFunc argument will be
 * invoked, passing the data as an argument, otherwise the elseFunc is
 * invoked with the data as an argument.
 * @kind function
 * @function ifElse
 * @param {function} predicate - a
 * @param {function} ifFunc - b
 * @param {function} elseFunc - c
 * @param {*} data - d
 * @return {*} - returns the result of invoking the ifFunc or elseFunc
 * on the data
 */
var ifElse = curry((predicate, ifFunc, elseFunc, data) => predicate(data) ? ifFunc(data) : elseFunc(data));

/**
 * @signature isArray :: a -> Boolean
 * @description Accepts any value and returns a boolean indicating if it is an array
 * @param {*} data - Any value
 * @return {boolean} - Returns 'true' if the value is an array, 'false' otherwise
 */
var isArray = data => Array.isArray(data);

/**
 * @signature isString :: * -> Boolean
 * @description Accepts any value and returns a boolean indicating if it is a string
 * @param {string} str - Any value
 * @return {boolean} - Returns 'true' if the value is a string, 'false' otherwise
 */
var isString = str => 'string' === type(str);

/**
 * @description d
 * @enum {string}
 */
var javaScriptTypes = {
    /** function */
    Function: 'function',
    /** object */
    Object: 'object',
    /** boolean */
    Boolean: 'boolean',
    /** number */
    Number: 'number',
    /** symbol */
    Symbol: 'symbol',
    /** string */
    String: 'string',
    /** undefined */
    Undefined: 'undefined'
};

/**
 * @signature noop :: () -> Undefined
 * @description No-op function; used as default function in some cases when argument is optional
 * and consumer does not provide.
 * @returns {undefined} - a
 */
function noop() {}

/**
 * @signature not :: (* -> *) -> [*] -> boolean
 * @description - Takes a function and one or more parameters that the function
 * should be applied to. The result is the inverse coercion of the return
 * value of the function's application to the provided arguments to a
 * boolean.
 * @note This function is partially applied, not curried.
 * @function not
 * @param {function} fn - A function that should be applied to the arguments.
 * @return {*} - The inverted coercion of the return value of the function to
 * a boolean.
 */
var not = invoker((fn, ...args) => !fn(...args));

/**
 * @signature pipe :: [a] -> (b -> c)
 * @description -  Takes a List of functions as arguments and returns
 * a function waiting to be invoked with a single item. Once the returned
 * function is invoked, it will reduce the List of functions over the item,
 * starting with the first function in the List and working through
 * sequentially. Performs a similar functionality to compose, but applies
 * the functions in reverse order to that of compose.
 * @refer {compose}
 * @see compose
 * @param {function} fn - The function to run initially; may be any arity.
 * @param {Array} fns - The remaining functions in the pipeline. Each receives
 * its input from the output of the previous function. Therefore each of these
 * functions must be unary.
 * @return {function} - Returns a function waiting for the item over which
 * to reduce the functions.
 *
 * @example
 *      var p = pipe(x => x % 2, x => x * x);
 *
 *      p(10)  //0
 */
function pipe(fn, ...fns) {
    function _pipe(...args) {
        return fns.reduce(function pipeReduce(item, f) {
            return f(item);
        }, fn(...args));
    }

    _pipe.toString = () => [fn].concat(fns).reduce((str, f, idx) => str + `${f.toString()}${idx < fns.length ? '(' : ''}`, '') + ')'.repeat(fns.length);
    //only curry the pipe if the leading function is not already curried - otherwise, leave as is
    return fn.orig ? _pipe : _curry(fn.length, _pipe);
}

/**
 * @description Contains the list of possible sort directions
 * @enum {number}
 */
var sortDirection = {
    /** ascending */
    ascending: 1,
    /** descending */
    descending: 2
};

/**
 * @signature strictEquals :: * -> * -> Boolean
 * @description Accepts any two values and returns a boolean indicating
 * strict equality between them.
 * @kind function
 * @function strictEquals
 * @param {*} x - Any value
 * @param {*} y - Any value
 * @return {boolean} - Returns 'true' if both arguments are strictly equals,
 * 'false' otherwise
 */
var strictEquals = curry((x, y) => x === y);

/**
 * @signature type :: * -> string
 * @description Accepts any value and returns the string-valued 'typeof' operator use on that argument
 * @param {*} a - Any value
 * @return {string} - Returns the result of using the 'typeof' operator on the provided argument
 */
var type = a => typeof a;

/**
 * @signature unfoldWith :: () -> * -> []
 * @description d
 * @note This function is partially applied, not curried.
 * @param {function} fn - a
 * @return {function} - b
 */
var unfoldWith = curry(function _unfoldWith(fn, seed) {
    return function *_unfoldWithIterator() {
        let { next, value, done } = fn(seed);

        while(!done) {
            yield value;
            ({next, value, done} = fn(next));
        }
    };
});

/**
 * @signature when :: Function -> (Function -> (a -> b))
 * @description Similar to ifElse, but no 'elseFunc' argument. Instead, if the application
 * of the predicate to the data returns truthy, the transform is applied to
 * the data. Otherwise, the data is returned without invoking the transform.
 * @kind function
 * @function when
 * @param {function} predicate - a
 * @param {function} transform - b
 * @param {*} data - c
 * @return {*} - d
 */
var when = curry((predicate, transform, data) => predicate(data) ? transform(data) : data);

/**
 * @signature wrap :: a -> [a]
 * @description Takes any value of any type and returns an array containing
 * the value passed as its only item
 * @param {*} data - Any value
 * @return {Array} - Returns an array of any value, any type
 */
var wrap = data => [data];

export { cacher, compose, constant, defaultPredicate, delegatesFrom, delegatesTo, generatorProto, identity, ifElse, invoke, isArray,
        isString, javaScriptTypes, noop, not, sortDirection, strictEquals, type, unfoldWith, when, wrap };