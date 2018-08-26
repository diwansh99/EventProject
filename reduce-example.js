/**
 * Created by championswimmer on 16/06/17.
 */
// Not related to this project

var arr  = [1,2,3,4,5];

var sum = arr.reduce(function (accumulator, currentItem, currentIndex) {
    console.log(accumulator + "|" + currentItem + "|" + currentIndex);

    return accumulator + currentItem;
}, 4);

console.log('SUM = ' + sum)