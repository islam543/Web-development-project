// ── REGISTER ───────────────────────────────────────────────────
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  redirectIfLoggedIn(); // already logged in → go to feed
 
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
 
    const name     = document.getElementById("regName").value.trim();
    const username = document.getElementById("regUsername").value.trim();
    const email    = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;
 
    // Validation
    if (!name || !username || !email || !password)
      return showFormError(this, "All fields are required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return showFormError(this, "Enter a valid email address.");
    if (password.length < 6)
      return showFormError(this, "Password must be at least 6 characters.");
    if (getUserByEmail(email))
      return showFormError(this, "That email is already registered.");
    if (getUserByUsername(username))
      return showFormError(this, "That username is already taken.");
 
    // Create user
    const user = {
      id:        "u_" + Date.now(),
      name,
      username,
      email,
      password,
      bio:       "",
      profilePic: "",
      following: [],
      timestamp: Date.now(),
    };
 
    const users = getUsers();
    users.push(user);
    saveUsers(users);
 
    // Auto-login then redirect
    setSession(user.id);
    window.location.href = "feed.html";
  });
}
 
// ── LOGIN ──────────────────────────────────────────────────────
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  redirectIfLoggedIn(); // already logged in → go to feed
 
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
 
    const identifier = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password   = document.getElementById("loginPassword").value;
 
    // Find by email OR username
    const user = getUserByEmail(identifier) || getUserByUsername(identifier);
 
    if (!user || user.password !== password)
      return showFormError(this, "Incorrect email/username or password.");
 
    setSession(user.id);
    window.location.href = "feed.html";
  });
}