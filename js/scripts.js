const fragment = document.createDocumentFragment();
const loader = document.querySelector('.loader');
const sectionAllListsContainer = document.querySelector('#all-lists-container');
const sectionAllBooksContainer = document.querySelector('#all-books-container');
const h3AllBooks = document.querySelector('#h3-all-books');
const backButtonAllBooksContainer = document.querySelector('#back-button-all-books-container');

const paginationContainer = document.querySelector('#pagination-container');
let currentPage = 1;
const amountPerPage = 5;
let amountOfPages;
let genre;

const AllLists = 'https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=CmHFGOrHUTetIVGxsAImRJXCHxEhTajD';

document.addEventListener('click', ({ target }) => {

    if (target.matches('#all-lists-container button')) {
        genre = target.value;
        sectionAllListsContainer.innerHTML = '';
        sectionAllListsContainer.classList.add('hide');
        h3AllBooks.classList.remove('hide');
        backButtonAllBooksContainer.classList.remove('hide');
        sectionAllBooksContainer.classList.remove('hide');
        paginationContainer.innerHTML = '';
        paginationContainer.classList.remove('hide');
        getAllBooks(genre);
    }

    if (target.matches('#back-button-all-books')) {
        h3AllBooks.innerHTML = '';
        h3AllBooks.classList.add('hide');
        backButtonAllBooksContainer.innerHTML = '';
        sectionAllBooksContainer.innerHTML = '';
        backButtonAllBooksContainer.classList.add('hide');
        sectionAllBooksContainer.classList.add('hide');
        sectionAllListsContainer.classList.remove('hide');
        paginationContainer.classList.add('hide');
        getAllLists();
    }

    if (target.matches('#pagination-back')) {
        currentPage--;
        backButtonAllBooksContainer.innerHTML = '';
        sectionAllBooksContainer.innerHTML = '';
        paginationContainer.innerHTML = '';
        getAllBooks(genre);
    }

    if (target.matches('#pagination-forward')) {
        currentPage++;
        backButtonAllBooksContainer.innerHTML = '';
        sectionAllBooksContainer.innerHTML = '';
        paginationContainer.innerHTML = '';
        getAllBooks(genre);
    }
});

const getAllLists = async () => {
    try {
        loader.classList.remove('hide');
        const responseAllLists = await fetch(AllLists);
        const dataAllLists = await responseAllLists.json();
        const arrAllLists = dataAllLists.results;
        return paintAllLists(arrAllLists);
    } catch (error) {
        throw error;
    }
}

const paintAllLists = (arrAllLists) => {

    arrAllLists.forEach(element => {
        const articleAllLists = document.createElement('article');
        const h3AllLists = document.createElement('h3');
        h3AllLists.innerText = element.list_name;
        const hrAllLists = document.createElement('hr');
        const pAllListsOldest = document.createElement('p');
        pAllListsOldest.innerText = `Oldest: ${element.oldest_published_date}`;
        const pAllListsNewest = document.createElement('p');
        pAllListsNewest.innerText = `Newest: ${element.newest_published_date}`;
        const pAllListsUpdated = document.createElement('p');
        pAllListsUpdated.innerText = `Updated: ${element.updated.charAt(0).toUpperCase()}${element.updated.slice(1).toLowerCase()}`;
        const buttonAllLists = document.createElement('button');
        buttonAllLists.innerText = 'READ MORE! >';
        buttonAllLists.value = element.list_name_encoded;

        articleAllLists.append(h3AllLists, hrAllLists, pAllListsOldest, pAllListsNewest, pAllListsUpdated, buttonAllLists);
        fragment.append(articleAllLists);
    });
    sectionAllListsContainer.append(fragment);
    loader.classList.add('hide');
}

const getAllBooks = async (genre) => {
    try {
        loader.classList.remove('hide');
        const responseAllBooks = await fetch(`https://api.nytimes.com/svc/books/v3/lists/current/${genre}.json?api-key=CmHFGOrHUTetIVGxsAImRJXCHxEhTajD`);
        const dataAllBooks = await responseAllBooks.json();
        const arrAllBooks = dataAllBooks.results.books;

        const start = (currentPage - 1) * amountPerPage;
        const end = start + amountPerPage;
        const arrAllBooksSliced = arrAllBooks.slice(start, end);

        amountOfPages = Math.ceil(arrAllBooks.length / amountPerPage);

        return paintAllBooks(dataAllBooks, arrAllBooksSliced);
    } catch (error) {
        throw error;
    }
}

const paintAllBooks = (dataAllBooks, arrAllBooksSliced) => {

    window.scrollTo(0, 0);
    h3AllBooks.innerText = dataAllBooks.results.display_name;

    //Return back to All Lists Button
    const backButtonAllBooks = document.createElement('button');
    backButtonAllBooks.innerText = '< BACK TO INDEX';
    backButtonAllBooks.id = 'back-button-all-books';

    //All Books Cards Elements
    arrAllBooksSliced.forEach(element => {
        const articleAllBooks = document.createElement('article');
        const h4AllBooks = document.createElement('h4');
        h4AllBooks.innerHTML = `#${element.rank} ${element.title}`;
        const imgAllBooks = document.createElement('img');
        imgAllBooks.src = element.book_image;
        const pAllBooksWeeks = document.createElement('p');
        pAllBooksWeeks.innerHTML = `Weeks on list: ${element.weeks_on_list}`;
        const pAllBooksDes = document.createElement('p');
        pAllBooksDes.innerHTML = element.description;
        const aAllBooks = document.createElement('a');
        aAllBooks.href = element.amazon_product_url;
        const buttonAllBooks = document.createElement('button');
        buttonAllBooks.innerText = 'BUY AT AMAZON >';
        aAllBooks.append(buttonAllBooks);

        articleAllBooks.append(h4AllBooks, imgAllBooks, pAllBooksWeeks, pAllBooksDes, aAllBooks);
        fragment.append(articleAllBooks);
    });
    backButtonAllBooksContainer.append(backButtonAllBooks);
    sectionAllBooksContainer.append(fragment);

    //Pagination Elements
    const buttonPaginationBack = document.createElement('button');
    buttonPaginationBack.id = 'pagination-back';
    buttonPaginationBack.innerText = '<';
    const spanPaginationPages = document.createElement('span');
    spanPaginationPages.innerText = `${currentPage} of ${amountOfPages}`;
    const buttonPaginationForward = document.createElement('button');
    buttonPaginationForward.id = 'pagination-forward';
    buttonPaginationForward.innerText = '>';

    if (currentPage === 1) {
        buttonPaginationBack.setAttribute('disabled', true);
    } else {
        buttonPaginationBack.removeAttribute('disabled');
    }

    if (currentPage === amountOfPages) {
        buttonPaginationForward.setAttribute('disabled', true)
    } else {
        buttonPaginationForward.removeAttribute('disabled');
    }

    fragment.append(buttonPaginationBack, spanPaginationPages, buttonPaginationForward);
    paginationContainer.append(fragment);

    loader.classList.add('hide');
}

getAllLists();