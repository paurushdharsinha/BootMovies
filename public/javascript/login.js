// // JavaScript for sign-in form validation
// document.getElementById('signInForm').addEventListener('submit', function(event) {
//     event.preventDefault();

//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;

//     if (email === "" || password === "") {
//         alert("Please enter both email and password.");
//     } else {
//         alert(`Welcome, ${email}!`);
//     }
// });

// document.getElementById('signInForm').addEventListener('submit', function(event) {
//     event.preventDefault(); 

//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;

//     if (email === "" || password === "") {
//         alert("Please enter both email and password.");
//     } else {
       
//         window.location.href = "login.ejs";
//     }
// });

// document.getElementById('signUpForm').addEventListener('submit', function(event) {
//     event.preventDefault(); 

//     const fullName = document.getElementById('fullName').value;
//     const email = document.getElementById('signUpEmail').value;
//     const password = document.getElementById('signUpPassword').value;


//     if (fullName === "" || email === "" || password === "") {
//         alert("Please fill in all the fields.");
//     } else {
    
//         alert(`Welcome, ${fullName}! Your account has been created.`);
     
//         window.location.href = "main.ejs";
//     }
// });

// // Function to search movies based on user input
// function searchMovies() {
//     const searchTerm = document.getElementById('movieSearch').value.toLowerCase();
//     const resultsContainer = document.getElementById('searchResults');

  
//     resultsContainer.innerHTML = '';

//     const filteredMovies = movies.filter(movie => 
//         movie.title.toLowerCase().includes(searchTerm)
//     );

    
//     if (filteredMovies.length > 0) {
//         filteredMovies.forEach(movie => {
//             const movieElement = document.createElement('div');
//             movieElement.classList.add('movie-item');
//             movieElement.innerHTML = `<h3>${movie.title}</h3><p>${movie.genre} | ${movie.year}</p>`;
//             resultsContainer.appendChild(movieElement);
//         });
//     } else {
//         resultsContainer.innerHTML = '<p>No movies found.</p>';
//     }
// }
