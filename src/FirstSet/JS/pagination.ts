import faker from 'faker';

//----------------------MAIN----------------------

function init() {
    // create mocks data as entires
    let fakeDataArrayObject = [...new Array(getRandomHelper(1000))].map(
        (element) => (element = faker.helpers.createCard())
    );
    // mock user chooser maximalEntiresOnPage
    const maximalEntiresOnPageList = [5, 10, 20, 50, 100];
    const maximalEntiresOnPage = getRandomHelper(maximalEntiresOnPageList);
    // calculate pages quantity
    const pagesQuantity = Math.ceil(fakeDataArrayObject.length / maximalEntiresOnPage);
    // getRandom actualIndexPage
    const actualPageIdx = getRandomHelper(pagesQuantity);
    console.log(actualPageIdx, pagesQuantity, maximalEntiresOnPage);
    //prepare paginateSettings argument
    const paginateSettings: paginateSettings = {
        actualPageIdx,
        entriesOnPage: maximalEntiresOnPage
    };

    const array = paginateArray(fakeDataArrayObject, paginateSettings);
    console.log(array);
}

init();

//-----------Methods-------------
type paginateSettings = {
    actualPageIdx: number;
    entriesOnPage: number;
};
type dataEntriesList<T> = Array<T>;
type entriesOnSelectedPageList<T> = Array<T>;

function paginateArray<T>(dataEntries: dataEntriesList<T>, settings: paginateSettings): entriesOnSelectedPageList<T> {
    const { entriesOnPage, actualPageIdx } = settings;
    const floorEntiresIndex = (actualPageIdx - 1) * entriesOnPage;
    let ceilEntiresIndex = actualPageIdx * entriesOnPage;

    if (ceilEntiresIndex > dataEntries.length) {
        ceilEntiresIndex = dataEntries.length;
    }

    return [...dataEntries].slice(floorEntiresIndex, ceilEntiresIndex);
}

// ------------------Helpers-----------------------

function getRandomHelper<T>(input: Array<T>): T;
function getRandomHelper(input: number): number;
function getRandomHelper(input: any): any {
    if (typeof input === 'number') {
        return Math.floor(Math.random() * input);
    } else if (Array.isArray(input)) {
        return input[Math.floor(Math.random() * input.length)];
    } else {
        throw new Error('Invalid arguments!');
    }
}

// console.dir(fakeDataArrayObject);
// która przyjmuję array do paginacji dataEntries oraz settings o kluczach { actualPageIdx=9, entriesOnPage=50 }
// - actualPageIdx to index wybranej strony
// - entriesOnPage to maksymalna zwracana ilość elementów z dataEntries dla wybranej strony

// który zwraca entriesOnSelectedPage:
// - entriesOnSelectedPage to array z odpowiednią ilością elementów z danej strony

export default paginateArray;
