import { sortData } from './sort_util';
import { isArray } from './helpers';

/**
 * @description d
 * @param {*} data - a
 * @param {number} depth - b
 * @param {string|null} key - c
 * @param {function} queryableConstructor - d
 * @return {Array} - e
 */
function nestLists(data, depth, key, queryableConstructor) {
    if (isArray(data)) data = mapData(data, depth, key, queryableConstructor);
    if (0 !== depth) data = queryableConstructor(data, null, null, key);
    return data;
}

function mapData(data, depth, key, queryableConstructor) {
    return data.map(function _createLists(item) {
        if (null != item.key) return nestLists(item, depth + 1, item.key, queryableConstructor);
        return item;
    });
}

/**
 * @description d
 * @param {*} xs - a
 * @param {Array} groupObject - b
 * @return {Array} - c
 */
function groupData(xs, groupObject) {
    var sortedData = sortData(xs, groupObject),
        retData = [];
    sortedData.forEach(function _groupSortedData(item) {
        let grp = retData;
        groupObject.forEach(function _createGroupsByFields(group) {
            grp = findGroup(grp, group.keySelector(item));
        });
        grp.push(item);
    });

    return retData;
}

/**
 * @description d
 * @param {Array} arr - a
 * @param {string} field - b
 * @return {Array} - c
 */
function findGroup(arr, field) {
    var grp;
    if (arr.some(function _findGroup(group) {
        if (group.key === field) {
            grp = group;
            return true;
        }
    }))
        return grp;
    else {
        grp = [];
        grp.key = field;
        //objectSet(field, 'key', grp);
        arr.push(grp);
        return grp;
    }
}

export { groupData, nestLists };