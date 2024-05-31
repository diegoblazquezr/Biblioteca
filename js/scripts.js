const fragment = document.createDocumentFragment();
const sectionAllListsContainer = document.querySelector('#all-lists-container');
const sectionAllBooksContainer = document.querySelector('#all-books-container');
const backButtonAllBooksContainer = document.querySelector('#back-button-all-books-container');

const AllLists = 'https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=CmHFGOrHUTetIVGxsAImRJXCHxEhTajD';

sectionAllListsContainer.addEventListener('click', ({ target }) => {
    if (target.matches('#all-lists-container button')) {
        genre = target.value;
        sectionAllListsContainer.innerHTML = '';
        getAllBooks(genre);
    }
});

backButtonAllBooksContainer.addEventListener('click', ({ target }) => {
    if (target.matches('#back-button-all-books')) {
        backButtonAllBooksContainer.innerHTML = '';
        sectionAllBooksContainer.innerHTML = '';
        getAllLists();
    }
});

const getAllLists = async () => {
    try {
        const responseAllLists = await fetch(AllLists);
        if (responseAllLists.ok) {
            const dataAllLists = await responseAllLists.json();
            const arrAllLists = dataAllLists.results;
            return paintAllLists(arrAllLists);
        } else {
            throw responseAllLists;
        }
    } catch (error) {
        throw error;
    }
}

const paintAllLists = (arrAllLists) => {
    arrAllLists.forEach((element) => {
        const divAllLists = document.createElement('div');
        const h3AllLists = document.createElement('h3');
        h3AllLists.innerText = element.list_name;
        const hrAllLists = document.createElement('hr');
        const pAllListsOldest = document.createElement('p');
        pAllListsOldest.innerText = `Oldest: ${element.oldest_published_date}`;
        const pAllListsNewest = document.createElement('p');
        pAllListsNewest.innerText = `Newest: ${element.newest_published_date}`;
        const pAllListsUpdated = document.createElement('p');
        pAllListsUpdated.innerText = `Updated: ${element.updated}`;
        const buttonAllLists = document.createElement('button');
        buttonAllLists.innerText = 'READ MORE!';
        buttonAllLists.value = element.list_name_encoded;

        divAllLists.append(h3AllLists, hrAllLists, pAllListsOldest, pAllListsNewest, pAllListsUpdated, buttonAllLists);
        fragment.append(divAllLists);
    });
    sectionAllListsContainer.append(fragment);
}

const getAllBooks = async (genre) => {
    try {
        const responseAllBooks = await fetch(`https://api.nytimes.com/svc/books/v3/lists/current/${genre}.json?api-key=CmHFGOrHUTetIVGxsAImRJXCHxEhTajD`);
        if (responseAllBooks.ok) {
            const dataAllBooks = await responseAllBooks.json();
            const arrAllBooks = dataAllBooks.results.books;
            return paintAllBooks(arrAllBooks);
        } else {
            throw responseAllBooks;
        }
    } catch (error) {
        throw error;
    }
}

const paintAllBooks = (arrAllBooks) => {
    const backButtonAllBooks = document.createElement('button');
    backButtonAllBooks.innerText = 'BACK TO INDEX';
    backButtonAllBooks.id = 'back-button-all-books';
    window.scrollTo(0, 0);

    arrAllBooks.forEach((element) => {
        const divAllBooks = document.createElement('div');
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
        buttonAllBooks.innerText = 'BUY AT AMAZON';
        aAllBooks.append(buttonAllBooks);

        divAllBooks.append(h4AllBooks, imgAllBooks, pAllBooksWeeks, pAllBooksDes, aAllBooks);
        fragment.append(divAllBooks);
    });
    backButtonAllBooksContainer.append(backButtonAllBooks);
    sectionAllBooksContainer.append(fragment);
}

getAllLists();