document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const emailOrUser = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    const users = getData(USERS_KEY);

    const user = users.find(u => (u.email === emailOrUser || u.username === emailOrUser) && u.password === pass);

    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        window.location.href = 'feed.html';
    } else {
        alert("Invalid credentials!");
    }
});