requireAuth();
var me       = getCurrentUser();
var params   = new URLSearchParams(window.location.search);
var targetId = params.get("id") || me.id;
var isOwn    = targetId === me.id;
 
buildSidebar(isOwn ? "profile" : "");
 
function renderProfile() {
  var user = getUserById(targetId);
  if (!user) {
    var ph = document.getElementById("profileHeader");
    if (ph) ph.innerHTML = '<p style="padding:20px">User not found.</p>';
    return;
  }
 
  var bg          = avatarGradient(user.id);
  var posts       = getPostsByUser(targetId);
  var following   = isFollowing(me.id, targetId);
  var allUsers    = getUsers();
  var followers   = allUsers.filter(function(u) { return (u.following || []).indexOf(targetId) !== -1; });
  var followingList = (user.following || []).map(getUserById).filter(Boolean);
 
  document.title = user.name + " (@" + user.username + ") / Pulse";
 
  var hn = document.getElementById("headerName");
  var hc = document.getElementById("headerPostCount");
  if (hn) hn.textContent = user.name;
  if (hc) hc.textContent = posts.length + " pulses";
 
  // Avatar
  var letter      = user.name[0].toUpperCase();
  var avatarInner = (user.profilePic && user.profilePic.length > 0)
    ? '<img src="' + user.profilePic + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.style.display=\'none\'">'
    : '<span style="font-size:36px;font-weight:700;color:#fff;">' + letter + '</span>';
 
  // Action button
  var actionBtn;
  if (isOwn) {
    actionBtn = '<button class="btn btn-outline btn-sm" id="editBtn">Edit profile</button>';
  } else {
    var btnClass = following ? "btn btn-outline btn-sm" : "btn btn-primary btn-sm";
    actionBtn = '<button class="' + btnClass + '" id="followBtn">' + (following ? "Following" : "Follow") + '</button>';
  }
 
  // Bio
  var bioHtml = user.bio ? '<p class="profile-bio">' + escapeHtml(user.bio) + '</p>' : '';
 
  var ph = document.getElementById("profileHeader");
  if (ph) {
    ph.innerHTML =
      '<div class="profile-avatar-wrapper">'
      + '<div class="profile-avatar" style="background:' + bg + ';display:flex;align-items:center;justify-content:center;overflow:hidden;">' + avatarInner + '</div>'
      + '<div class="profile-actions">' + actionBtn + '</div>'
      + '</div>'
      + '<h1 class="profile-name">' + escapeHtml(user.name) + '</h1>'
      + '<div class="profile-handle">@' + escapeHtml(user.username) + '</div>'
      + bioHtml
      + '<div class="profile-meta">'
      + '<span class="profile-meta-item">'
      + '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:var(--color-text-secondary);flex-shrink:0;"><path fill="currentColor" d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v12c0 1.38-1.11 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-12C3 5.12 4.12 4 5.5 4H7zm0 2H5.5c-.27 0-.5.22-.5.5V7h14v-.5c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6zM5 9v9.5c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5V9H5z"/></svg>'
      + 'Joined ' + new Date(user.timestamp).toLocaleDateString("en-US", {month:"long", year:"numeric"})
      + '</span></div>'
      + '<div class="profile-stats">'
      + '<a href="#" id="openFollowing"><span class="profile-stat-count">' + followingList.length + '</span> Following</a>'
      + '<a href="#" id="openFollowers"><span class="profile-stat-count">' + followers.length + '</span> Followers</a>'
      + '</div>';
 
    if (isOwn) {
      document.getElementById("editBtn").addEventListener("click", function() {
        var u = getUserById(me.id);
        document.getElementById("editName").value    = u.name;
        document.getElementById("editBio").value     = u.bio || "";
        document.getElementById("editPicUrl").value  = u.profilePic || "";
        document.getElementById("editSection").style.display = "block";
      });
    } else {
      document.getElementById("followBtn").addEventListener("click", function() {
        toggleFollow(me.id, targetId);
        renderProfile();
      });
    }
 
    document.getElementById("openFollowing").addEventListener("click", function(e) {
      e.preventDefault();
      showUserModal("Following", followingList);
    });
    document.getElementById("openFollowers").addEventListener("click", function(e) {
      e.preventDefault();
      showUserModal("Followers", followers);
    });
  }
 
  // Posts
  var pp = document.getElementById("profilePosts");
  if (pp) {
    if (posts.length) {
      pp.innerHTML = posts.map(function(p) { return renderPost(p, me); }).join("");
    } else {
      pp.innerHTML = '<div class="empty-state"><h3>No pulses yet</h3><p>Nothing here yet.</p></div>';
    }
  }
}
 
// ── User list modal ────────────────────────────────────────────
function showUserModal(title, users) {
  var existing = document.getElementById("userModal");
  if (existing) existing.remove();
 
  var rows = users.map(function(u) {
    var bg = avatarGradient(u.id);
    return '<a href="profile.html?id=' + u.id + '"'
      + ' style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--color-border);text-decoration:none;"'
      + ' onmouseover="this.style.background=\'var(--color-bg-hover)\'" onmouseout="this.style.background=\'transparent\'">'
      + '<div style="width:40px;height:40px;border-radius:50%;flex-shrink:0;background:' + bg
      + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#fff;">'
      + u.name[0].toUpperCase() + '</div>'
      + '<div><div style="font-weight:700;font-size:14px;color:var(--color-text-primary);">' + escapeHtml(u.name) + '</div>'
      + '<div style="font-size:12px;color:var(--color-text-secondary);">@' + escapeHtml(u.username) + '</div></div>'
      + '</a>';
  }).join("");
 
  var content = users.length
    ? rows
    : '<p style="padding:20px;color:var(--color-text-secondary);text-align:center;">Nobody here yet.</p>';
 
  var modal = document.createElement("div");
  modal.id = "userModal";
  modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";
  modal.innerHTML =
    '<div style="background:var(--color-bg-base);border:1px solid var(--color-border);border-radius:var(--radius-lg);width:100%;max-width:440px;max-height:70vh;overflow-y:auto;">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px;border-bottom:1px solid var(--color-border);position:sticky;top:0;background:var(--color-bg-base);">'
    + '<h2 style="font-size:18px;font-weight:700;">' + escapeHtml(title) + '</h2>'
    + '<button onclick="document.getElementById(\'userModal\').remove()" style="background:none;border:none;color:var(--color-text-secondary);cursor:pointer;font-size:20px;">&#10005;</button>'
    + '</div>'
    + content
    + '</div>';
 
  modal.addEventListener("click", function(e) { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}
 
// ── Edit form ──────────────────────────────────────────────────
var editForm = document.getElementById("editForm");
if (editForm) {
  editForm.addEventListener("submit", function(e) {
    e.preventDefault();
    var user    = getUserById(me.id);
    var name    = document.getElementById("editName").value.trim();
    var bio     = document.getElementById("editBio").value.trim();
    var newPass = document.getElementById("editPassword").value;
    var picUrl  = document.getElementById("editPicUrl").value.trim();
    if (!name) return showFormError(this, "Name cannot be empty.");
    if (newPass && newPass.length < 6) return showFormError(this, "Password must be 6+ chars.");
    user.name = name;
    user.bio  = bio;
    if (newPass) user.password   = newPass;
    if (picUrl !== undefined) user.profilePic = picUrl;
    updateUser(user);
    document.getElementById("editSection").style.display = "none";
    renderProfile();
    buildSidebar(isOwn ? "profile" : "");
  });
}
 
var cancelBtn = document.getElementById("cancelEditBtn");
if (cancelBtn) {
  cancelBtn.addEventListener("click", function() {
    document.getElementById("editSection").style.display = "none";
  });
}
 
// ── Right panel ────────────────────────────────────────────────
var rightPanel = document.getElementById("rightPanel");
if (rightPanel) {
  var suggestions = getUsers().filter(function(u) {
    return u.id !== me.id && !isFollowing(me.id, u.id);
  }).slice(0, 4);
 
  var sugRows = suggestions.map(function(u) {
    var bg = avatarGradient(u.id);
    return '<div class="follow-item">'
      + '<div class="follow-avatar" style="background:' + bg + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;border-radius:50%;">' + u.name[0].toUpperCase() + '</div>'
      + '<div class="follow-info">'
      + '<a href="profile.html?id=' + u.id + '" class="follow-name">' + escapeHtml(u.name) + '</a>'
      + '<div class="follow-handle">@' + escapeHtml(u.username) + '</div>'
      + '</div>'
      + '<button class="btn-follow" onclick="toggleFollow(\'' + me.id + '\',\'' + u.id + '\');renderProfile();this.closest(\'.follow-item\').remove();">Follow</button>'
      + '</div>';
  }).join("");
 
  rightPanel.innerHTML =
    '<div class="search-box"><div class="search-input-wrapper">'
    + '<svg viewBox="0 0 24 24"><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"/></svg>'
    + '<input type="text" class="search-input" placeholder="Search Pulse"/>'
    + '</div></div>'
    + (suggestions.length
      ? '<div class="sidebar-box"><div class="sidebar-box-header">You might like</div>' + sugRows + '</div>'
      : '')
    + '<div class="right-footer"><div class="right-footer-links"><a href="#">Terms</a><a href="#">Privacy</a><a href="#">&#169; 2026 Pulse</a></div></div>';
}
 
renderProfile();