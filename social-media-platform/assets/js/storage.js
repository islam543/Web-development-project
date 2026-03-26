// ── Users ──────────────────────────────────────────────────────
function getUsers()           { return JSON.parse(localStorage.getItem(SMP.keys.users))  || []; }
function saveUsers(arr)       { localStorage.setItem(SMP.keys.users, JSON.stringify(arr)); }
function getUserById(id)      { return getUsers().find(u => u.id === id) || null; }
function getUserByEmail(e)    { return getUsers().find(u => u.email === e.toLowerCase()) || null; }
function getUserByUsername(n) { return getUsers().find(u => u.username.toLowerCase() === n.toLowerCase()) || null; }
function updateUser(updated)  { saveUsers(getUsers().map(u => u.id === updated.id ? updated : u)); }
 
// ── Posts ──────────────────────────────────────────────────────
function getPosts()      { return JSON.parse(localStorage.getItem(SMP.keys.posts)) || []; }
function savePosts(arr)  { localStorage.setItem(SMP.keys.posts, JSON.stringify(arr)); }
function getPostById(id) { return getPosts().find(p => p.id === id) || null; }
 
function getPostsByUser(userId) {
  return getPosts().filter(p => p.authorId === userId).sort((a,b) => b.timestamp - a.timestamp);
}
 
function getFeedPosts(currentUserId) {
  const user = getUserById(currentUserId);
  if (!user) return [];
  const visible = [currentUserId, ...(user.following || [])];
  return getPosts().filter(p => visible.includes(p.authorId)).sort((a,b) => b.timestamp - a.timestamp);
}
 
function createPost(authorId, content) {
  const posts = getPosts();
  const post  = { id:"p_"+Date.now(), authorId, content, timestamp:Date.now(), likes:[], comments:[] };
  posts.unshift(post);
  savePosts(posts);
  return post;
}
 
function removePost(postId, userId) {
  const posts = getPosts();
  const post  = posts.find(p => p.id === postId);
  if (!post || post.authorId !== userId) return false;
  savePosts(posts.filter(p => p.id !== postId));
  return true;
}
 
// ── Likes ──────────────────────────────────────────────────────
function toggleLike(postId, userId) {
  const posts = getPosts();
  const post  = posts.find(p => p.id === postId);
  if (!post) return null;
  const idx = post.likes.indexOf(userId);
  if (idx === -1) post.likes.push(userId); else post.likes.splice(idx, 1);
  savePosts(posts);
  return post.likes;
}
 
// ── Comments ───────────────────────────────────────────────────
function addComment(postId, authorId, text) {
  const posts = getPosts();
  const post  = posts.find(p => p.id === postId);
  if (!post) return null;
  const c = { id:"c_"+Date.now(), authorId, text, timestamp:Date.now() };
  post.comments.push(c);
  savePosts(posts);
  return c;
}
 
function removeComment(postId, commentId, userId) {
  const posts = getPosts();
  const post  = posts.find(p => p.id === postId);
  if (!post) return;
  post.comments = post.comments.filter(c => !(c.id === commentId && c.authorId === userId));
  savePosts(posts);
}
 
// ── Follow ─────────────────────────────────────────────────────
function toggleFollow(currentId, targetId) {
  if (currentId === targetId) return false;
  const user = getUserById(currentId);
  if (!user) return false;
  if (!user.following) user.following = [];
  const idx = user.following.indexOf(targetId);
  if (idx === -1) user.following.push(targetId); else user.following.splice(idx, 1);
  updateUser(user);
  return user.following.includes(targetId);
}
 
function isFollowing(currentId, targetId) {
  const user = getUserById(currentId);
  return user ? (user.following || []).includes(targetId) : false;
}
 
// ── Session ────────────────────────────────────────────────────
function getSession()         { return localStorage.getItem(SMP.keys.currentUser); }
function setSession(userId)   { localStorage.setItem(SMP.keys.currentUser, userId); }
function clearSession()       { localStorage.removeItem(SMP.keys.currentUser); }
function getCurrentUser()     { const id = getSession(); return id ? getUserById(id) : null; }
function requireAuth()        { if (!getSession()) { window.location.href = "login.html"; } }
function redirectIfLoggedIn() { if (getSession())  { window.location.href = "feed.html"; } }
function logoutUser()         { clearSession(); window.location.href = "login.html"; }
 
// ── Helpers ────────────────────────────────────────────────────
function formatTime(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)    return diff + "s";
  if (diff < 3600)  return Math.floor(diff / 60) + "m";
  if (diff < 86400) return Math.floor(diff / 3600) + "h";
  return new Date(ts).toLocaleDateString("en-US", { month:"short", day:"numeric" });
}
 
function escapeHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
 
function avatarGradient(str) {
  const p = [
    "linear-gradient(135deg,#1d9bf0,#1a8cd8)",
    "linear-gradient(135deg,#f91880,#e01670)",
    "linear-gradient(135deg,#00ba7c,#00a170)",
    "linear-gradient(135deg,#ffad1f,#e09800)",
    "linear-gradient(135deg,#7856ff,#6844e0)",
    "linear-gradient(135deg,#ff6b35,#e0551f)",
  ];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return p[Math.abs(h) % p.length];
}
 
function showFormError(form, msg) {
  let el = form.querySelector(".form-error-msg");
  if (!el) {
    el = document.createElement("p");
    el.className = "form-error-msg";
    el.style.cssText = "color:#f4212e;font-size:13px;margin:4px 0 8px;";
    const btn = form.querySelector("button[type=submit]");
    if (btn) form.insertBefore(el, btn); else form.appendChild(el);
  }
  el.textContent   = msg;
  el.style.display = "block";
  setTimeout(() => { if (el) el.style.display = "none"; }, 4000);
}