import { sortDirection } from './helpers';

let lengthOfItemsToSort = (items) => !items.length;
let keyComparison = (items, comparer, selector, direction, item) => 0 === comparer(selector(items[0]), selector(item), direction);

/** @module sort_util */

var sort_obj = {};

function createSortObject(selector, comparer, direction) {
    return Object.create(sort_obj, {
        keySelector: {
            value: selector
        },
        comparer: {
            value: comparer
        },
        direction: {
            value: direction
        }
    });
}


function sortData(data, sortObject) {
    var sortedData = data;
    sortObject.forEach(function _sortItems(sort, index) {
        var comparer = 'function' === typeof sort.comparer ? sort.comparer : sortComparer;
        if (0 === index) sortedData = 5001 > data.length ?
            insertionSort(data, sort.keySelector, comparer, sort.direction) : mergeSort(data, sort.keySelector, comparer, sort.direction);
        //if (index === 0) sortedData = quickSort(data, sort.direction, sort.keySelector, comparer);
        else {
            let sortedSubData = [], itemsToSort = [], prevKeySelector = sortObject[index - 1].keySelector;
            sortedData.forEach(function _sortData(item, idx) {
                //TODO: re-examine this logic; I think it is in reverse order
                if (!itemsToSort.length || 0 === comparer(prevKeySelector(itemsToSort[0]), prevKeySelector(item), sort.direction))
                    itemsToSort.push(item);
                else {
                    if (1 === itemsToSort.length) sortedSubData = sortedSubData.concat(itemsToSort);
                    else {
                        sortedSubData = sortItemsAndConcatWithSubData(sortedSubData, itemsToSort, comparer, sort.keySelector, sort.direction);
                        //sortedSubData = sortedSubData.concat(5001 > itemsToSort.length ?
                        //  insertionSort(itemsToSort, sort.keySelector, comparer, sort.direction) : mergeSort(itemsToSort, sort.keySelector, comparer, sort.direction));
                        //sortedSubData = sortedSubData.concat(quickSort(itemsToSort, sort.direction, sort.keySelector, comparer));
                    }
                    itemsToSort.length = 0;
                    itemsToSort[0] = item;
                }
                if (idx === sortedData.length - 1) {
                    sortedSubData = sortItemsAndConcatWithSubData(sortedSubData, itemsToSort, comparer, sort.keySelector, sort.direction);
                    //sortedSubData = sortedSubData.concat(5001 > itemsToSort.length ?
                    //  insertionSort(itemsToSort, sort.keySelector, comparer, sort.direction) : mergeSort(itemsToSort, sort.keySelector, comparer, sort.direction));
                }
            });
            sortedData = sortedSubData;
        }
    });
    return sortedData;
}


/**
 * @signature
 * @description d
 * @param {Array} data - a
 * @param {Array} sortObject - b
 * @return {Array} - Returns an array sorted on 'n' fields in either ascending or descending
 * order for each field as specified in the 'sortObject' parameter
 */
function sortData2(data, sortObject) {
    let comparer = 'function' === typeof sortObject[0].comparer ? sortObject[0].comparer : sortComparer,
        sortedData = sortSubData(data, data, comparer, sortObject[0].keySelector, sortObject[0].direction);

    sortObject.slice(1).forEach(function _sortItems(sort, index) {
        let sortedSubData = [], itemsToSort = [], prevKeySelector = sortObject[0 === index ? 0 : index - 1].keySelector;
        sortedData.forEach(function _sortData(item, idx) {
            if (checkItemEquality(itemsToSort, item, comparer, prevKeySelector, sort.direction))
                itemsToSort.push(item);
            else {
                sortedSubData = sortItemsAndConcatWithSubData(sortedSubData, itemsToSort, comparer, sort.keySelector, sort.direction);
                itemsToSort.length = 0;
                itemsToSort[0] = item;
            }
            if (idx === sortedData.length - 1) {
                sortedSubData = sortItemsAndConcatWithSubData(sortedSubData, itemsToSort, comparer, sort.keySelector, sort.direction);
            }
        });
        sortedData = sortedSubData;
    });
    return sortedData;
}

function checkItemEquality(itemsToSort, item, comparer, selector, direction) {
    return !itemsToSort.length || 0 === comparer(selector(itemsToSort[0]), selector(item), direction);
}

function sortItemsAndConcatWithSubData(subData, items, comparer, selector, direction) {
    return subData.concat(sortSubData(subData, items, comparer, selector, direction));
}

function sortSubData(subData, items, comparer, selector, direction) {
    return 5001 > items.length ? insertionSort(items, selector, comparer, direction) : mergeSort(items, selector, comparer, direction);
}

/**
 * @signature
 * @description d
 * @param {Array} data - a
 * @param {function} keySelector - b
 * @param {function} comparer - c
 * @param {number} direction - d
 * @return {Array} - e
 */
function mergeSort(data, keySelector, comparer, direction) {
    if (2 > data.length) return data;
    var middle = parseInt(data.length / 2);
    return merge(mergeSort(data.slice(0, middle), keySelector, comparer, direction),
        mergeSort(data.slice(middle), keySelector, comparer, direction), keySelector, comparer, direction);
}

/**
 * @signature
 * @description d
 * @param {Array} left - a
 * @param {Array} right - b
 * @param {function} keySelector - c
 * @param {function} comparer - d
 * @param {number} direction - e
 * @return {Array} - f
 */
function merge(left, right, keySelector, comparer, direction) {
    if (!left.length) return right;
    if (!right.length) return left;

    if (-1 < comparer(keySelector(left[0]), keySelector(right[0]), direction))
        return [deepClone(left[0])].concat(merge(left.slice(1, left.length), right, keySelector, comparer, direction));
    return [deepClone(right[0])].concat(merge(left, right.slice(1, right.length), keySelector, comparer, direction));
}

/**
 * @signature
 * @description d
 * @param {Array} source - a
 * @param {number} dir - b
 * @param {function} keySelector - c
 * @param {function} keyComparer - d
 * @return {Array} - Returns a sort array
 */
function quickSort(source, dir, keySelector, keyComparer) {
    if (0 === source.length) return source;
    var i = 0,
        copy = [];

    while (i < source.length) {
        copy[i] = source[i];
        ++i;
    }
    _quickSort(copy, 0, source.length - 1, keySelector, keyComparer, dir);
    return copy;
}

/**
 * @signature
 * @description d
 * @param {Array} data - a
 * @param {number} left - b
 * @param {number} right - c
 * @param {function} selector - f
 * @param {function} comparer - g
 * @param {number} dir - d
 * @return {Array} - h
 */
function _quickSort(data, left, right, selector, comparer, dir) {
    do {
        var i = left, j = right,
            currIdx = i + ((j - i) >> 1),
            curr = selector(data[currIdx]);

        do {
            while (i < data.length && 0 < comparer(selector, currIdx, i, curr, data, dir)) ++i;
            while (0 <= j && 0 > comparer(selector, currIdx, j, curr, data, dir)) --j;
            if (i > j) break;
            if (i < j) {
                let temp = data[i];
                data[i] = data[j];
                data[j] = temp;
            }
            i++;
            j--;
        } while (i <= j);
        if (j - left <= right - i) {
            if (left < j) _quickSort(data, left, j, selector, comparer, dir);
            left = i;
        }
        else {
            if (i < right) _quickSort(data, i, right, selector, comparer, dir);
            right = j;
        }
    } while (left < right);
}

/**
 * @signature
 * @description d
 * @param {Array} source - a
 * @param {function} keySelector - b
 * @param {function} keyComparer - c
 * @param {string} direction - d
 * @return {Array} - e
 */
function insertionSort(source, keySelector, keyComparer, direction) {
    if (2 > source.length) return source;
    var i = 0,
        copy = [];

    while (i < source.length) {
        copy[i] = source[i];
        ++i;
    }
    return _insertionSort(copy, keySelector, keyComparer, direction);
}

/**
 * @signature
 * @description d
 * @param {Array} source - a
 * @param {function} keySelector - b
 * @param {function} keyComparer - c
 * @param {string} direction - d
 * @return {Array} e
 */
function _insertionSort(source, keySelector, keyComparer, direction) {
    var i, j, item, val;
    for (i = 1; i < source.length; ++i) {
        item = source[i];
        val = keySelector(source[i]);
        j = i - 1;
        while (0 <= j && 0 > keyComparer(keySelector(source[j]), val, direction)) {
            source[j + 1] = source[j];
            --j;
        }
        source[j + 1] = item;
    }
    return source;
}

/**
 * @signature
 * @description d
 * @param {*} obj - a
 * @return {*} - b
 */
function deepClone(obj) {
    var uniqueObjects = new Set();

    return objectCloner(obj);

    /**
     * @signature
     * @description d
     * @param {*} obj - a
     * @return {*} - b
     */
    function objectCloner(obj) {
        //if the 'obj' parameter is a primitive type, just return it; there's no way/need to copy
        if (null == obj || 'object' !== typeof obj && 'function' !== typeof obj)
            return obj;

        //if we've already seen this 'object' before, we don't want to get caught
        //in an infinite loop; just return the 'object'. Otherwise, add it to the
        //set of viewed 'objects'
        if (uniqueObjects.has(obj)) return obj;
        uniqueObjects.add(obj);

        //if the obj parameter is a function, invoke the functionClone function and return its return...
        if ('function' === typeof obj) return functionClone(obj);

        var ret = Object.create(Object.getPrototypeOf(obj));
        //...else, reduce over the obj parameter's own keys after creating a new object that has its
        //prototype delegating to the same object that the obj's prototype delegating to. This functionality
        //will work for an array as well.
        Object.getOwnPropertyNames(obj).reduce(_reducePropNames.bind(ret), '');

        return ret;

        //this is the function used in the reduce and is bound to the context of the return (cloned) object
        function _reducePropNames(prev, curr) {
            return this[curr] = objectCloner(obj[curr]), this;
        }
    }
}

/**
 * @signature
 * @description d
 * @param {*} x - a
 * @param {*} y - b
 * @param {number} dir - c
 * @return {number} - d
 */
function sortComparer(x, y, dir) {
    var t = x > y ? 1 : x === y ? 0 : -1;
    return sortDirection.descending === dir ? t : -t;
}

export { sortData, quickSort, mergeSort, insertionSort, createSortObject };