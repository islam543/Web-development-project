requireAuth();
const me       = getCurrentUser();
const params   = new URLSearchParams(window.location.search);
const targetId = params.get("id") || me.id;
const isOwn    = targetId === me.id;
 
buildSidebar("profile");
 
// ── Render profile ─────────────────────────────────────────────
function renderProfile() {
  const user = getUserById(targetId);
  if (!user) return;
 
  const bg         = avatarGradient(user.id);
  const posts      = getPostsByUser(targetId);
  const following  = isFollowing(me.id, targetId);
  const followers  = getUsers().filter(u => (u.following || []).includes(targetId)).length;
 
  document.title = `${user.name} (@${user.username}) / X`;
 
  // Header
  const hn = document.getElementById("headerName");
  const hc = document.getElementById("headerPostCount");
  if (hn) hn.textContent = user.name;
  if (hc) hc.textContent = posts.length + " posts";
 
  // Profile header block
  const ph = document.getElementById("profileHeader");
  if (ph) {
    ph.innerHTML = `
      <div class="profile-avatar-wrapper">
        <div class="profile-avatar" style="background:${bg}"></div>
        <div class="profile-actions">
          ${isOwn
            ? `<button class="btn btn-outline btn-sm" id="editBtn">Edit profile</button>`
            : `<button class="btn ${following?"btn-outline":"btn-primary"} btn-sm" id="followBtn">
                 ${following?"Following":"Follow"}
               </button>`}
        </div>
      </div>
      <h1 class="profile-name">${escapeHtml(user.name)}</h1>
      <div class="profile-handle">@${escapeHtml(user.username)}</div>
      ${user.bio ? `<p class="profile-bio">${escapeHtml(user.bio)}</p>` : ""}
      <div class="profile-meta">
        <span class="profile-meta-item">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v12c0 1.38-1.11 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-12C3 5.12 4.12 4 5.5 4H7zm0 2H5.5c-.27 0-.5.22-.5.5V7h14v-.5c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6zM5 9v9.5c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5V9H5z"/></svg>
          Joined ${new Date(user.timestamp).toLocaleDateString("en-US",{month:"long",year:"numeric"})}
        </span>
      </div>
      <div class="profile-stats">
        <span><span class="profile-stat-count">${(user.following||[]).length}</span> Following</span>
        <span><span class="profile-stat-count">${followers}</span> Followers</span>
      </div>`;
 
    if (isOwn) {
      document.getElementById("editBtn").addEventListener("click", () => {
        const es = document.getElementById("editSection");
        if (es) {
          document.getElementById("editName").value = user.name;
          document.getElementById("editBio").value  = user.bio || "";
          es.style.display = "block";
        }
      });
    } else {
      document.getElementById("followBtn").addEventListener("click", function() {
        toggleFollow(me.id, targetId);
        renderProfile();
      });
    }
  }
 
  // Posts
  const pp = document.getElementById("profilePosts");
  if (pp) {
    pp.innerHTML = posts.length
      ? posts.map(p => renderPost(p, me)).join("")
      : `<div class="empty-state"><h3>No posts yet</h3><p>When they post, it'll show up here.</p></div>`;
  }
}
 
// ── Edit form ──────────────────────────────────────────────────
const editForm = document.getElementById("editForm");
if (editForm) {
  editForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const user    = getUserById(me.id);
    const name    = document.getElementById("editName").value.trim();
    const bio     = document.getElementById("editBio").value.trim();
    const newPass = document.getElementById("editPassword").value;
 
    if (!name) return showFormError(this, "Name cannot be empty.");
    if (newPass && newPass.length < 6) return showFormError(this, "Password must be 6+ characters.");
 
    user.name = name;
    user.bio  = bio;
    if (newPass) user.password = newPass;
    updateUser(user);
 
    document.getElementById("editSection").style.display = "none";
    renderProfile();
  });
}
 
const cancelBtn = document.getElementById("cancelEditBtn");
if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    document.getElementById("editSection").style.display = "none";
  });
}
 
// ── Right panel suggestions ────────────────────────────────────
const rightPanel = document.getElementById("rightPanel");
if (rightPanel) {
  const suggestions = getUsers()
    .filter(u => u.id !== me.id && !isFollowing(me.id, u.id))
    .slice(0, 3);
 
  rightPanel.innerHTML = `
    <div class="search-box">
      <div class="search-input-wrapper">
        <svg viewBox="0 0 24 24"><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"/></svg>
        <input type="text" class="search-input" placeholder="Search"/>
      </div>
    </div>
    ${suggestions.length ? `<div class="sidebar-box">
      <div class="sidebar-box-header">You might like</div>
      ${suggestions.map(u => `
        <div class="follow-item">
          <div class="follow-avatar" style="background:${avatarGradient(u.id)}"></div>
          <div class="follow-info">
            <a href="profile.html?id=${u.id}" class="follow-name">${escapeHtml(u.name)}</a>
            <div class="follow-handle">@${escapeHtml(u.username)}</div>
          </div>
          <button class="btn-follow" onclick="toggleFollow('${me.id}','${u.id}');location.reload()">Follow</button>
        </div>`).join("")}
      <div class="sidebar-box-footer"><span>Use search to discover more</span></div>
    </div>` : ""}
    <div class="right-footer"><div class="right-footer-links">
      <span>Terms of Service</span><span>Privacy Policy</span>
      <span>© 2026 Asteria</span>
    </div></div>`;
}
 
renderProfile();
