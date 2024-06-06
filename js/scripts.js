const firebaseConfig = {
    apiKey: "AIzaSyDxuD7QmrPJqD2Flgyeuh-vBHF9KN24vio",
    authDomain: "bibliotecanyt-1f6ea.firebaseapp.com",
    projectId: "bibliotecanyt-1f6ea",
    storageBucket: "bibliotecanyt-1f6ea.appspot.com",
    messagingSenderId: "415595570695",
    appId: "1:415595570695:web:273f9a8e00e2598b78eca2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const fragment = document.createDocumentFragment();
const loader = document.querySelector('.loader');
const sectionAllListsContainer = document.querySelector('#all-lists-container');
const sectionAllBooksContainer = document.querySelector('#all-books-container');
const h3AllBooks = document.querySelector('#h3-all-books');
const backButtonAllBooksContainer = document.querySelector('#back-button-all-books-container');
let arrAllLists = [];
let arrAllBooks = [];
let dataAllBooks = [];

let isUserLogged;

const authContainer = document.querySelector('#auth-container');

// Pagination variables
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
        authContainer.classList.add('hide');
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
        authContainer.classList.remove('hide');
        getAllLists();
    }

    if (target.matches('#pagination-back')) {
        currentPage--;
        backButtonAllBooksContainer.innerHTML = '';
        sectionAllBooksContainer.innerHTML = '';
        paginationContainer.innerHTML = '';
        // getAllBooks(genre);
        const arrAllBooksSliced = paginateBooks();
        paintAllBooks(arrAllBooksSliced, dataAllBooks);
    }

    if (target.matches('#pagination-forward')) {
        currentPage++;
        backButtonAllBooksContainer.innerHTML = '';
        sectionAllBooksContainer.innerHTML = '';
        paginationContainer.innerHTML = '';
        // getAllBooks(genre);
        const arrAllBooksSliced = paginateBooks();
        paintAllBooks(arrAllBooksSliced, dataAllBooks);
    }

    if (target.matches('#btnFavorite')) {
        if (isUserLogged) {
            // console.log(isUserLogged.uid);
            // console.log(target.value);
            const foundBook = arrAllBooks.find((element) => element.title === target.value);
            createBook(foundBook);
        } else {
            console.log('logeate brother');
        }
    }
});

// Event listener user auth
document.addEventListener('change', ({ target }) => {
    if (target.matches('#select-weekly-monthly')) {
        filterWeeklyMonthly(target);
    }
});

document.getElementById("formLogin").addEventListener("submit", function (event) {
    event.preventDefault();
    let emailLogin = event.target.elements.emailLogin.value;
    let passLogin = event.target.elements.passLogin.value;
    signInUser(emailLogin, passLogin)
});

document.getElementById("formSignup").addEventListener("submit", function (event) {
    event.preventDefault();
    let emailSignup = event.target.elements.emailSignup.value;
    let passSignup = event.target.elements.passSignup.value;
    let passSignupRepeat = event.target.elements.passSignupRepeat.value;

    passSignup === passSignupRepeat ? signUpUser(emailSignup, passSignup) : alert("error password");
});

document.getElementById("button-logout").addEventListener("click", () => {
    signOut();
});

const getAllLists = async () => {
    currentPage = 1; // Resets page pagination if back button or refreshed
    try {
        loader.classList.remove('hide');
        const responseAllLists = await fetch(AllLists);
        const dataAllLists = await responseAllLists.json();
        arrAllLists = dataAllLists.results;
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
        dataAllBooks = await responseAllBooks.json();
        arrAllBooks = dataAllBooks.results.books;

        // const start = (currentPage - 1) * amountPerPage;
        // const end = start + amountPerPage;
        // const arrAllBooksSliced = arrAllBooks.slice(start, end);
        // amountOfPages = Math.ceil(arrAllBooks.length / amountPerPage);

        const arrAllBooksSliced = paginateBooks();

        return paintAllBooks(arrAllBooksSliced, dataAllBooks);
    } catch (error) {
        throw error;
    }
}

const paintAllBooks = (arr, dataAllBooks) => {

    window.scrollTo(0, 0);
    h3AllBooks.innerText = dataAllBooks.results.display_name;

    //Return back to All Lists Button
    const backButtonAllBooks = document.createElement('button');
    backButtonAllBooks.innerText = '< BACK TO INDEX';
    backButtonAllBooks.id = 'back-button-all-books';

    //All Books Cards Elements
    arr.forEach(element => {
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
        const btnFavorite = document.createElement('BUTTON');
        btnFavorite.id = 'btnFavorite';
        // btnFavorite.classList.add('hide');
        btnFavorite.innerText = '<3';
        btnFavorite.value = element.title;


        articleAllBooks.append(h4AllBooks, imgAllBooks, pAllBooksWeeks, pAllBooksDes, aAllBooks, btnFavorite);
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

// Filters Functions

const filterWeeklyMonthly = (target) => {
    sectionAllListsContainer.innerHTML = '';
    if (target.value === 'all') {
        paintAllLists(arrAllLists);
    } else {
        const arrAllListsFiltered = arrAllLists.filter((obj) => obj.updated.toLowerCase() === target.value);
        paintAllLists(arrAllListsFiltered);
    }
}

const paginateBooks = () => {
    const start = (currentPage - 1) * amountPerPage;
    const end = start + amountPerPage;
    const arrAllBooksSliced = arrAllBooks.slice(start, end);
    amountOfPages = Math.ceil(arrAllBooks.length / amountPerPage);
    return arrAllBooksSliced;
}

// Functions User Auth

const signInUser = (email, password) => {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            let user = userCredential.user;
            console.log(`se ha logado ${user.email} ID:${user.uid}`)
            alert(`se ha logado ${user.email} ID:${user.uid}`)
            console.log("USER", user);
        })
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log(errorCode)
            console.log(errorMessage)
        });
}

const createUser = (user) => {
    // Create a document reference with the user ID as the document ID
    db.collection("users")
        .doc(user.id)  // This sets the document ID to the user's UID
        .set(user)  // Use set to create the document with the provided data
        .then(() => {
            console.log("Document written with ID: ", user.id);
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
};


const createBook = (foundBook) => {
    const user = firebase.auth().currentUser; // IT ONLY WORKS INSIDE HERE DONT KNOW WHY :(
    // console.log(user);
    if (user) {
        db.collection("users").doc(user.uid).collection("favorites")
          .add(foundBook)
          .then(docRef => {
              console.log("Favorite book added with ID: ", docRef.id);
              alert("Book added to favorites!");
          })
          .catch(error => {
              console.error("Error adding favorite book: ", error);
              alert("Failed to add book to favorites.");
          });
    } else {
        console.log("No user is logged in to add a favorite book.");
        alert("You need to be logged in to add favorites.");
    }
}

const signUpUser = (email, password) => {
    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            let user = userCredential.user;
            console.log(`se ha registrado ${user.email} ID:${user.uid}`);
            alert(`se ha registrado ${user.email} ID:${user.uid}`);
            createUser({
                id: user.uid,
                email: user.email
            });

        })
        .catch((error) => {
            console.log("Error en el sistema" + error.message, "Error: " + error.code);
        });
}

const signOut = () => {
    let user = firebase.auth().currentUser;

    firebase.auth().signOut().then(() => {
        console.log("Sale del sistema: " + user.email);
    }).catch((error) => {
        console.log("hubo un error: " + error);
    });
}

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log(`Está en el sistema:${user.email} ${user.uid}`);
        document.getElementById("message").innerText = `Está en el sistema: ${user.uid}`;
        document.querySelector('#login-window').classList.add('hide');
        document.querySelector('#signup-window').classList.add('hide');
        document.querySelector('#button-logout').classList.remove('hide');
        // document.querySelector('#btnFavorite').classList.remove('hide');
        isUserLogged = user;
        console.log(isUserLogged);
    } else {
        console.log("no hay usuarios en el sistema");
        document.getElementById("message").innerText = `No hay usuarios en el sistema`;
        document.querySelector('#login-window').classList.remove('hide');
        document.querySelector('#signup-window').classList.remove('hide');
        document.querySelector('#button-logout').classList.add('hide');
        // document.querySelector('#btnFavorite').classList.add('hide');
        isUserLogged = user;
        console.log(isUserLogged);

    }
});

getAllLists();