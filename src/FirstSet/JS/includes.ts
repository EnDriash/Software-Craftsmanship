// stwórz funkcję, która działa podobnie do array.includes(element)

function includes(array: any[] = [], callbackForEachElement: (element: any) => boolean): boolean {
    for (let element of array) {
        if (callbackForEachElement(element)) return true;
    }

    return false;
}

// która szuka warunku spełnionego dla elementu wg callbackForEachElement
// jeśli znajdzie pierwszy pasujący element to funkcja przerywa iterację po arrayu i zwraca true

const testArray = [
    'siema',
    {
        dasd: 21,
        eae: 'sdasdas'
    },
    2121,
    4,
    'dsadsadas',
    [2, '3123123', '321']
];

function testCallback(element: any) {
    return element === '4';
}

console.log(includes(testArray, testCallback));

export default includes;
