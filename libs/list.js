import * as iterators from './iterators';
import * as list_util from './list_util';
import { constant, defaultPredicate, delegatesFrom, delegatesTo, generatorProto, identity, ifElse, invoke, isArray, isString, noop, not, sortDirection, when, wrap } from './helpers';
import { createSortObject } from './sort_util';

/** @module list */

var listProxyHandler = {
        get(target, prop) {
            if (Reflect.has(target, prop)) return target[prop];
            if ('symbol' !== typeof prop) {
                let num = Number(prop);
                if (Number.isInteger(num)) return target.toArray()[num];
            }
        }
    },
    bitMaskMaxListValue = createBitMask(true, true, false);

/**
 * @description: Object that contains the core functionality of a List; both the list and ordered_list
 * objects delegate to this object for all functionality besides orderBy/orderByDescending
 * and thenBy/thenByDescending respectively. Getter/setters are present for state-manipulation
 * at the consumer-object level, as well as to provide default values for a consumer-level
 * object at creation if not specified.
 * @typedef {Object}
 * @property {function} extract - Returns the underlying data of the list as an array; used as a getter, not a function
 * @property {function} apply - Applies the functions in one iterable to the data in the current list and returns a new list
 * @property {function} append - Accepts one iterable and returns a new list with the contents appended to the current lists's contents
 * @property {function} appendAll - Behaves like list#append but accepts one or more iterables
 * @property {function} bimap
 * @property {function} chain - Accepts a {@link list} returning function and applies it to each item in the list, removing the resulting nested lists
 * @property {function} concat - Accepts one iterable and returns a new list with the contents appended to the current list's contents
 * @property {function} concatAll - Behaves like list#concat but accepts one or more iterables
 * @property {function} copyWithin
 * @property {function} distinct - Accepts an optional function and returns a new list with distinct elements; defaults to strict equality if no function is provided
 * @property {function} except - Accepts an iterable and returns a new list containing the disjunction between the two
 * @property {function} fill - Accepts a single argument and returns a new list with all values in the current list replaced by the value
 * @property {function} filter - Accepts a boolean returning function and returns a new list with all 'false' elements removed
 * @property {function} groupBy
 * @property {function} groupByDescending
 * @property {function} groupJoin
 * @property {function} intersect - Accepts an iterable and returns a new list containing only the conjunction between the two
 * @property {function} intersperse
 * @property {function} listJoin
 * @property {function} map - Applies the supplied function argument to each element in the list and returns a new list with the new values
 * @property {function} join
 * @property {function} prepend - Accepts one iterable and returns a new list with the contents prepended to the current lists's contents
 * @property {function} prependAll - Behaves like list#prepend but accepts one or more iterables
 * @property {function} reverse - Returns a new list with the contents in reverse order
 * @property {function} sequence
 * @property {function} skip - Returns a new list with the first 'n' items removed; 'n' defaults to zero
 * @property {function} skipWhile - Accepts a boolean returning function and returns a new list with all elements removed up until the first element that returns 'true'
 * @property {function} take - Returns a new list with the last 'n' items removed; 'n' defaults to zero
 * @property {function} takeWhile - Accepts a boolean returning function and returns a new list with all elements up until the first element that returns 'false'
 * @property {function} union - Accepts an iterable and a comparer function and returns a new list that contains all distinct elements between the two
 * @property {function} zip
 * @property {function} all - Accepts a boolean-returning function and returns a boolean after applying the function to all elements that indicates if all the elements returned 'true'
 * @property {function} any - Accepts a boolean-returning function and returns a boolean after applying the function to all elements that indicates if any of the elements returned 'true'
 * @property {function} count - Returns an integer is equal to the number of elements in the list
 * @property {function} equals
 * @property {function} data - Returns the underlying data in the list in array form
 * @property {function} extract - Returns the underlying data in the list in array form
 * @property {function} findIndex
 * @property {function} findLastIndex
 * @property {function} first - Accepts a boolean-returning function and returns the first element in the list where 'true' is returned from the function
 * @property {function} foldl
 * @property {function} foldr
 * @property {function} isEmpty - Returns a boolean that indicates if the list has at least one element
 * @property {function} last - Accepts a boolean-returning function and returns the last element in the list where 'true' is returned from the function
 * @property {function} reduceRight
 * @property {function} toArray - Returns the elements of the list in array form
 * @property {function} toEvaluatedList - Returns a new list after evaluating the underlying function pipeline; This should only be used in cases where the list may need to be enumerated more than once
 * @property {function} toMap - Returns the elements of the list in map form - the indices of the list act as the map's keys
 * @property {function} toSet - Returns the elements of the list in set form
 * @property {function} toString - Returns a string representation of the list
 * @property {function} valueOf
 * @property {function} factory - Reference to the List factory function
 * @property {function} of - Creates a new list of whatever element is provided
 * @property {function} sequence
 * @property {function} traverse
 * @property {Symbol.iterator} - The list's iterator; can be used in for-of, for-in loops
 * @kind {Object}
 * @memberOf list
 * @namespace list_core
 * @description This is the delegate object that specifies the behavior of the list functor. Most
 * operations that may be performed on an list functor 'instance' delegate to this object. List
 * functor 'instances' are created by the {@link List} factory function via Object.create,
 * during which the underlying value is placed directly on the newly created object. No other
 * properties exist directly on an list functor delegator object beyond the ._value property.
 * All behavior delegates to this object, or higher up the prototype chain.
 */
var list_core = {
    //Using getters for these properties because there's a chance the setting and/or getting
    //functionality could change; this will allow for a consistent interface while the
    //logic beneath changes
    /**
     * @signature () -> *
     * @description Returns the underlying value of a list delegator. This
     * getter is not expected to be used directly by consumers - it is meant as an internal
     * access only. To manipulate the underlying value of a list delegator,
     * see {@link list.list_core#map} and {@link list.list_core#bimap}.
     * To retrieve the underlying value of an identity_functor delegator, see {@link list.list_core#get}
     * and {@link list.list_core#valueOf}.
     * @memberOf list.list_core
     * @instance
     * @protected
     * @function value
     * @return {*} Returns the underlying value of the delegator. May be any value.
     */
    get value() {
        return this._value;
    },
    get extract() {
        return this.data;
    },
    /**
     * @signature list.list_core -> list.list_core
     * @description Applies a function contained in another functor to the source
     * of this List object instance's underlying source. A new List object instance
     * is returned.
     * @memberOf list.list_core
     * @instance
     * @function apply
     * @this list.list_core
     * @param {list.list_core} l - a
     * @return {*} - b
     *
     * @example
     * List([1, 2, 3, 4, 5])
     *  .apply(List([x => x * x, x => x / 2, x => x * 5]))     => List([1, 1/2, 5, 4, 1, 10, 9, 3/2, 15, 16, 2, 20, 25, 5/2, 25])
     */
    apply: function _apply(l) {
        return createList(this, _iteratorWrapper(iterators.apply(this, l)));
    },

    /**
     * @signature () -> list.list_core
     * @description Chains a list-returning function over each individual item in
     * the list and returns a new list without the nesting that would normally occur
     * if map was invoked instead.
     * @memberOf list.list_core
     * @instance
     * @function chain
     * @this list.list_core
     * @param {function} fn - a
     * @return {list} - b
     *
     * @example
     * List([1, 2, 3, 4, 5]).chain(x => List.of(x * x))     => List([1, 4, 9, 16, 25])
     */
    chain: function _chain(fn) {
        return createList(this, _iteratorWrapper(iterators.chain(this, fn)));
    },

    /**
     * @signature [...iterable] -> list.list_core
     * @description Concatenates two lists by appending the the provided List to the
     * current List. This function is a deferred execution call that returns
     * a new List containing the values of both Lists.
     * @memberOf list.list_core
     * @instance
     * @function concat
     * @this list.list_core
     * @param {Array | *} ys - a
     * @return {list} - b
     *
     * @example
     * List([1, 2, 3, 4, 5]).concat(List([6, 7, 8, 9, 10])      => List([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
     */
    concat: function _concat(ys) {
        return createList(this, _iteratorWrapper(iterators.concat(this, List.of(ys))));
    },

    /**
     * @signature
     * @description Functions similar to {@link List#concat}, except it one or more
     * Lists may be provided as arguments and each one will be appended to the current
     * List's data in the ordered they are provided. List {@link List#concat}, this
     * function is a deferred execution call that returns a new List.
     * @memberOf list.list_core
     * @instance
     * @function concatAll
     * @this list
     * @param {list|ordered_list} ys - One or more lists to concatenate with this list
     * @return {list} Returns a new list
     *
     * @example
     * List([1, 2, 3, 4, 5])
     *  .concatAll([6, ..., 10], List([11, ..., 15]), [16, ..., 20])    => List([1, 2, 3, 4, ... 18, 19, 20])
     */
    concatAll: function _concatAll(...ys) {
        return createList(this, _iteratorWrapper(iterators.concatAll(this, ys.map(y => List.of(y)))));
    },

    /**
     * @description This function only works if using the List as a contravariant. It Accepts
     * a single function that is used to contramap over the current List's source functions.
     * The provided function is composed with each function in the current List to create a new
     * function, which is returned to create a new List object. Essentially, contramap is mapping
     * over the output of the current List's function once it is applied to a data-containing List.
     * This function property is a deferred execution function.
     * the provided function argument
     * @param {function} fn - a
     * @return {Proxy.<list.list_core>|list.list_core|list.list|list.ordered_list} b
     *
     * @example
     * List([1, 2, 3, 4, 5])
     *  .apply(List([x => x * x, x => x + 10])
     *  .contramap(x => x + 3))     => List([4, 7, 12, 19, 28, 14, 15, 16, 17, 18])
     */
    contramap: function _contramap(fn) {
        return createList(this, _iteratorWrapper(iterators.contramap(this, fn)));
    },

    /**
     * @signature
     * @description Shallow copies part of the List to another segment within the list and returns a new List
     * with the updated values.
     * @memberOf list.list_core
     * @instance
     * @function copyWithin
     * @this list
     * @external Array
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin}
     * @param {number} index - a
     * @param {number} start - b
     * @param {number} end - c
     * @return {list} - d
     */
    copyWithin: function _copyWithin(index, start, end) {
        return createList(this, _iteratorWrapper(iterators.copyWithin(index, start, end, this)));
    },

    /**
     * @description d
     * @param {function} f - a
     * @param {function} g - b
     * @return {Proxy.<list.list_core>|list.list_core|list.list|list.ordered_list} c
     */
    dimap: function _dimap(f, g) {
        return createList(this, _iteratorWrapper(iterators.dimap(this, f, g)));
    },

    /**
     * @signature (a -> boolean) -> List<b>
     * @description Accepts a single comparer function as an argument that determines if
     * any two items of the List are equal. Only one of each distinct item is retained. If
     * no argument is provided, strict equality between items is defaulted to.
     * @memberOf list.list_core
     * @instance
     * @function distinct
     * @this list.list_core
     * @param {function} comparer - a
     * @return {list} - b
     *
     * @example
     *  List([1, 1, 2, 2, 3, 3])
     *      .distinct((x, y) => x === y)    => List([1. 2. 3])
     */
    distinct: function _distinct(comparer) {
        return createList(this, _iteratorWrapper(iterators.distinct(this, comparer)));
    },

    /**
     * @signature
     * @description Produces a List that contains the objectSet difference between the queryable object
     * and the List that is passed as a function argument. A comparer function may be
     * provided to the function that determines the equality/inequality of the items in
     * each List; if left undefined, the function will use a default equality comparer.
     * This function is a deferred execution call that returns a new queryable
     * object delegator instance that contains all the requisite information on
     * how to perform the operation.
     * equality comparer.
     * @memberOf list.list_core
     * @instance
     * @function except
     * @this list
     * @param {Array|generator} xs - a
     * @param {function} [comparer] - b
     * @return {list} - c
     *
     * @example
     *  List([1. 2, 3, 4, 5, 6, 7, 8, 9, 10])
     *      .except([2, 4, 6, 8, 10])   => L:st([1, 3, 5, 7, 9])
     */
    except: function _except(xs, comparer) {
        return createList(this, _iteratorWrapper(iterators.except(this, xs, comparer)));
    },

    /**
     * @signature
     * @description Fills the List with any single, static value. An optional starting and ending
     * indices may be provided to indicating at what index of the List to start filling it with the
     * provided value and what index to stop. If no starting index is provided, the value will begin
     * insertion at the start of the list; if no ending index is provided, the value will continue to
     * be inserted from the start index to the last element in the list.
     * @memberOf list.list_core
     * @instance
     * @function fill
     * @this list
     * @external Array
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill}
     * @param {number} value - a
     * @param {number} start - b
     * @param {number} end - c
     * @return {list} - d
     */
    fill: function _fill(value, start, end) {
        return createList(this, _iteratorWrapper(iterators.fill(value, start, end, this)));
    },

    /**
     * @signature
     * @description Accepts a predicate function that is used to filter out all elements of
     * the List that don't 'pass' the predicate. The function is called individually on each item
     * of the List and only the items that get a 'true' response back from the predicate function
     * are retained in the List.
     * @memberOf list.list_core
     * @instance
     * @function filter
     * @this list.list_core
     * @param {function} predicate - a
     * @return {list.list_core} - b
     *
     * @example
     *  List([1, 2, 3, 4, 5]).filter(x => 3 < x)    => List([4, 5])
     */
    filter: function _filter(predicate) {
        return createList(this, _iteratorWrapper(iterators.filter(this, predicate)));
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function groupBy
     * @this list.list_core
     * @param {function} keySelector - a
     * @param {function} [comparer] - b
     * @return {list.list_core} - c
     *
     * @example
     * List([1, 2, 3, 3, 2, 2, 3, 1, 4])
     *  .groupBy(x => x, (x, y) => x === y)  => List(List(1, 1), List(2, 2, 2), List(3, 3, 3), List(4))
     */
    groupBy: function _groupBy(keySelector, comparer) {
        return createList(this, _iteratorWrapper(iterators.groupBy(this, [createSortObject(keySelector, comparer, sortDirection.ascending)], createGroupedListDelegate)));
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function groupByDescending
     * @this list.list_core
     * @param {function} keySelector - a
     * @param {function} [comparer] - b
     * @return {list.list_core} - c
     *
     * @example
     * List([1, 2, 3, 3, 2, 2, 3, 1, 4])
     *  .groupByDescending(x => x, (x, y) => x === y)  => List(List(4), List(3, 3, 3), List(2, 2, 2), List(1, 1))
     */
    groupByDescending: function _groupByDescending(keySelector, comparer) {
        return createList(this, _iteratorWrapper(iterators.groupBy(this, [createSortObject(keySelector, comparer, sortDirection.descending)], createGroupedListDelegate)));
    },

    /**
     * @signature
     * @description Correlates the items in two lists based on the equality of a key and groups
     * all items that share the same key. A comparer function may be provided to
     * the function that determines the equality/inequality of the items in each
     * List; if left undefined, the function will use a default equality comparer.
     * This function is a deferred execution call that returns a new queryable
     * object delegator instance that contains all the requisite information on
     * how to perform the operation.
     * @memberOf list.list_core
     * @instance
     * @function groupJoin
     * @this list.list_core
     * @param {list.list_core | Array} ys - a
     * @param {function} xSelector - b
     * @param {function} ySelector - c
     * @param {function} projector - d
     * @param {function} [comparer] - e
     * @return {list.list_core} - f
     */
    groupJoin: function _groupJoin(ys, xSelector, ySelector, projector, comparer) {
        return createList(this, _iteratorWrapper(iterators.groupJoin(this, ys, xSelector, ySelector, projector, createGroupedListDelegate, comparer)));
    },

    head: function _head() {
        return this.take(1);
    },

    /**
     * @signature
     * @description Produces the objectSet intersection of the List object's value and the List
     * that is passed as a function argument. A comparer function may be
     * provided to the function that determines the equality/inequality of the items in
     * each List; if left undefined, the function will use a default equality comparer.
     * This function is a deferred execution call that returns a new queryable
     * object delegator instance that contains all the requisite information on
     * how to perform the operation.
     * @memberOf list.list_core
     * @instance
     * @function intersect
     * @this list.list_core
     * @param {Array|generator} xs - a
     * @param {function} [comparer] - b
     * @return {list.list_core} - c
     *
     * @example
     * List([1, 2, 3, 4, 5, 6])
     *  .intersect(List([4, 5, 6, 7, 8, 9, 10], (x, y) => x === y)      => List(4, 5, 6)
     */
    intersect: function _intersect(xs, comparer) {
        return createList(this, _iteratorWrapper(iterators.intersect(this, xs, comparer)));
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function intersperse
     * @this list.list_core
     * @param {*} val - a
     * @return {list.list_core} - b
     */
    intersperse: function _intersperse(val) {
        return createList(this, _iteratorWrapper(iterators.intersperse(this, val)));
    },

    /**
     * @signature
     * @description Correlates the items in two lists based on the equality of items in each
     * List. A comparer function may be provided to the function that determines
     * the equality/inequality of the items in each List; if left undefined, the
     * function will use a default equality comparer. This function is a deferred
     * execution call that returns a new queryable object delegator instance that
     * contains all the requisite information on how to perform the operation.
     * @memberOf list.list_core
     * @instance
     * @function listJoin
     * @this list.list_core
     * @param {Array|List} ys - a
     * @param {function} xSelector - b
     * @param {function} ySelector - c
     * @param {function} projector - d
     * @param {function} [comparer] - e
     * @return {list.list_core} - f
     */
    listJoin: function _join(ys, xSelector, ySelector, projector, comparer) {
        return createList(this, _iteratorWrapper(iterators.join(this, ys, xSelector, ySelector, projector, comparer)));
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function map
     * @this list.list_core
     * @param {function} mapFunc - a
     * @return {list.list_core} - b
     *
     * @example
     * List([1, 2, 3, 4, 5]).map(x => x * x)    => List(1, 4, 9, 16, 25)
     */
    map: function _map(mapFunc) {
        return createList(this, _iteratorWrapper(iterators.map(this, mapFunc)));
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function join
     * @return {list} - a
     *
     * @example
     * List([1, 2, 3, 4, 5]).map(x => List(x)).join()  => List(1, 2, 3, 4, 5)
     */
    join: function _join() {
        return this.chain(x => x);
    },

    /**
     * @signature
     * @description d
     * @return {list.list_core} a
     */
    pop: function _pop() {
        return createList(this, _iteratorWrapper(iterators.pop(this)));
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function prepend
     * @this list.list_core
     * @param {Array|generator} xs - a
     * @return {list.list_core} - b
     *
     * @example
     * List([1, 2, 3, 4, 5]).prepend([-2, -1, 0])   => List(-2, -1, 0, 1, 2, 3, 4, 5)
     */
    prepend: function _prepend(xs) {
        return createList(this, _iteratorWrapper(iterators.prepend(this, List.of(xs))));
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function prependAll
     * @this list
     * @param {Array|list|ordered_list} xs - A list
     * @return {list|ordered_list} Returns a new list
     *
     * @example
     * List(6, 7, 8, 9).prependAll([0, 1, 2], [3, 4], [5])  => List(0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
     */
    prependAll: function _prependAll(...xs) {
        return createList(this, _iteratorWrapper(iterators.prependAll(this, xs.map(x => List.of(x)))));
    },

    /**
     * @description d
     * @member list.list_core
     * @instance
     * @function push
     * @this list.list_core
     * @param {*} items - a
     * @return {list.list} - b
     *
     * @example
     * List([1, 2, 3, 4, 5]).push(6)    => List(1, 2, 3, 4, 5, 6)
     */
    push: function _push(...items) {
        return this.concat(items);
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function reverse
     * @this list.list_core
     * @external Array
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse}
     * @return {list.list_core} - a
     *
     * @example
     * List([1, 2, 3, 4, 5]).reverse()  => List(5, 3, 2, 2, 1)
     */
    reverse: function _reverse() {
        return createList(this, _iteratorWrapper(iterators.reverse(this)));
    },

    /**
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function shift
     * @this list.list_core
     * @return {list.list_core} a
     *
     * @example
     * List([1, 2, 3, 4, 5]).shift()    => List(2, 3, 4, 5)
     */
    shift: function _shift() {
        return this.skip(1);
    },

    /**
     * @signature
     * @description Skips over a specified number of items in the source and returns the
     * remaining items. If no amount is specified, an empty list is returned;
     * Otherwise, a list containing the items collected from the source is
     * returned.
     * @memberOf list.list_core
     * @instance
     * @function skip
     * @this list.list_core
     * @param {number} amt - The number of items in the source to skip before
     * returning the remainder.
     * @return {list.list_core} - a
     *
     * @example
     * List([1, 2, 3, 4, 5]).skip(3)    => List(4, 5)
     */
    skip: function _skip(amt) {
        if (!amt) return this;
        var count = 0 < amt ? -1 : 1;
        return 0 < amt ? this.skipWhile(() => ++count < amt) : this.reverse().skipWhile(() => --count > amt).reverse();
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function skipWhile
     * @this list.list_core
     * @param {function} [predicate] - a
     * @return {list.list_core} - b
     *
     * @example
     * List([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
     *  .skip(x => 5 > x)   => List(5, 6, 7, 8, 9, 10)
     */
    skipWhile: function _skipWhile(predicate = defaultPredicate) {
        return createList(this, _iteratorWrapper(iterators.skipWhile(this, predicate)));
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function slice
     * @this list.list_core
     * @external Array
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice}
     * @param {number} [start] - An optional integer value that indicates where the slice of the current
     * list should begin. If no value is provided, the first index is used. If a negative value is provided,
     * the index is counted from the end of the list.
     * @param {number} [end] - An optional integer value that indicates where the slice of the current
     * list should end. If no value is provided, it will continue taking values until it reaches the end
     * of the list.
     * @return {list.list_core} Returns a new list
     */
    slice: function _slice(start, end) {
        return createList(this, _iteratorWrapper(iterators.slice(this, start, end)));
    },

    /**
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function splice
     * @this list.list_core
     * @param {Integer} start - a
     * @param {Integer} end = b
     * @return {list.list_core} c
     */
    splice: function _splice(start, end) {
        return createList(this, _iteratorWrapper(iterators.slice(this, start, end)));
    },

    /**
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function tail
     * @this list.list_core
     * @return {list.list_core} a
     *
     * @example
     * List([1, 2, 3, 4, 5]).tail()     => List(2, 3, 4, 5)
     */
    tail: function _tail() {
        return this.skip(1);
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function take
     * @this list.list_core
     * @param {number} amt - a
     * @return {list.list_core} - b
     *
     * @example
     * List([1, 2, 3, 4, 5]).take(3)    => List(1, 2, 3)
     */
    take: function _take(amt) {
        if (!amt) return List.empty();
        var count = 0 < amt ? -1 : 1;
        return 0 < amt ? this.takeWhile(() => ++count < amt) : this.reverse().takeWhile(() => --count > amt).reverse();
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function takeWhile
     * @this list.list_core
     * @param {function} [predicate] - a
     * @return {list.list_core} - b
     *
     * @example
     * List([1, 2, 3, 4, 5]).takeWhile(x => 3 < x)      => List(1, 2)
     */
    takeWhile: function _takeWhile(predicate = defaultPredicate) {
        return createList(this, _iteratorWrapper(iterators.takeWhile(this, predicate)));
    },

    /**
     * @signature
     * @description Produces the objectSet union of two lists by selecting each unique item in both
     * lists. A comparer function may be provided to the function that determines
     * the equality/inequality of the items in each List; if left undefined, the
     * function will use a default equality comparer. This function is a deferred
     * execution call that returns a new queryable object delegator instance that
     * contains all the requisite information on how to perform the operation.
     * @memberOf list.list_core
     * @instance
     * @function union
     * @this list.list_core
     * @param {Array|generator} xs - a
     * @param {function} comparer - b
     * @return {list.list_core} - c
     */
    union: function _union(xs, comparer) {
        return createList(this, _iteratorWrapper(iterators.union(this, xs, comparer)));
    },

    /**
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function unshift
     * @this list.list_core
     * @param {*} items - a
     * @return {list.list_core} b
     */
    unshift: function _unshift(...items) {
        return this.prepend(items);
    },

    /**
     * @signature
     * @description Produces a List of the items in the queryable object and the List passed as
     * a function argument. A comparer function may be provided to the function that determines
     * the equality/inequality of the items in each List; if left undefined, the
     * function will use a default equality comparer. This function is a deferred
     * execution call that returns a new queryable object delegator instance that
     * contains all the requisite information on how to perform the operation.
     * @memberOf list.list_core
     * @instance
     * @function zip
     * @this list.list_core
     * @param {function} selector - a
     * @param {Array|generator} xs - b
     * @return {list.list_core} - c
     */
    zip: function _zip(selector, xs) {
        return createList(this, _iteratorWrapper(iterators.zip(this, xs, selector)));
    },

    /**
     * @signature (a -> Boolean) -> [a] -> Boolean
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function all
     * @this list.list_core
     * @param {function} [predicate] - a
     * @return {boolean} - b
     *
     * @example
     * List([1, 2, 3, 4, 5]).all(x => 2 < x)    => false
     */
    all: function _all(predicate = defaultPredicate) {
        return list_util.all(this, predicate);
    },

    /**
     * @signature: (a -> Boolean) -> [a] -> Boolean
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function any
     * @this list.list_core
     * @param {function} [predicate] - a
     * @return {boolean} - b
     *
     * @example
     * List([1, 2, 3, 4, 5]).any(x => 2 < x)    => true
     *
     * List([1]).any()  => true
     */
    any: function _any(predicate = defaultPredicate) {
        return list_util.any(this, predicate);
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function count
     * @this list.list_core
     * @param {function} [predicate] - a
     * @return {Number} -  b
     *
     * @example
     * List([1, 2, 3, 4, 5]).count()    => 5
     */
    count: function _count(predicate) {
        return list_util.count(this, predicate);
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @this list.list_core
     * @return {Array} Returns an array after evaluating the entire pipeline by running
     * the initial underlying data through each function.
     */
    get data() {
        if (this.evaluatedData) return this.evaluatedData;
        return Array.from(this);
    },

    /**
     * @description Returns the _evaluatedData property if it has been set, or null otherwise.
     * @return {Array|null} Returns either an array of values or null if there are none
     */
    get evaluatedData() {
        return this._evaluatedData || null;
    },

    /**
     * @description Sets the _evaluatedData property on a list object. This is only used
     * internally to prevent multiple enumerations and the underlying data won't change
     * and so can be cached after evaluation.
     * @param {Array} val - An array of values
     */
    set evaluatedData(val) {
        this._evaluatedData = val;
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function entries
     * @this list.list_core
     * @external Array
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/entries}
     * @return {Iterator.<*>} Returns an iterator that contains the kvp's for
     * each value in the list.
     */
    entries: function _entries() {
        return this.data.entries();
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function equals
     * @this list.list_core
     * @param {list.list_core} f - a
     * @param {function} [comparer] - b
     * @return {boolean} - c
     *
     * @example
     * List([1, 2, 3, 4, 5]).equals(List([1, 2, 3, 4, 5]))  => true
     * List([1, 2, 3, 4, 5]).equals(List.of(1, 2, 3, 4, 5)) => true
     * List([1, 2, 3, 4, 5]).equals(List([1, 2, 3, 4]))     => false
     */
    equals: function _equals(f, comparer) {
        return Object.getPrototypeOf(this).isPrototypeOf(f) && list_util.equals(this, f, comparer);
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function findIndex
     * @this list.list_core
     * @external Array
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex}
     * @param {function} [comparer] - a
     * @return {Number} - b
     */
    findIndex: function _findIndex(comparer) {
        return list_util.findIndex(this, comparer);
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function findLastIndex
     * @this list.list_core
     * @param {function} [comparer] - a
     * @return {Number} - b
     */
    findLastIndex: function _findLastIndex(comparer) {
        return list_util.findLastIndex(this, comparer);
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function first
     * @this list.list_core
     * @param {function} [predicate] - a
     * @return {*} - b
     */
    first: function _first(predicate = defaultPredicate) {
        return list_util.first(this, predicate);
    },

    /**
     * @signature (a -> b -> c) -> a -> [b] -> a
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function foldl
     * @this list.list_core
     * @param {function} fn - a
     * @param {*} acc - b
     * @return {*} - c
     */
    foldl: function _foldl(fn, acc) {
        return list_util.foldLeft(this, fn, acc);
    },

    /**
     * @signature (a -> a -> a) -> [a] -> a
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function foldr
     * @this list.list_core
     * @param {function} fn - a
     * @param {*} acc - b
     * @return {*} - c
     */
    foldr: function _foldr(fn, acc) {
        return list_util.foldRight(this, fn, acc);
    },

    /**
     * @signature
     * @description This function property is basically just a proxy for the normal javascript
     * array#forEach. However, unlike the array#forEach function property, this function will
     * return the same list that forEach was invoked on, so composition may continue. This is
     * implemented on the list data structure because it exists on the array. However, this
     * functionality should not be used to modify the list - rather it is for impure operations
     * performed outside of the list. To alter the data contained within, see any of the deferred
     * execution function properties.
     * @memberOf list.list_core
     * @instance
     * @function forEach
     * @this list.list_core
     * @external Array
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach}
     * @param {function} fn - A function that should be applied to each value held in the list
     * @return {list.list_core} Returns a list
     *
     * @example
     * List([1, 2, 3, 4, 5]).forEach(console.log)
     */
    forEach: function _forEach(fn) {
        this.data.forEach(fn);
        return this;
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function indexOf
     * @this list.list_core
     * @external Array
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf}
     * @param {*} val - Any javascript type/value that should be searched for in the list
     * @return {number} - Returns an integer representing the index of the first appearance
     * the value in the list. -1 indicates the value does not exist within the list.
     */
    indexOf: function _indexOf(val) {
        return this.data.indexOf(val);
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function isEmpty
     * @this list.list_core
     * @return {boolean} - a
     *
     * @example
     * List([1, 2, 3, 4, 5]).isEmpty()  => false
     * List([]).isEmpty()               => true
     * List.empty().isEmpty()           => true
     */
    isEmpty: function _isEmpty() {
        return 0 === this.data.length;
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function join
     * @this list.list_core
     * @external Array
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join}
     * @param {*} [delimiter] - Any javascript type/value that should be used as a delimiter
     * between value.
     * @return {string} Returns a string of each element in the list, optionally separated by
     * the provided delimiter.
     */
    arrayJoin: function _join(delimiter) {
        return this.data.join(delimiter);
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function keys
     * @this list.list_core
     * @external Array
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/keys}
     * @return {Iterator.<number>} Returns an iterator that contains the keys for each index in the list.
     */
    keys: function _keys() {
        return this.data.keys();
    },

    /**
     * @signature
     * @description d
     * @memberOf  list.list_core
     * @instance
     * @function last
     * @this list.list_core
     * @param {function} [predicate] - a
     * @return {*} - b
     *
     * @example
     * List([1, 2, 3, 4, 5]).last()     => 5
     * List([1, 2, 3, 4, 5]).last(x => 3 > x)   => 5
     */
    last: function _last(predicate = defaultPredicate) {
        return list_util.last(this, predicate);
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function reduceRight
     * @this list.list_core
     * @external Array
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight}
     * @param {function} fn - a
     * @param {*} acc - b
     * @return {*} - c
     */
    reduceRight: function _reduceRight(fn, acc) {
        return list_util.reduceRight(this, fn, acc);
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function toArray
     * @this list.list_core
     * @return {Array} - a
     */
    toArray: function _toArray() {
        return Array.from(this);
    },

    /**
     * @signature
     * @description Evaluates the current List instance and returns a new List
     * instance with the evaluated data as its source. This is used when the
     * initial List's data must be iterated more than once as it will cause
     * the evaluation to happen each item it is iterated. Rather the pulling the
     * initial data through the List's 'pipeline' every time, this property will
     * allow you to evaluate the List's data and store it in a new List that can
     * be iterated many times without needing to re-evaluate. It is effectively
     * a syntactical shortcut for: List.from(listInstance.data)
     * @memberOf list.list_core
     * @instance
     * @function toEvaluatedList
     * @this list.list_core
     * @return {list} - a
     */
    toEvaluatedList: function _toEvaluatedList() {
        return List.from(this.data /* the .data property is a getter function that forces evaluation */);
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function toMap
     * @this list.list_core
     * @return {Map} - a
     */
    toMap: function _toMap() {
        return new Map(this.data.map(function _map(val, idx) {
            return [idx, val];
        }));
    },

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function toSet
     * @this list.list_core
     * @return {Set} - a
     */
    toSet: function _toSet() {
        return new Set(this);
    },

    /**
     * @signature
     * @description Returns a string representation of an instance of a List
     * delegator object. This function does not cause evaluation of the source,
     * but this also means the returned value only reflects the underlying
     * data, not the evaluated data. In order to see a string representation of
     * the evaluated data, an evaluation must occur before .toString in invoked.
     * The most direct way of doing this is via the {@link list.list_core#toEvaluatedList}
     * function property.
     * @example
     * var list = List([1, 2, 3, 4, 5])
     *              .map(x => x * x);
     *
     * console.log(list.toString()); // => List(List(1, 2, 3, 4, 5)
     *
     * var evaledList = list.toEvaluatedList();
     *
     * console.log(evaledList.toString()); // => List(1, 4, 9, 16, 25);
     * @memberOf list.list_core
     * @instance
     * @function toString
     * @this list.list_core
     * @return {string} Returns a string representation of the list. NOTE: This functionality
     * currently forces an evaluation of the pipelined operations.
     */
    toString: function _toString() {
        //console.log(this.value);
        //console.log(list_core.isPrototypeOf(this.value), this.value.toString(), this.value);

        /*if (list_core.isPrototypeOf(this.value) || (Array.isArray(this.value) && this.value.length === 5)) {
            console.log(list_core.isPrototypeOf(this.value));
            console.log(this);
            console.log(this.value);

            if (list_core.isPrototypeOf(this.value)) {
                console.log(this.value.toString());
            }
        }*/
        //return list_core.isPrototypeOf(this.value) ? this.value.toString() : `List(${this.value})`;
        //var val = list_core.isPrototypeOf(this.value) ? this.value.toString() : this.value;
        return `List(${this.value})`;
    },

    toLocaleString: function _toLocaleString() {
        return this.toArray().toLocaleString();
    },

    toJSON: function _toJSON() {
        return this.data;
    },
    get [Symbol.toStringTag]() {
        return 'List';
    },
    /*
    valueOf: function _valueOf() {
        return this.data;
    },
    */

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function factory
     * @return {list.list_core} - a
     */
    factory: List,

    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function sequence
     * @this list.list_core
     * @param {Object} p - Any pointed monad with a '#of' function property
     * @return {list} - b
     */
    sequence: function _sequence(p) {
        return this.traverse(p, p.of);
        /*
        return this.foldr((m, ma) => {
            return m.chain(x => {
                if (0 === ma.value.length) return List.of(x);
                return ma.chain(xs => List.of(List.of(x).concat(xs)));
            });
        }, List.empty());
        */
    },
    /**
     * @signature
     * @description d
     * @memberOf list.list_core
     * @instance
     * @function traverse
     * @this list.list_core
     * @param {Object} f - A pointed monad with a '#of' function property. Used only in cases
     * where the mapping function cannot be run.
     * @param {function} g - b
     * @return {list} - c
     */
    traverse: function _traverse(f, g) {
        return this.foldl((ys, x) => ys.apply(g(x).map(x => y => y.concat([x]))), f(List.empty()));
    },

    /**
     * @description Base iterator to which all queryable_core delegator objects
     * delegate to for iteration if for some reason an iterator wasn't
     * objectSet on the delegator at the time of creation.
     * @memberOf list.list_core
     * @instance
     * @this list.list_core
     * @generator
     * @return {Array} - a
     */
    [Symbol.iterator]: function *_iterator() {
        var data = this.evaluatedData ? this.evaluatedData : Array.from(this.value),
            res = [];
        for (let item of data) {
            yield item;
            res[res.length] = item;
        }
        this.evaluatedData = res;
    }
};

/**
 * @description d
 * @memberOf list.list_core
 * @instance
 * @function set
 * @this list.list_core
 * @param {Number} idx - a
 * @param {*} val - b
 * @return {*} c
 */
list_core.set = function _set(idx, val) {
    let len = this.count();
    let normalizedIdx = 0 > idx ? len + idx : idx;
    if (0 <= normalizedIdx) {
        return createList(this, _iteratorWrapper(iterators.set(this, normalizedIdx, val)));
    }
    return this;
};

/**
 * @description d
 * @memberOf list.list_core
 * @instance
 * @function get
 * @this list.list_core
 * @param {Number} idx - a
 * @return {*} - b
 */
list_core.get = function _get(idx) {
    let len = this.count(),
        normalizedIdx = 0 > idx ? len + idx : idx;
    return this.toArray()[normalizedIdx];
};

/**
 * @signature
 * @description Alias for {@link list.list_core#concat}
 * @memberOf list.list_core
 * @instance
 * @function append
 * @this list.list_core
 * @see list.list_core#concat
 * @param {Array | *} ys - a
 * @return {list.list_core} - b
 */
list_core.append = list_core.concat;

/**
 * @signature Object -> Object
 * @description Alias for {@link list.list_core#apply}
 * @memberOf list.list_core
 * @instance
 * @function ap
 * @this list.list_core
 * @see list.list_core#apply
 * @param {Object} ma - Any object with a map function - i.e. a monad.
 * @return {Object} Returns an instance of the monad object provide as an argument.
 */
list_core.ap = list_core.apply;

/**
 * @signature
 * @description Alias for {@link list.list_core#chain}
 * @memberOf list.list_core
 * @instance
 * @function fmap
 * @this list.list_core
 * @param {function} fn - a
 * @return {list} - b
 */
list_core.fmap = list_core.chain;

/**
 * @signature
 * @description Alias for {@link list.list_core#chain}
 * @memberOf list.list_core
 * @instance
 * @function fmap
 * @this list.list_core
 * @param {function} fn - a
 * @return {list} - b
 */
list_core.flapMap = list_core.chain;

/**
 * @signature
 * @description Alias for {@link list.list_core#chain}
 * @memberOf list.list_core
 * @instance
 * @function bind
 * @this list.list_core
 * @property {function} fn
 * @return {list.list_core} - Returns a new list monad
 */
list_core.bind = list_core.chain;

/**
 * @signature
 * @description Alias for {@link list.list_core#all}
 * @memberOf list.list_core
 * @instance
 * @function every
 * @type {list.list_core.all}
 * @this list.list_core
 * @param {function} predicate - a
 * @return {boolean} - b
 */
list_core.every = list_core.all;

/**
 * @signature
 * @description Alias for {@link list.list_core#any}
 * @memberOf list.list_core
 * @instance
 * @function every
 * @type {list.list_core.any}
 * @this list.list_core
 * @param {function} predicate - a
 * @return {boolean} - b
 */
list_core.some = list_core.any;

/**
 * @signature
 * @description Alias for {@link list.list_core#isEmpty}
 * @memberOf list.list_core
 * @instance
 * @function isIdentity
 * @type {list.list_core#isEmpty}
 * @this list.list_core
 * @return {boolean} - b
 */
list_core.isIdentity = list_core.isEmpty;

/**
 * @delegate
 * @delegator {@link list.list_core}
 * @description: A list_core delegator object that, in addition to the delegatable functionality
 * it has from the list_core object, also exposes .orderBy and .orderByDescending
 * functions. These functions allow a consumer to sort a List's data by
 * a given key.
 * @typedef {Object}
 * @property {function} sortBy
 * @property {function} sortByDescending
 * @property {function} contains
 * @kind {Object}
 * @memberOf list
 * @namespace list
 */
var list = Object.create(list_core, /** @lends list_core */  {
    /**
     * @signature
     * @description d
     * @memberOf list.list
     * @instance
     * @function sortBy
     * @param {function} keySelector - a
     * @param {function} comparer - b
     * @return {list.ordered_list} - c
     */
    sortBy: {
        value: function _orderBy(keySelector = identity, comparer = defaultPredicate) {
            var sortObj = [createSortObject(keySelector, comparer, sortDirection.ascending)];
            return createList(this, _iteratorWrapper(iterators.sortBy(this, sortObj)), sortObj);
        }
    },
    /**
     * @signature
     * @description d
     * @memberOf list.list
     * @instance
     * @function sortByDescending
     * @param {function} keySelector - a
     * @param {function} comparer - b
     * @return {list.ordered_list} - c
     */
    sortByDescending: {
        value: function _orderByDescending(keySelector, comparer = defaultPredicate) {
            var sortObj = [createSortObject(keySelector, comparer, sortDirection.descending)];
            return createList(this, _iteratorWrapper(iterators.sortBy(this, sortObj)), sortObj);
        }
    },
    /**
     * @signature
     * @description d
     * @memberOf list.list
     * @instance
     * @function contains
     * @param {*} val - a
     * @param {function} comparer - b
     * @return {boolean} - c
     */
    contains: {
        value: function _contains(val, comparer) {
            return list_util.contains(this, val, comparer);
        }
    }
});

/**
 * @description: A list_core delegator object that, in addition to the delegatable functionality
 * it has from the queryable_core object, also exposes .thenBy and .thenByDescending
 * functions. These functions allow a consumer to sort more on than a single column.
 * @typedef {Object}
 * @property {function} sortBy
 * @property {function} sortByDescending
 * @property {function} contains
 * @memberOf list
 * @namespace ordered_list
 */
var ordered_list = Object.create(list_core, /** @lends list_core */  {
    _appliedSorts: {
        value: []
    },
    //In these two functions, feeding the call to "orderBy" with the .value property of the List delegate
    //rather than the delegate itself, effectively excludes the previous call to the orderBy/orderByDescending
    //since the iterator exists on the delegate, not on its value. Each subsequent call to thenBy/thenByDescending
    //will continue to exclude the previous call's iterator... effectively what we're doing is ignoring all the
    //prior calls made to orderBy/orderByDescending/thenBy/thenByDescending and calling it once but with an array
    //of the the requested sorts.
    /**
     * @signature
     * @description d
     * @memberOf list.ordered_list
     * @instance
     * @function thenBy
     * @param {function} keySelector - a
     * @param {function} comparer - b
     * @return {list.ordered_list} - c
     */
    thenBy: {
        value: function _thenBy(keySelector, comparer = defaultPredicate) {
            var sortObj = this._appliedSorts.concat(createSortObject(keySelector, comparer, sortDirection.ascending));
            return createList(this.value, _iteratorWrapper(iterators.sortBy(this, sortObj)), sortObj);
        }
    },
    /**
     * @signature
     * @description d
     * @memberOf list.ordered_list
     * @instance
     * @function thenByDescending
     * @param {function} keySelector - a
     * @param {function} comparer - b
     * @return {list.ordered_list} - c
     */
    thenByDescending: {
        value: function thenByDescending(keySelector, comparer = defaultPredicate) {
            var sortObj = this._appliedSorts.concat(createSortObject(keySelector, comparer, sortDirection.descending));
            return createList(this.value, _iteratorWrapper(iterators.sortBy(this, sortObj)), sortObj);
        }
    },
    /**
     * @signature
     * @description Performs the same functionality as list.list_core#contains, but utilizes
     * a binary searching algorithm rather than a sequential search. If this function is called
     * an a non-ordered List, it will internally delegate to list.list_core#contains instead. This
     * function should not be called on a sorted List for look for a value that is not the
     * primary field on which the List's data is sorted on as an incorrect result will likely
     * be returned.
     * @memberOf list.ordered_list
     * @instance
     * @function contains
     * @param {*} val - The value that should be searched for
     * @param {function} comparer - The function used to compare values in the List to
     * the 'val' parameter
     * @return {boolean} - Returns true if the List contains the searched for value, false
     * otherwise.
     */
    contains: {
        value: function _contains(val, comparer) {
            return list_util.binarySearch(when(not(isArray), Array.from, this.value), val, comparer);
        }
    }
});

/**
 * @signature
 * @description d
 * @private
 * @param {*} [source] - a
 * @return {list} - b
 */
var listFromNonGen = source => createList(source && source[Symbol.iterator] && 'string' !== typeof source ? source : wrap(source));

/**
 * @signature
 * @description d
 * @private
 * @param {generator} source - a
 * @return {list} - b
 */
var listFromGen = source => createList(invoke(source));

/**
 * @signature
 * @factory List
 * @description Creator function for a new List object. Takes any value/type as a parameter
 * and, if it has an iterator defined, with set it as the underlying source of the List as is,
 * or, wrap the item in an array if there is no defined iterator. The returned list object may
 * be treated like an array in terms of retrieving an element at a specified index. Note however,
 * that attempting to set a value via index location will not work.
 *
 * @example List([1, 2, 3, 4, 5])[2]    // => 3
 *
 * @namespace List
 * @memberOf list
 * @property {function} from {@link List#from} - Creates and returns a new list from any argument or arguments provided
 * @property {function} of {@link List#of} - Creates and returns a new list from any argument or arguments provided
 * @property {function} ordered {@link List#ordered} - Behaves like the {@link List} factory function but returns an ordered list from the source provided
 * @property {Object} empty {@link List#empty} - Creates and returns a list with no elements
 * @property {Object} identity {@link List#identity} - Creates and returns a list with no elements
 * @property {function} just {@link List#just} - Creates and returns an ordered list with one element
 * @property {function} unfold {@link List#unfold} - Accepts a generator function and returns a new list that is created via 'unfolding' the generator
 * @property {function} is {@link List#is} - Determines if the given argument is a list and returns a boolean indicating if it is
 * @property {function} repeat {@link List#repeat} - Accepts any value and an integer and returns a new list with the value repeated 'x' times
 * @property {function} extend {@link List#extend} - Accepts a property name and a generator function and extends the list's functionality by adding that functionality to the list's prototype
 * @param {*} [source] - Any type, any value; used as the underlying source of the List
 * @return {list} - A new List instance with the value provided as the underlying source.
 */
function List(source) {
    return ifElse(isList, identity, ifElse(delegatesFrom(generatorProto), listFromGen, listFromNonGen), source);
}

let emptyList = createList([], null,
    [createSortObject(identity, defaultPredicate, sortDirection.ascending)]);

var isOneArg = args => 1 === args.length;
var isList = val => delegatesFrom(list_core, val);
var isOneArgAndAList = args => !!(isOneArg(args) && isList(args[0]));
var createListFromArgs = args => 1 !== args.length ? List(args) : Array.isArray(args[0]) || delegatesFrom(generatorProto, args[0]) ? List(args[0]) : List(args);

/**
 * @signature
 * @description Convenience function for listCreate a new List instance; internally calls List.
 * @memberOf list.List
 * @static
 * @function from
 * @see List
 * @param {*} [source] - Any type, any value; used as the underlying source of the List
 * @return {list} - A new List instance with the value provided as the underlying source.
 */
List.from = (...source) => ifElse(isOneArgAndAList, constant(...source), createListFromArgs, source);

/**
 * @signature
 * @description Creates a new list from all the arguments provided. If a single argument, that is not
 * a list, is provided to List.of, an ordered list will be returned. Otherwise, each individual argument
 * will be used provided to the function will be used as the source of the new list.
 * @memberOf list.List
 * @static
 * @function of
 * @see List.from
 * @param {*}
 * @return {list} - a
 */
List.of = List.from;

/**
 * @signature
 * @description Creates a new {@link ordered_list} for the source provided. An optional
 * source selector and comparer functions may be provided.
 * @memberOf list.List
 * @static
 * @function ordered
 * @param {*} [source] - Any JavaScript value
 * @param {function} [selector] - A function that selects either a subset of each value in the list, or can
 * act as the 'identity' function and just return the entire value.
 * @param {function} [comparer] - A function that knows how to compare the type of values the selector function
 * 'pulls' out of the list.
 * @return {ordered_list} Returns a new list monad
 */
List.ordered = (source, selector, comparer = defaultPredicate) => createList(source, null,
    [createSortObject(selector, comparer, sortDirection.ascending)]);

/**
 * @description Returns an empty, 'ordered' list. No arguments are accepted.
 * @memberOf list.List
 * @see ordered_list
 * @static
 * @function empty
 * @return {Object} Returns an empty list
 */
List.empty = () => emptyList;

/**
 * @description Holds a reference to an empty, ordered list
 * @memberOf list.List
 * @property {Object} identity
 * @see list.ordered_list
 * @kind {Object}
 */
List.identity = List.empty;

/**
 * @signature
 * @description Accepts any single value and returns a new {@link ordered_list}
 * since a list with a single item is trivially ordered. If an array, map, set, or
 * list is passed as the argument, the entire data structure will be treated as a
 * single element and the individual elements will be ignored.
 * @memberOf list.List
 * @static
 * @function just
 * @see List
 * @param {*} val - Any value
 * @return {ordered_list} - Returns an ordered list with a single element
 */
List.just = val => createList([val], null,
    [createSortObject(identity, defaultPredicate, sortDirection.ascending)]);

/**
 * @signature
 * @description Takes a function and a seed value. The function is used to 'unfold' the seed value
 * into an array which is used as the source of a new List data structure.
 * @memberOf list.List
 * @static
 * @function unfold
 * @see List
 * @param {function|generator} fn - a
 * @param {*} seed - b
 * @return {list} - c
 */
List.unfold = (fn, seed) => createList(list_util.unfold(fn)(seed));

/**
 * @signature
 * @description Takes any value as an argument and returns a boolean indicating if
 * the value is a list.
 * @memberOf list.List
 * @static
 * @function is
 * @see List
 * @param {*} f - Any JavaScript value
 * @return {boolean} - Returns a boolean indicating of the value is a list.
 *
 * @example
 * List.is(List.of(1, 2, 3, 4))     => true
 *
 * List.is([1, 2, 3, 4])            => false
 *
 * List.is()                        => false
 */
List.is = isList;

/**
 * @signature
 * @description Generates a new list with the specified item repeated the specified number of times. Because
 * this generates a list with the same item repeated n times, the resulting List is trivially
 * sorted. Thus, a sorted List is returned rather than an unsorted list.
 * @memberOf list.List
 * @static
 * @function repeat
 * @see List
 * @param {*} item - Any JavaScript value that should be used to build a new list monad.
 * @param {number} count - The number of times the value should be repeated to build the list.
 * @return {Proxy} - Returns a new ordered list monad.
 *
 * @example
 * List.repeat(1, 5)    => List(1, 1, 1, 1, 1)
 */
List.repeat = function _repeat(item, count) {
    return createList([], iterators.repeat(item, count), [createSortObject(identity, noop, sortDirection.descending)]);
};

/**
 * @signature
 * @description Extension function that allows new functionality to be applied to
 * the list data structure
 * @memberOf list.List
 * @static
 * @function extend
 * @see List
 * @param {string} prop - The name of the new property that should exist on the list data structure;
 * must be unique, cannot override an existing property.
 * @param {function} fn - A function that defines the new List functionality and
 * will be called when this new List property is invoked.
 * @return {List} Returns the List factory function after applying the new functionality to the
 * list data structure.
 *
 * @description The fn parameter must be a non-generator function that takes one or more
 * arguments and returns a generator function. The first and only required argument that
 * the wrapper function must accept is the list on which it will be operating. Any
 * additional arguments supplied when invoking the new functionality on the list will
 * be passed straight through in the order they were received by the list.
 *
 * The returned generator will be set as the newly created list's iterator, just like the
 * other built-in deferred functions. When iterating the returned generator, no arguments
 * will be passed, so the wrapping function must provide a closure over all needed arguments
 * by either explicitly naming them, or using the rest (...) operator and allowing the
 * generator to determine what to do with the data present. The generator should not assume
 * that the List argument provided will be any specific type of iterable as a List can use
 * many different iterable sources like a generator, array, map, set, or another list.
 *
 * If each item can be operated on individually within the generator, a for-of loop is
 * the preferred method of handling this operation. However, if the generator needs all
 * the List's element's up front (like sortBy and groupBy), then the generator will need
 * to force an evaluation in order to have all the data first. Array.from generally works
 * well.
 *
 * However the data is retrieved, it should always be yielded out individually. If the data
 * is grouped when yielding, any other generator's in the chain of operations that are waiting
 * to execute will assume that each grouping is a single data point.
 *
 * @example
 * //Outer function that accepts all arguments necessary for iteration and operation
 * function takeOddIndices(xs) {
 *      //returns a generator function to be used as the new List's iterator when the new
 *     //'takeOdd' function of the List is invoked as seen below
 *      return function *_takeOddIndices(xs) {
 *          let idx = 0;
 *          for (let x of xs) {
 *              if (!(idx % 2)) yield x;
 *              ++idx;
 *          }
 *      }
 * }
 *
 * List.extend('takeOdd', takeOddIndices)
 *
 * List([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).takeOdd()   => List(1, 3, 5, 7, 9)
 */
List.extend = function _extend(prop, fn) {
    if (![list, ordered_list].some(type => prop in type)) {
        list_core[prop] = function _extension(...args) {
            return createList(this, _iteratorWrapper(fn(this, ...args)));
        };
    }
    return List;
};

function createGroupedListDelegate(source, key) {
    return createList(source, undefined, undefined, key);
}

/**
 * @description Creates a new list object delegate instance; list type is determined by
 * the parameters passed to the function. If only the 'source' parameter is provided, a
 * 'basic' list delegate object instance is created. If the source and iterator parameters
 * are passed as arguments, a 'basic' list delegate object instance is created and the
 * iterator provided is used as the new instance object's iterator rather than the default
 * list iterator. If the source, iterator, and sortObj parameters are passed as arguments,
 * an ordered_list delegate object instance is created. The provided iterator is set on
 * the instance object to be used in lieu of the default iterator and the ._appliedSorts
 * field is set as the 'sortObj' parameter. If all four of the function's arguments are
 * provided (source, iterator, sortObj, and key), then a list delegate object instance
 * is created, setting the iterator for the object instance as the provided iterator, the
 * ._appliedSorts field as the sortObj argument, and the ._key field as the 'key' parameter's
 * value.
 *
 * The switch case inside the function only handles a subset of the possible bit flag values.
 * Technically there could be as many as eight different scenarios to check, not including the
 * default case. However, in practice, the only values received from the 'createBitMask' function
 * will be odd. Thus, only odd values (plus the default case which covers a value of zero) need
 * to be handled. A case of zero arises when only the 'source' argument is provided.
 *
 * @private
 * @param {*} source - The value to be used as the underlying source of the list functor; may be
 * anything javascript object that has an iterator.
 * @param {generator|null} [iterator] - A generator function that is to be used on the new list delegate
 * object instance's iterator.
 * @param {Array|undefined} [sortObject] - An array of the sort(s) (field and direction} to be used when the
 * instance is evaluated.
 * @param {string} [key] - A string that denotes what value the new list delegate object instance
 * was grouped on.
 * @return {Proxy<list.list_core>|list_core|list|ordered_list} Returns either a {@link list} delegator object
 * or an {@link ordered_list} delegator object based on the values passed as arguments.
 */
function createList(source, iterator, sortObject, key) {
    var bm = createBitMask(delegatesTo(iterator, generatorProto), isString(key), isArray(sortObject));
    var proxiedList = bitMaskMaxListValue > bm ? new Proxy(
        Object.create(list, {
            _value: { value: source, writable: false, configurable: false }
        }) , listProxyHandler) :
        new Proxy(
            Object.create(ordered_list, {
                _value: { value: source, writable: false, configurable: false },
                _appliedSorts: { value: sortObject, writable: false, configurable: false }
            }), listProxyHandler);

    switch(bm) {
        /**
         * @description: case 1 = An iterator has been passed, but nothing else. Create a
         * basic list type object instance and set the iterator as the version provided.
         */
        case 1:
            proxiedList[Symbol.iterator] = iterator;
            return proxiedList;
        case 2:
            /**
             * @description: case 2 = A key was passed as the only argument. Create a list
             * object and set the ._key field as the key string argument.
             */
            return Object.defineProperties(proxiedList, {
                '_key': { value: key, writable: false, configurable: false },
                'key': { get: function _getKey() { return this._key; } }});
        /**
         * @description: case 5 = Both an iterator and a sort object were passed in. The consumer
         * invoked the sortBy/sortByDescending or thenBy/thenByDescending function properties. Create
         * an ordered list type object instance, setting the iterator to the version provided (if any) and
         * the _appliedSorts field as the sortObject param.
         */
        case 5:
            proxiedList[Symbol.iterator] = iterator;
            return proxiedList;
        /**
         * @description: default = Nothing beyond the 'source' param was passed to this
         * function; results in a bitwise value of 00. Create a 'basic' list object type
         * instance.
         */
        default:
            return proxiedList;
    }
}

/**
 * @signature [...a] -> Number
 * @description creates a bit mask value based on truthy/falsey arguments passed to the function
 * @private
 * @param {boolean} args - Zero or more arguments. All arguments are treated as booleans, so truthy,
 * and falsey values will work.
 * @return {number} Returns an integer that represents the bit mask value of the boolean arguments.
 */
function createBitMask(...args) {
    return args.reduce(function _reduce(curr, next, idx) {
        return curr |= next << idx;
    }, args[0]);
}

function _iteratorWrapper(it) {
    return function *iterator() {
        if (this.evaluatedData) {
            for (let item of this.evaluatedData) yield item;
        }
        else {
            let res = [];
            for (let item of it()) {
                res[res.length] = item;
                yield item;
            }
            this.evaluatedData = res;
        }
    };
}

list_core.constructor = list_core.factory;
list_core.fold = list_core.foldl;
list_core.reduce = list_core.foldl;

/**
 * @signature
 * @description Since the constant functor does not represent a disjunction, the List's
 * bimap function property behaves just as its map function property. It is merely here as a
 * convenience so that swapping out monads/monads does not break an application that is
 * relying on its existence.
 * @memberOf list.list_core
 * @instance
 * @function bimap
 * @param {function} f - a
 * @param {function} g - b
 * @return {list} - c
 */
list_core.bimap = list_core.map;

export { List, list_core, list, ordered_list, createList };