const API_KEY = "6320136d6ec1c9a9adf0f0706338c709";
const movieList = document.getElementById("movie-list");
const movieTitle = document.getElementById("movie-title");
const moviePoster = document.getElementById("movie-poster");
const movieOverview = document.getElementById("movie-overview");
const nicknameInput = document.getElementById("nickname");
const commentInput = document.getElementById("comment-input");
const postCommentBtn = document.getElementById("post-comment");
const commentsContainer = document.getElementById("comments-container");
const searchBar = document.getElementById("search-bar");
const movieContainer = document.getElementById("movie-container");
const commentSection = document.getElementById("comment-section");
const backButton = document.getElementById("back-button");
const exploreBtn = document.getElementById("explore-btn");
const heroSection = document.getElementById("hero");

let selectedMovie = null;

// On page load, pre-fill and lock the nickname if a username exists
document.addEventListener("DOMContentLoaded", () => {
  const storedUsername = localStorage.getItem("username");
  if (storedUsername) {
    nicknameInput.value = storedUsername;
    nicknameInput.disabled = true;
  }
});

// Function to sort top-level comments by like count (descending)
function sortTopLevelComments() {
  const comments = Array.from(commentsContainer.children);
  comments.sort((a, b) => {
    const likeA = parseInt(a.querySelector(".like-btn").innerText.split(" ")[1]);
    const likeB = parseInt(b.querySelector(".like-btn").innerText.split(" ")[1]);
    return likeB - likeA;
  });
  comments.forEach(comment => commentsContainer.appendChild(comment));
}

// Fetch movies from TMDb (default: popular)
async function fetchMovies(query = "popular") {
  const url = `https://api.themoviedb.org/3/movie/${query}?api_key=${API_KEY}&language=en-US&page=1`;
  const response = await fetch(url);
  const data = await response.json();
  displayMovies(data.results);
}

// Display movie cards
function displayMovies(movies) {
  movieList.innerHTML = "";
  movies.forEach(movie => {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");
    movieCard.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
      <p>${movie.title}</p>
    `;
    movieCard.addEventListener("click", () => {
      openMovie(movie);
    });
    movieList.appendChild(movieCard);
  });
}

// Open movie details and comments
function openMovie(movie) {
  selectedMovie = movie.title;
  movieTitle.innerText = `Comments for: ${movie.title}`;
  moviePoster.src = `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
  movieOverview.innerText = movie.overview;
  // Load stored comments (if any)
  commentsContainer.innerHTML = localStorage.getItem(movie.title) || "";
  
  // Set comment section background to the movie poster with a dark overlay
  commentSection.style.background = `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url('https://image.tmdb.org/t/p/w500${movie.poster_path}') no-repeat center center/cover`;
  
  document.getElementById("movie-container").style.display = "none";
  commentSection.style.display = "block";
  document.body.style.overflow = "hidden"; // Lock background scrolling
}

// Back button: return to movie list
backButton.addEventListener("click", () => {
  commentSection.style.display = "none";
  document.getElementById("movie-container").style.display = "block";
  document.body.style.overflow = "auto"; // Restore scrolling
});

// Create a comment element with actions and reply section
function createCommentElement(nickname, text) {
  const commentDiv = document.createElement("div");
  commentDiv.classList.add("comment");
  // Set initial user action attribute (none)
  commentDiv.setAttribute("data-user-action", "");
  
  // Comment header with nickname
  const header = document.createElement("div");
  header.classList.add("comment-header");
  const nicknameSpan = document.createElement("span");
  nicknameSpan.classList.add("comment-nickname");
  nicknameSpan.innerText = nickname;
  header.appendChild(nicknameSpan);

  // Comment content
  const commentContent = document.createElement("div");
  commentContent.classList.add("comment-content");
  const p = document.createElement("p");
  p.classList.add("comment-text");
  p.innerText = text;
  commentContent.appendChild(p);

  // Action buttons: like, dislike, reply
  const actions = document.createElement("div");
  actions.classList.add("comment-actions");
  const likeBtn = document.createElement("button");
  likeBtn.classList.add("like-btn");
  likeBtn.innerText = "👍 0";
  const dislikeBtn = document.createElement("button");
  dislikeBtn.classList.add("dislike-btn");
  dislikeBtn.innerText = "👎 0";
  const replyBtn = document.createElement("button");
  replyBtn.classList.add("reply-btn");
  replyBtn.innerText = "Reply";
  actions.append(likeBtn, dislikeBtn, replyBtn);

  // Reply form with required nickname for reply
  const replyForm = document.createElement("div");
  replyForm.classList.add("reply-form");
  const replyNickname = document.createElement("input");
  replyNickname.setAttribute("type", "text");
  replyNickname.classList.add("reply-nickname");
  replyNickname.setAttribute("placeholder", "Your nickname");
  // Pre-fill and lock reply nickname if username exists
  const storedUsername = localStorage.getItem("username");
  if (storedUsername) {
    replyNickname.value = storedUsername;
    replyNickname.disabled = true;
  }
  const replyTextarea = document.createElement("textarea");
  replyTextarea.setAttribute("placeholder", "Write a reply...");
  const postReplyBtn = document.createElement("button");
  postReplyBtn.classList.add("post-reply-btn");
  postReplyBtn.innerText = "Post Reply";
  replyForm.append(replyNickname, replyTextarea, postReplyBtn);

  // Container for nested replies
  const repliesContainer = document.createElement("div");
  repliesContainer.classList.add("replies");

  commentDiv.append(header, commentContent, actions, replyForm, repliesContainer);
  return commentDiv;
}

// Save comments to localStorage for the selected movie
function updateStorage() {
  localStorage.setItem(selectedMovie, commentsContainer.innerHTML);
}

// Event delegation for comment actions
commentsContainer.addEventListener("click", (e) => {
  const target = e.target;
  // Like button logic
  if (target.classList.contains("like-btn")) {
    const commentEl = target.closest(".comment");
    let currentAction = commentEl.getAttribute("data-user-action") || "";
    let likeCount = parseInt(target.innerText.split(" ")[1]);
    const dislikeBtn = commentEl.querySelector(".dislike-btn");
    let dislikeCount = parseInt(dislikeBtn.innerText.split(" ")[1]);
    
    if (currentAction === "like") {
      // Toggle off like
      likeCount -= 1;
      target.innerText = `👍 ${likeCount}`;
      commentEl.setAttribute("data-user-action", "");
    } else if (currentAction === "dislike") {
      // Remove dislike, add like
      dislikeCount -= 1;
      dislikeBtn.innerText = `👎 ${dislikeCount}`;
      likeCount += 1;
      target.innerText = `👍 ${likeCount}`;
      commentEl.setAttribute("data-user-action", "like");
    } else {
      // No action yet, add like
      likeCount += 1;
      target.innerText = `👍 ${likeCount}`;
      commentEl.setAttribute("data-user-action", "like");
    }
    updateStorage();
    // If this is a top-level comment, sort all top-level comments
    if (commentEl.parentElement.id === "comments-container") {
      sortTopLevelComments();
    }
  }
  // Dislike button logic
  else if (target.classList.contains("dislike-btn")) {
    const commentEl = target.closest(".comment");
    let currentAction = commentEl.getAttribute("data-user-action") || "";
    let dislikeCount = parseInt(target.innerText.split(" ")[1]);
    const likeBtn = commentEl.querySelector(".like-btn");
    let likeCount = parseInt(likeBtn.innerText.split(" ")[1]);
    
    if (currentAction === "dislike") {
      // Toggle off dislike
      dislikeCount -= 1;
      target.innerText = `👎 ${dislikeCount}`;
      commentEl.setAttribute("data-user-action", "");
    } else if (currentAction === "like") {
      // Remove like, add dislike
      likeCount -= 1;
      likeBtn.innerText = `👍 ${likeCount}`;
      dislikeCount += 1;
      target.innerText = `👎 ${dislikeCount}`;
      commentEl.setAttribute("data-user-action", "dislike");
    } else {
      // No action yet, add dislike
      dislikeCount += 1;
      target.innerText = `👎 ${dislikeCount}`;
      commentEl.setAttribute("data-user-action", "dislike");
    }
    updateStorage();
    if (commentEl.parentElement.id === "comments-container") {
      sortTopLevelComments();
    }
  }
  // Toggle reply form
  else if (target.classList.contains("reply-btn")) {
    const replyForm = target.parentElement.nextElementSibling;
    replyForm.style.display = replyForm.style.display === "flex" ? "none" : "flex";
  }
  // Post a reply
  else if (target.classList.contains("post-reply-btn")) {
    const replyForm = target.parentElement;
    const replyNicknameInput = replyForm.querySelector(".reply-nickname");
    const replyNickname = replyNicknameInput.value.trim();
    const replyTextarea = replyForm.querySelector("textarea");
    const replyText = replyTextarea.value.trim();
    if (!replyNickname) {
      alert("Please enter your nickname for the reply.");
      return;
    }
    if (replyText) {
      const replyComment = createCommentElement(replyNickname, replyText);
      const parentComment = replyForm.parentElement;
      const repliesContainer = parentComment.querySelector(".replies");
      repliesContainer.appendChild(replyComment);
      replyForm.style.display = "none";
      replyTextarea.value = "";
      updateStorage();
    }
  }
});

// Post a new top-level comment
postCommentBtn.addEventListener("click", () => {
  let nickname;
  if (nicknameInput.disabled) {
    nickname = nicknameInput.value;
  } else {
    nickname = nicknameInput.value.trim();
    if (!nickname) {
      alert("Please enter your nickname.");
      return;
    }
    localStorage.setItem("username", nickname);
    nicknameInput.disabled = true;
  }
  const commentText = commentInput.value.trim();
  if (commentText) {
    const commentEl = createCommentElement(nickname, commentText);
    commentsContainer.appendChild(commentEl);
    commentInput.value = "";
    updateStorage();
    sortTopLevelComments();
  }
});

// Search movies by query and hide the hero section once searching
searchBar.addEventListener("input", async (e) => {
  const query = e.target.value.trim();
  if (query.length > 0) {
    heroSection.style.display = "none";
  }
  if (query.length > 2) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`;
    const response = await fetch(url);
    const data = await response.json();
    displayMovies(data.results);
  }
});

// Explore button: Scroll to movie list and hide hero
exploreBtn.addEventListener("click", () => {
  heroSection.style.display = "none";
  document.getElementById("movie-container").scrollIntoView({ behavior: "smooth" });
});

// Load popular movies on startup
fetchMovies();