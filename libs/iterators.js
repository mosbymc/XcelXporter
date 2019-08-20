import { cacher, compose, delegatesFrom, generatorProto, ifElse, invoke, isArray, not, sortDirection, strictEquals, unfoldWith, when } from './helpers';
import { sortData } from './sort_util';
import { nestLists, groupData } from './group_util';

/** @module iterators */

var asArray = when(not(isArray), Array.from);
var arrayFromGenerator = val => Array.from(invoke(val));
var toArray = ifElse(delegatesFrom(generatorProto), arrayFromGenerator, asArray);

//var getIterator = iterable => delegatesFrom(generatorProto, iterable) ? invoke(iterable) : iterable;

/*function *_iterate(iterable, fn) {
    for (let item of getIterator(iterable)) yield fn(item);
}*/

/**
 * @signature
 * @description d
 * @param {list.list_core} xs - a
 * @param {list.list_core} ys - b
 * @return {generator} - c
 */
function apply(xs, ys) {
    return function *_applyIterator() {
        for (let y of ys) {
            for (let x of xs) yield y(x);
        }
    };
}

/**
 * @signature
 * @description Performs the chain operation for the list data structure. Upon invocation,
 * a generator is returned that knows how to iterate a list and return the appropriate value(s).
 * Like the chain operation for the other data structures, this is a 'safe' chain, meaning that
 * if the provided function argument returns a list for an item, then the item is pulled from the
 * list and yielded out. However, if a non-list value is returned, then that value will be yielded
 * out 'as is'. There is no way to perform a chain operation and get back anything other than a list.
 * @param {*} xs - a
 * @param {function} fn - b
 * @return {generator} - c
 */
function chain(xs, fn) {
    return function *_chainIterator() {
        var res;

        for (let x of xs) {
            res = fn(x);
            //We have to travel up the prototype chain twice here because we could be dealing with an
            //ordered list, in which case, we need to check if list_core is in the prototype chain,
            //not list or ordered_list
            if (Object.getPrototypeOf(Object.getPrototypeOf(xs)).isPrototypeOf(res)) {
                //If the result is a list, then we need to unwrap the values contained within and yield
                //each one of them individually...
                for (let item of res) yield item;
            }
            //...otherwise the value is not a list and we just yield it as is.
            else yield res;
        }
    };
}

/**
 * @signature:
 * @description description
 * @param {Array|generator|list.list_core} xs - x
 * @param {Array|generator|list.list_core} ys - y
 * @return {generator} - a
 */
function concat(xs, ys) {
    return function *concatIterator() {
        for (let x of xs) yield x;
        for (let y of ys) yield y;
    };
}

/**
 * @signature
 * @description d
 * @param {list.list_core|list.list|list.ordered_list|Array} xs - A list
 * @param {Array} yss - An array of one or more lists
 * @return {generator} Returns a generator to be used as an
 * iterator when the list is evaluated.
 */
function concatAll(xs, yss) {
    return function *_concatAllIterator() {
        for (let x of xs) yield x;
        for (let ys of yss)
            for (let y of toArray(ys)) yield y;
    };
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core} xs - a
 * @param {function} fn - b
 * @return {generator} - c
 */
function contramap(xs, fn) {
    return function *contramapIterator() {
        for (let x of xs) yield compose(fn, x);
    };
}

/**
 * @signature
 * @description d
 * @param {number} idx - a
 * @param {number} start - b
 * @param {number} end - c
 * @param {list.list_core|list.list|list.ordered_list} xs - d
 * @returns {generator} - e
 */
function copyWithin(idx, start, end, xs) {
    return function *copyWithinIterator() {
        for (let x of asArray(xs).copyWithin(idx, start, end)) yield x;
    };
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core} xs - a
 * @param {function} f - b
 * @param {function} g - c
 * @return {generator} d
 */
function dimap(xs, f, g) {
    return function *dimapIterator() {
        for (let x of xs) yield compose(f, x, g);
    };
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core} xs - a
 * @param {function} [comparer] - b
 * @return {generator} - c
 */
function distinct(xs, comparer = strictEquals) {
    return function *distinctIterator() {
        let cached = cacher(comparer);
        for (let x of xs) {
            if (!cached(x)) yield x;
        }
    };
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core|list.list|list.ordered_list} xs - x
 * @param {Array|generator|list.list_core|list.list|list.ordered_list} ys - y
 * @param {function} [comparer] - z
 * @return {generator} - a
 */
function except(xs, ys, comparer = strictEquals) {
    return function *exceptIterator() {
        ys = toArray(ys);
        for (let x of xs) {
            if (!ys.some(y => comparer(x, y))) yield x;
        }
    };
}

/**
 * @signature
 * @description d
 * @param {*} val - a
 * @param {number} start - b
 * @param {number} end - c
 * @param {Array|list.list_core|list.list|list.ordered_list} xs - d
 * @return {generator} - e
 */
function fill(val, start, end, xs) {
    return function *fillIterator() {
        for (let x of asArray(xs).fill(val, start, end)) yield x;
    };
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core} xs - a
 * @param {function} predicate - b
 * @return {generator} - c
 */
function filter(xs, predicate) {
    return function *filterIterator() {
        for (let x of xs) {
            if (false !== predicate(x)) yield x;
        }
    };
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core} xs - a
 * @param {Array} groupObject - b
 * @param {function} queryableConstructor - c
 * @return {generator} - d
 */
function groupBy(xs, groupObject, queryableConstructor) {
    return function *groupByIterator() {
        //gather all data from the iterable before grouping
        let groupedData = nestLists(groupData(asArray(xs), groupObject), 0, null, queryableConstructor);
        for (let x of groupedData) yield x;
    };
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core} xs - a
 * @param {Array|generator|list.list_core} ys - b
 * @param {function} xSelector - c
 * @param {function} ySelector - d
 * @param {function} projector - e
 * @param {function} listFactory - f
 * @param {function} [comparer] - g
 * @return {generator} - h
 */
function groupJoin(xs, ys, xSelector, ySelector, projector, listFactory, comparer = strictEquals) {
    return function *groupJoinIterator() {
        var groupObj = [{ keySelector: ySelector, comparer: comparer, direction: sortDirection.ascending }];
        var groupedY = nestLists(groupData(asArray(ys), groupObj), 0, null, listFactory);

        for (let x of xs) {
            let grp;
            for (let yGroup of groupedY) {
                if (comparer(xSelector(x), yGroup.key)) {
                    grp = yGroup;
                    break;
                }
            }

            yield projector(x, grp || listFactory([]));
        }
    };
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core} xs - a
 * @param {Array|generator|list.list_core} ys - b
 * @param {function} [comparer] - c
 * @return {generator} - d
 */
function intersect(xs, ys, comparer = strictEquals) {
    return function *intersectIterator() {
        ys = toArray(ys);
        for (let x of xs) {
            if (ys.some(it => comparer(x, it))) yield x;
        }
    };
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core} xs - a
 * @param {*} val - b
 * @return {generator} - c
 */
function intersperse(xs, val) {
    return function *intersperseIterator() {
        var it = xs[Symbol.iterator](),
            next = it.next();

        while (!next.done) {
            yield next.value;
            next = it.next();
            if (!next.done) yield val;
        }
    };
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core} xs - a
 * @param {Array|generator|list.list_core} ys - b
 * @param {function} xSelector - c
 * @param {function} ySelector - d
 * @param {function} projector - e
 * @param {function} [comparer] - f
 * @return {generator} - g
 */
function join(xs, ys, xSelector, ySelector, projector, comparer = strictEquals) {
    return function *joinIterator() {
        ys = toArray(ys);
        for (let x of xs) {
            for (let y of ys) {
                if (comparer(xSelector(x), ySelector(y))) yield projector(x, y);
            }
        }
    };
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core} xs - a
 * @param {function} fn - b
 * @return {generator} - c
 */
function map(xs, fn) {
    return function *mapIterator() {
        for (let x of xs) yield fn(x);
    };
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core} xs - a
 * @return {generator} b
 */
function pop(xs) {
    return function *_popIterator() {
        let it = xs[Symbol.iterator](),
            next = it.next(),
            last = next.value;

        while (!(next = it.next()).done) {
            yield last;
            last = next.value;
        }
    };
}

/**
 * @signature
 * @description -
 * @param {Array|generator|list.list_core} xs - some stuff
 * @param {Array|generator|list.list_core} ys - some other stuff
 * @return {generator} - some other other stuff
 */
function prepend(xs, ys) {
    return concat(ys, xs);
}

/**
 * @signature
 * @description d
 * @param {list.list|list.ordered_list|Array|generator} xs - A list
 * @param {Array} yss - An array of one or more lists
 * @return {generator} Returns a generator
 */
function prependAll(xs, yss) {
    return concatAll(toArray(yss[0]), yss.slice(1).concat([xs]));
}

/**
 * @signature
 * @description d
 * @param {*} item - a
 * @param {number} count - b
 * @return {generator} - c
 */
function repeat(item, count) {
    return function *repeatIterator() {
        for (let i = 0; i < count; ++i) yield item;
    };
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core} xs - a
 * @return {generator} - b
 */
function reverse(xs) {
    return function *reverseIterator() {
        for (let x of asArray(xs).reverse()) yield x;
    };
}

/**
 * @signature
 * @description d
 * @param {list.list_core} xs - a
 * @param {number} idx - b
 * @param {*} val - c
 * @return {generator} d
 */
function set(xs, idx, val) {
    return function *_setIterator() {
        let count = 0;
        for (let item of xs) {
            if (idx === count) yield val;
            else yield item;
            ++count;
        }

        while (count <= idx) {
            if (count !== idx) yield undefined;
            else yield val;
            ++count;
        }
    };
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core} xs - a
 * @param {function} predicate - b
 * @return {generator} - c
 */
function skipWhile(xs, predicate) {
    return function *skipWhileIterator() {
        var hasFailed = false;
        for (let x of xs) {
            if (hasFailed || (!hasFailed && !predicate(x))) {
                hasFailed = true;
                yield x;
            }
        }
    };
}

/**
 * @signature
 * @description d
 * @param {Array|list.list_core} xs - Any iterable object that may be treated as an array
 * @param {number} [start] - A number representing the index of the array to being the slice
 * @param {number} [end] - A number representing the index of the array to end the slice
 * @return {generator} Returns a generator function that can be used to iterate the values
 * of the new sliced array one at a time.
 */
function slice(xs, start, end) {
    return function *_sliceIterator() {
        for (let item of asArray(xs).slice(start, end)) yield item;
    };
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core} xs - a
 * @param {Array} orderObject - b
 * @return {generator} - d
 */
function sortBy(xs, orderObject) {
    return function *orderByIterator() {
        //gather all data from the xs before sorting
        for (let x of sortData(asArray(xs), orderObject)) yield x;
    };
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core} xs - a
 * @param {function} predicate - b
 * @return {generator} - c
 */
function takeWhile(xs, predicate) {
    return function *takeWhileIterator() {
        for (let x of xs) {
            if (predicate(x)) yield x;
            else break;
        }
    };
}

var unfold = unfoldWith;

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core} xs - a
 * @param {Array|generator|list.list_core} ys - b
 * @param {function} comparer - c
 * @return {generator} - d
 */
function union(xs, ys, comparer = strictEquals) {
    return function *unionIterator() {
        var isInCache = cacher(comparer);
        for (let x of xs) {
            if (!isInCache(x)) yield x;
        }

        for (let y of toArray(ys)) {
            if (!isInCache(y)) yield y;
        }
    };
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list.list_core} xs - a
 * @param {Array|generator|list.list_core} ys - b
 * @param {function} selector - c
 * @return {generator} - d
 */
function zip(xs, ys, selector) {
    return function *zipIterator() {
        var idx = 0;
        var yArr = toArray(ys);

        for (let x of xs) {
            if (idx >= yArr.length || !yArr.length) break;
            yield selector(x, yArr[idx]);
            ++idx;
        }
    };
}

export { apply, chain, concat, concatAll, contramap, copyWithin, dimap, distinct, except, fill, filter, groupBy,
    groupJoin, intersect, intersperse, join, map, pop, prepend, prependAll, repeat, reverse, set,
    skipWhile, slice, sortBy, takeWhile, unfold, union, zip };