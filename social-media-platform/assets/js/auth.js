const registerForm = document.getElementById("registerForm");
if (registerForm) {
  redirectIfLoggedIn();
  registerForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const name     = document.getElementById("regName").value.trim();
    const username = document.getElementById("regUsername").value.trim();
    const email    = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;
    if (!name || !username || !email || !password) return showFormError(this, "All fields are required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showFormError(this, "Enter a valid email.");
    if (password.length < 6)          return showFormError(this, "Password must be 6+ characters.");
    if (getUserByEmail(email))         return showFormError(this, "Email already registered.");
    if (getUserByUsername(username))   return showFormError(this, "Username already taken.");
    const user = { id:"u_"+Date.now(), name, username, email, password, bio:"", profilePic:"", following:[], timestamp:Date.now() };
    const users = getUsers(); users.push(user); saveUsers(users);
    setSession(user.id);
    window.location.href = "feed.html";
  });
}
 
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  redirectIfLoggedIn();
  loginForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const identifier = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password   = document.getElementById("loginPassword").value;
    const user = getUserByEmail(identifier) || getUserByUsername(identifier);
    if (!user || user.password !== password) return showFormError(this, "Incorrect credentials.");
    setSession(user.id);
    window.location.href = "feed.html";
  });
}