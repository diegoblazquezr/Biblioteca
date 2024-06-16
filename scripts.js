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

// General Variables
const fragment = document.createDocumentFragment();
const loader = document.querySelector('.loader');
const sectionAllListsContainer = document.querySelector('#all-lists-container');
const sectionAllBooksContainer = document.querySelector('#all-books-container');
const h3AllBooks = document.querySelector('#h3-all-books');
const backButtonAllBooksContainer = document.querySelector('#back-button-all-books-container');
let arrAllLists = [];
let arrAllBooks = [];
let dataAllBooks = [];
let arrAllFavorites = [];
let arrFavoritesTitles = [];

// Auth User Variables
let isUserLogged;
const profilePictureContainer = document.querySelector('#profilePictureContainer');
const loginContainer = document.querySelector('#login-container');
const signupContainer = document.querySelector('#signup-container');
const authContainer = document.querySelector('#auth-container');
const closeAuthWindow = document.querySelector('.close-auth-window');

// Filters All Lists Variables
const filtersAllListsContainer = document.querySelector('#filters-all-lists-container');
let arrFilteredByUpdate = [];
let arrFilteredBySearch = [];
let arrFilteredByOldest = [];
let arrFilteredByNewest = [];
let arrFilteredByAlphab = [];

// Pagination Variables
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
        // authContainer.classList.add('hide');
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
        // authContainer.classList.remove('hide');
        if (isUserLogged) {
            readAllFavoriteBooks();
        }
        getAllLists();
    }

    if (target.matches('#pagination-back')) {
        currentPage--;
        backButtonAllBooksContainer.innerHTML = '';
        sectionAllBooksContainer.innerHTML = '';
        paginationContainer.innerHTML = '';
        // getAllBooks(genre);
        const arrAllBooksSliced = paginateBooks();
        if (isUserLogged) {
            readAllFavoriteBooks();
        }
        paintAllBooks(arrAllBooksSliced, dataAllBooks);
    }

    if (target.matches('#pagination-forward')) {
        currentPage++;
        backButtonAllBooksContainer.innerHTML = '';
        sectionAllBooksContainer.innerHTML = '';
        paginationContainer.innerHTML = '';
        // getAllBooks(genre);
        const arrAllBooksSliced = paginateBooks();
        if (isUserLogged) {
            readAllFavoriteBooks();
        }
        paintAllBooks(arrAllBooksSliced, dataAllBooks);
    }

    if (target.matches('#login-window')) {
        authContainer.classList.add('show');
        signupContainer.classList.add('hide');
        loginContainer.classList.remove('hide');
    }

    if (target.matches('#signup-window')) {
        authContainer.classList.add('show');
        loginContainer.classList.add('hide');
        signupContainer.classList.remove('hide');
    }

    if (target.matches('.close-auth-window')) {
        authContainer.classList.remove('show');
    }

    if (target.matches('.btnFavorite, .btnFavoriteActive')) {
        if (isUserLogged) {
            const bookTitle = target.value;
            toggleFavoriteBook(bookTitle, target);
        } else {
            console.log('logeate brother');
            authContainer.classList.add('show');
            signupContainer.classList.add('hide');
            loginContainer.classList.remove('hide');
        }
    }

    if (target.matches('#btnFavorites')) {
        sectionAllListsContainer.innerHTML = '';
        backButtonAllBooksContainer.innerHTML = '';
        sectionAllBooksContainer.innerHTML = '';
        sectionAllBooksContainer.classList.add('hide');
        paginationContainer.innerHTML = '';
        paginationContainer.classList.add('hide');
        readAllFavoriteBooks();
        paintAllBooks(arrAllFavorites);
        h3AllBooks.classList.remove('hide');
        sectionAllBooksContainer.classList.remove('hide');
        backButtonAllBooksContainer.classList.remove('hide');
    }

});

document.addEventListener('change', ({ target }) => {

    if (target.matches('#btnFilePfp')) {
        uploadProfilePicture();
    }

    if (target.matches('#select-weekly-monthly')) {
        filterWeeklyMonthly(target);
    }

    if (target.matches('#oldestSelect')) {
        filterOldest(target);
    }

    if (target.matches('#newestSelect')) {
        filterNewest(target);
    }

    if (target.matches('#alphabSelect')) {
        filterAlphab(target);
    }

});

document.addEventListener('input', ({ target }) => {

    if (target.matches('#inputSearch')) {
        filterSearch(target);
    }

});

// Event listener user auth
document.getElementById("formLogin").addEventListener("submit", function (event) {
    event.preventDefault();
    let emailLogin = event.target.elements.emailLogin.value;
    let passLogin = event.target.elements.passLogin.value;
    signInUser(emailLogin, passLogin)
});

document.getElementById("formSignup").addEventListener("submit", function (event) {
    event.preventDefault();
    let nameSignup = event.target.elements.nameSignup.value;
    let emailSignup = event.target.elements.emailSignup.value;
    let passSignup = event.target.elements.passSignup.value;
    let passSignupRepeat = event.target.elements.passSignupRepeat.value;

    passSignup === passSignupRepeat ? signUpUser(nameSignup, emailSignup, passSignup) : alert("error password");
});

document.getElementById("button-logout").addEventListener("click", () => {
    signOut();
    getAllLists();
});

// Categories Filters
const filterWeeklyMonthly = (target) => {
    arrFilteredByUpdate = target.value === 'all' ? arrAllLists : arrAllLists.filter(obj => obj.updated.toLowerCase() === target.value);
    combineAllListsFilters();
}

const filterSearch = (target) => {
    arrFilteredBySearch = arrAllLists.filter(obj => obj.list_name.toLowerCase().includes(target.value.toLowerCase()));
    combineAllListsFilters();
}

const filterOldest = (target) => {
    if (target.value === 'ascending') {
        arrFilteredByOldest = arrAllLists.sort((a, b) => {
            const dateA = new Date(a.oldest_published_date).getTime();
            const dateB = new Date(b.oldest_published_date).getTime();
            return dateA - dateB;
        });
    } else if (target.value === 'descending') {
        arrFilteredByOldest = arrAllLists.sort((a, b) => {
            const dateA = new Date(a.oldest_published_date).getTime();
            const dateB = new Date(b.oldest_published_date).getTime();
            return dateB - dateA;
        });
    }
    combineAllListsFilters();
}

const filterNewest = (target) => {
    if (target.value === 'ascending') {
        arrFilteredByNewest = arrAllLists.sort((a, b) => {
            const dateA = new Date(a.newest_published_date).getTime();
            const dateB = new Date(b.newest_published_date).getTime();
            return dateA - dateB;
        });
    } else if (target.value === 'descending') {
        arrFilteredByNewest = arrAllLists.sort((a, b) => {
            const dateA = new Date(a.newest_published_date).getTime();
            const dateB = new Date(b.newest_published_date).getTime();
            return dateB - dateA;
        });
    }
    combineAllListsFilters();
}

const filterAlphab = (target) => {
    if (target.value === 'az') {
        arrFilteredByAlphab = arrAllLists.sort((a, b) => a.list_name.localeCompare(b.list_name));
    } else if (target.value === 'za') {
        arrFilteredByAlphab = arrAllLists.sort((a, b) => b.list_name.localeCompare(a.list_name));
    }
    combineAllListsFilters();
}

const combineAllListsFilters = () => {
    let combinedResults = arrAllLists;

    if (arrFilteredByUpdate.length > 0) {
        combinedResults = combinedResults.filter(obj => arrFilteredByUpdate.includes(obj));
    }
    if (arrFilteredBySearch.length > 0) {
        combinedResults = combinedResults.filter(obj => arrFilteredBySearch.includes(obj));
    }
    if (arrFilteredByOldest.length > 0) {
        combinedResults = combinedResults.filter(obj => arrFilteredByOldest.includes(obj));
    }
    if (arrFilteredByNewest.length > 0) {
        combinedResults = combinedResults.filter(obj => arrFilteredByNewest.includes(obj));
    }
    if (arrFilteredByAlphab.length > 0) {
        combinedResults = combinedResults.filter(obj => arrFilteredByAlphab.includes(obj));
    }
    paintAllLists(combinedResults);
}

// Books Filters
const paginateBooks = () => {
    const start = (currentPage - 1) * amountPerPage;
    const end = start + amountPerPage;
    const arrAllBooksSliced = arrAllBooks.slice(start, end);
    amountOfPages = Math.ceil(arrAllBooks.length / amountPerPage);
    return arrAllBooksSliced;
}

const combineAllBooksFilters = () => {
    let combinedResults = arrAllLists;

    // if (arrFilteredByUpdate.length > 0) {
    //     combinedResults = combinedResults.filter(obj => arrFilteredByUpdate.includes(obj));
    // }
    paintAllBooks(combinedResults);
}

// All Lists
const getAllLists = async () => {
    sectionAllListsContainer.classList.remove('hide');
    filtersAllListsContainer.classList.remove('hide');
    sectionAllBooksContainer.classList.add('hide');
    h3AllBooks.classList.add('hide');
    backButtonAllBooksContainer.classList.add('hide');
    paginationContainer.classList.add('hide');
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
    sectionAllListsContainer.innerHTML = '';
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
        buttonAllLists.innerHTML = 'READ MORE! <i class="fa-solid fa-angle-right" style="color: #000000;"></i>';
        buttonAllLists.value = element.list_name_encoded;

        articleAllLists.append(h3AllLists, hrAllLists, pAllListsOldest, pAllListsNewest, pAllListsUpdated, buttonAllLists);
        fragment.append(articleAllLists);
    });
    sectionAllListsContainer.append(fragment);
    loader.classList.add('hide');
}

// All Books
const getAllBooks = async (genre) => {
    filtersAllListsContainer.classList.add('hide');
    try {
        loader.classList.remove('hide');
        const responseAllBooks = await fetch(`https://api.nytimes.com/svc/books/v3/lists/current/${genre}.json?api-key=CmHFGOrHUTetIVGxsAImRJXCHxEhTajD`);
        dataAllBooks = await responseAllBooks.json();
        arrAllBooks = dataAllBooks.results.books;

        const arrAllBooksSliced = paginateBooks();

        return paintAllBooks(arrAllBooksSliced, dataAllBooks);
    } catch (error) {
        throw error;
    }
}

const paintAllBooks = (arrBooks, dataAllBooks) => {

    window.scrollTo(0, 0);
    if (dataAllBooks) {
        h3AllBooks.innerText = dataAllBooks.results.display_name;
    } else {
        h3AllBooks.innerText = `Favorites`;
    }

    //Return back to All Lists Button
    const backButtonAllBooks = document.createElement('button');
    backButtonAllBooks.innerHTML = '<i class="fa-solid fa-angle-left" style="color: #000000;"></i> BACK TO INDEX';
    backButtonAllBooks.id = 'back-button-all-books';

    //All Books Cards Elements
    arrBooks.forEach(element => {
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
        aAllBooks.classList.add('anchorAmzn');
        const buttonAllBooks = document.createElement('button');
        buttonAllBooks.innerHTML = 'Buy at Amazon <i class="fa-brands fa-amazon fa-lg" style="color: #000000;"></i>';
        buttonAllBooks.className = 'btnAmazon';
        aAllBooks.append(buttonAllBooks);
        const btnFavorite = document.createElement('BUTTON');
        if (arrFavoritesTitles.includes(element.title)) {
            btnFavorite.classList.add('btnFavoriteActive');
        } else {
            btnFavorite.classList.add('btnFavorite');
        }
        // btnFavorite.classList.add('hide');
        btnFavorite.innerHTML = '<i class="fa-regular fa-heart" style="color: #000000;"></i>';
        btnFavorite.value = element.title;

        articleAllBooks.append(h4AllBooks, imgAllBooks, pAllBooksWeeks, pAllBooksDes, aAllBooks, btnFavorite);
        fragment.append(articleAllBooks);
    });
    backButtonAllBooksContainer.append(backButtonAllBooks);
    sectionAllBooksContainer.append(fragment);

    //Pagination Elements
    const buttonPaginationBack = document.createElement('button');
    buttonPaginationBack.id = 'pagination-back';
    buttonPaginationBack.innerHTML = '<i class="fa-solid fa-angle-left" style="color: #000000;"></i>';
    const spanPaginationPages = document.createElement('span');
    spanPaginationPages.innerText = `${currentPage} of ${amountOfPages}`;
    const buttonPaginationForward = document.createElement('button');
    buttonPaginationForward.id = 'pagination-forward';
    buttonPaginationForward.innerHTML = '<i class="fa-solid fa-angle-right" style="color: #000000;"></i>';

    if (currentPage === 1) {
        buttonPaginationBack.setAttribute('disabled', true);
        buttonPaginationBack.classList.add('buttonDisabled');
    } else {
        buttonPaginationBack.removeAttribute('disabled');
        buttonPaginationBack.classList.remove('buttonDisabled');

    }

    if (currentPage === amountOfPages) {
        buttonPaginationForward.setAttribute('disabled', true);
        buttonPaginationForward.classList.add('buttonDisabled');

    } else {
        buttonPaginationForward.removeAttribute('disabled');
        buttonPaginationForward.classList.remove('buttonDisabled');

    }

    fragment.append(buttonPaginationBack, spanPaginationPages, buttonPaginationForward);
    paginationContainer.append(fragment);

    loader.classList.add('hide');
}

// User Authentication
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
            alert('Wrong authentication details.');
        });
    authContainer.classList.remove('show');
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
}

const signUpUser = (nameSignup, email, password) => {
    firebase.auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            let user = userCredential.user;
            console.log(`se ha registrado ${user.email} ID:${user.uid}`);
            alert(`se ha registrado ${user.email} ID:${user.uid}`);
            createUser({
                id: user.uid,
                name: nameSignup,
                email: user.email,
                profilePicture: 'https://firebasestorage.googleapis.com/v0/b/bibliotecanyt-1f6ea.appspot.com/o/profilePictures%2FprofilePicture.jpg?alt=media&token=dff82b2d-411b-42db-b049-178617b40a5f'
            });
            user.updateProfile({
                displayName: nameSignup
            });
            authContainer.classList.remove('show');
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
        isUserLogged = firebase.auth().currentUser;
        console.log(isUserLogged);
        console.log(`Está en el sistema:${user.email} ${user.uid}`);
        document.getElementById("message").innerText = `Hello ${isUserLogged.displayName}!`;
        document.querySelector('#loggedOffContainer').classList.add('hide');
        document.querySelector('#loggedInContainer').classList.remove('hide');
        profilePictureContainer.innerHTML = '';
        getProfilePicture();
        readAllFavoriteBooks();
        console.log(isUserLogged);
    } else {
        isUserLogged = firebase.auth().currentUser;
        console.log("no hay usuarios en el sistema");
        document.getElementById("message").innerText = `No hay usuarios en el sistema`;
        document.querySelector('#loggedOffContainer').classList.remove('hide');
        document.querySelector('#loggedInContainer').classList.add('hide');
        profilePictureContainer.innerHTML = '';
        // getProfilePicture();
        console.log(isUserLogged);
    }
});


// Favorite Books
const createFavoriteBook = (foundBook) => {
    // const user = firebase.auth().currentUser; // IT ONLY WORKS INSIDE HERE DONT KNOW WHY :(
    // console.log(user);
    if (isUserLogged) {
        db.collection("users")
            .doc(isUserLogged.uid)
            .collection("favorites")
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

const toggleFavoriteBook = async (bookTitle, target) => {
    const userRef = db.collection('users').doc(isUserLogged.uid);
    const favoritesRef = userRef.collection('favorites');
    const query = favoritesRef.where('title', '==', bookTitle);

    try {
        const snapshot = await query.get();
        readAllFavoriteBooks();
        if (snapshot.empty) {
            // No favorite found, add new
            const foundBook = arrAllBooks.find(element => element.title === bookTitle);
            createFavoriteBook(foundBook);
            target.classList.remove('btnFavorite');
            target.classList.add('btnFavoriteActive');
        } else {
            // Favorite found, delete it
            snapshot.forEach(doc => {
                doc.ref.delete();
                console.log(`${bookTitle} deleted from favorites`);
                alert(`${bookTitle} deleted from favorites`);
            });
            target.classList.remove('btnFavoriteActive');
            target.classList.add('btnFavorite');
        }
    } catch (error) {
        console.error("Error toggling favorite book: ", error);
        alert("Failed to toggle favorite status for the book.");
    }
}

const readAllFavoriteBooks = () => {
    isUserLogged = firebase.auth().currentUser;
    db.collection("users")
        .doc(isUserLogged.uid)
        .collection('favorites')
        .get()
        .then((querySnapshot) => {
            arrAllFavorites = [];
            arrFavoritesTitles = [];
            querySnapshot.forEach((doc) => {
                arrFavoritesTitles.push(doc.data().title);
                arrAllFavorites.push(doc.data());
                // console.log(arrFavoritesTitles);
            });
        })
        .catch(() => console.log('Error reading documents'));
}

// Profile Picture
const uploadProfilePicture = () => {
    const file = document.querySelector('#btnFilePfp').files[0];
    const storageRef = firebase.storage().ref();
    var profilePicRef = storageRef.child(`profilePictures/${isUserLogged.uid}profilePicture.jpg`);

    // Upload the file
    profilePicRef.put(file).then(function (snapshot) {
        // Get the download URL
        snapshot.ref.getDownloadURL().then(function (downloadURL) {
            // Save the download URL in Firestore
            db.collection('users')
                .doc(isUserLogged.uid)
                .set({
                    profilePicture: downloadURL
                }, { merge: true }).then(function () {
                    console.log('Profile picture URL saved successfully!');
                    getProfilePicture();
                }).catch(function (error) {
                    console.error('Error saving profile picture URL: ', error);
                });
        });
    }).catch(function (error) {
        console.error('Error uploading profile picture: ', error);
    });
}

const getProfilePicture = () => {
    isUserLogged = firebase.auth().currentUser;
    db.collection('users')
        .doc(isUserLogged.uid)
        .get()
        .then(function (doc) {
            if (doc.exists) {
                const urlProfilePicture = doc.data().profilePicture;
                if (urlProfilePicture) {
                    profilePictureContainer.innerHTML = '';
                    const imgProfilePicture = document.createElement('IMG');
                    imgProfilePicture.id = 'imgProfilePicture';
                    imgProfilePicture.src = `${urlProfilePicture}`;
                    profilePictureContainer.append(imgProfilePicture);
                }
            } else {
                console.log('No such document!');
            }
        }).catch(function (error) {
            console.log('Error getting document:', error);
        });
}

getAllLists();