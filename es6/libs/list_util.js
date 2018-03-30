import { generatorProto, ifElse, isArray, javaScriptTypes, strictEquals, type, delegatesFrom, invoke, not, unfoldWith, when } from './helpers';

/** @module list./list_iterators */

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
 * @param {Array|generator|list..list_core} xs - a
 * @param {function} [predicate] - b
 * @return {boolean} - c
 */
function all(xs, predicate) {
    xs = asArray(xs);
    return strictEquals(javaScriptTypes.Function, type(predicate)) && toArray(xs).every(predicate);
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list..list_core} xs - a
 * @param {function} [predicate] - b
 * @return {boolean} - c
 */
function any(xs, predicate) {
    return strictEquals(javaScriptTypes.Function, type(predicate)) ? asArray(xs).some(predicate) : 0 < asArray(xs).length;
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list..list_core} xs - a
 * @param {*} val - b
 * @param {function} comparer - c
 * @return {boolean} - d
 */
function binarySearch(xs, val, comparer) {
    return binarySearchRec(xs, 0, xs.length - 1, val, comparer);
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list..list_core} xs - a
 * @param {number} left - b
 * @param {number} right - c
 * @param {*} val - d
 * @param {function} comparer - e
 * @return {boolean} - f
 */
function binarySearchRec(xs, left, right, val, comparer) {
    if (left > right) return false;
    var mid = Math.floor((left + right) / 2),
        res = comparer(val, xs[mid]);
    if (0 === res) return true;
    if (0 < res) return binarySearchRec(xs, mid + 1, right, val, comparer);
    return binarySearchRec(xs, left, mid - 1, val, comparer);
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list..list_core} xs - a
 * @param {*} val - b
 * @param {function} [comparer] - c
 * @return {*} - d
 */
function contains(xs, val, comparer) {
    //TODO: see if there is any real performance increase by just using .includes when a comparer hasn't been passed
    return strictEquals(javaScriptTypes.Undefined, type(comparer)) ? asArray(xs).includes(val) : asArray(xs).some((x) => comparer(x, val));
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list..list_core} xs - a
 * @param {function} [predicate] - b
 * @return {Number} - c
 */
function count(xs, predicate) {
    return strictEquals(javaScriptTypes.Undefined, type(predicate)) ?
        asArray(xs).length : asArray(xs).filter(predicate).length;
}

/**
 * @signature
 * @description d
 * @param {list..list_core} xs - a
 * @param {list..list_core} ys - b
 * @param {function} [comparer] - c
 * @return {boolean} - d
 */
function equals(xs, ys, comparer = strictEquals) {
    var x_s = xs.data,
        y_s = ys.data;

    return x_s.length === y_s.length &&
        x_s.every(function _checkEquality(x, idx) {
            return comparer(x, y_s[idx]);
        });
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list..list_core} xs - a
 * @param {function} [comparer] - b
 * @return {Number} - c
 */
function findIndex(xs, comparer = strictEquals) {
    return asArray(xs).findIndex(comparer);
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list..list_core} xs - a
 * @param {function} [comparer] - b
 * @return {Number} - c
 */
function findLastIndex(xs, comparer = strictEquals) {
    return asArray(xs).length - asArray(xs).reverse().findIndex(comparer);
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list..list_core} xs - a
 * @param {function} [predicate] - b
 * @return {*} - c
 */
function first(xs, predicate) {
    return strictEquals(javaScriptTypes.Function, type(predicate)) ? asArray(xs).find(predicate) : asArray(xs)[0];
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list..list_core} xs - a
 * @param {function} fn - b
 * @param {*} [initial] - c
 * @return {*} - d
 */
function foldLeft(xs, fn, initial = 0) {
    return asArray(xs).reduce(fn, initial);
}

/**
 * @signature
 * @description d
 * @param {Array|list..list_core} arr - a
 * @param {function} op - b
 * @param {*} acc - c
 * @return {*} - d
 */
function foldRight(arr, op, acc) {
    var list = asArray(arr),
        len = list.length,
        res = acc || list[--len];
    while (0 < len) {
        res = op(list[--len], res, len, list);
    }
    return res;
}

/**
 * @signature
 * @description d
 * @param {Array|generator|list..list_core} xs - a
 * @param {function} [predicate] - b
 * @return {*} - c
 */
function last(xs, predicate) {
    if (strictEquals(javaScriptTypes.Function, type(predicate)))
        return asArray(xs).filter(predicate).slice(-1)[0];
    return asArray(xs).slice(-1)[0];
}

/**
 * @signature
 * @description s
 * @param {Array|generator|list..list_core} xs - a
 * @param {function} fn - b
 * @param {*} initial - c
 * @return {*} - d
 */
function reduceRight(xs, fn, initial) {
    return null == initial ? asArray(xs).reduceRight(fn) : asArray(xs).reduceRight(fn, initial);
}

var unfold = unfoldWith;

export { all, any, binarySearch, contains, count, equals, findIndex, findLastIndex, first, foldLeft, foldRight,
    last, reduceRight, unfold };