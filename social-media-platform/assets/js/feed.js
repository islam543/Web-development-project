requireAuth();
var me = getCurrentUser();
buildSidebar("feed");
purgeExpiredPosts();
 
// ── Helper: safe avatar HTML (no template literals) ────────────
function avatarDiv(user, size) {
  size = size || 40;
  var bg = avatarGradient(user.id);
  var inner = (user.profilePic && user.profilePic.length > 0)
    ? '<img src="' + user.profilePic + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.style.display=\'none\'">'
    : '<span style="font-size:' + Math.round(size*0.4) + 'px;font-weight:700;color:#fff;">' + user.name[0].toUpperCase() + '</span>';
  return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + bg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + inner + '</div>';
}
 
// ── Composer ───────────────────────────────────────────────────
var composerWrap = document.getElementById("composerWrap");
if (composerWrap) {
 
  var expiryBtns = '';
  var labels = ['1 hour', '24 hours', '7 days', 'Forever'];
  var msVals  = ['3600000', '86400000', '604800000', ''];
  for (var ei = 0; ei < labels.length; ei++) {
    var isDefault = ei === 3;
    expiryBtns += '<button type="button" class="expiry-btn" data-ms="' + msVals[ei] + '"'
      + ' style="background:' + (isDefault ? 'var(--color-brand-primary)' : 'transparent') + ';'
      + 'color:' + (isDefault ? '#fff' : 'var(--color-text-secondary)') + ';'
      + 'border:1px solid ' + (isDefault ? 'var(--color-brand-primary)' : 'var(--color-border)') + ';'
      + 'border-radius:var(--radius-full);padding:3px 10px;font-size:11px;cursor:pointer;'
      + 'font-weight:600;font-family:var(--font-family);transition:all .15s;">'
      + labels[ei] + '</button>';
  }
 
  composerWrap.innerHTML =
    avatarDiv(me, 40)
    + '<div class="composer-body">'
    + '<textarea class="composer-input" id="postInput" placeholder="What\'s your pulse today?" rows="1" maxlength="280"></textarea>'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap;padding:8px 0 4px;border-top:1px solid var(--color-border);margin-top:6px;">'
    + '<span style="font-size:11px;color:var(--color-text-secondary);align-self:center;margin-right:2px;">&#9203;</span>'
    + expiryBtns
    + '</div>'
    + '<div class="composer-actions">'
    + '<div></div>'
    + '<div style="display:flex;align-items:center;gap:12px;">'
    + '<span id="charCount" style="font-size:12px;color:var(--color-text-secondary);">280</span>'
    + '<button type="button" class="composer-submit" id="submitPost" disabled>Pulse it</button>'
    + '</div></div></div>';
 
  var selectedExpiry = null;
 
  composerWrap.querySelectorAll(".expiry-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      composerWrap.querySelectorAll(".expiry-btn").forEach(function(b) {
        b.style.background  = "transparent";
        b.style.color       = "var(--color-text-secondary)";
        b.style.borderColor = "var(--color-border)";
      });
      this.style.background  = "var(--color-brand-primary)";
      this.style.color       = "#fff";
      this.style.borderColor = "var(--color-brand-primary)";
      selectedExpiry = this.dataset.ms !== "" ? parseInt(this.dataset.ms) : null;
    });
  });
 
  var textarea  = document.getElementById("postInput");
  var charCount = document.getElementById("charCount");
  var submitBtn = document.getElementById("submitPost");
 
  textarea.addEventListener("input", function() {
    var left = 280 - textarea.value.length;
    charCount.textContent = left;
    charCount.style.color = left < 20 ? (left < 0 ? "#ef4444" : "#f59e0b") : "var(--color-text-secondary)";
    submitBtn.disabled = !textarea.value.trim() || left < 0;
  });
 
  submitBtn.addEventListener("click", function() {
    var content = textarea.value.trim();
    if (!content) return;
    createPost(me.id, content, selectedExpiry);
    textarea.value        = "";
    charCount.textContent = "280";
    submitBtn.disabled    = true;
    renderFeed(currentTab);
  });
}
 
// ── Tabs ───────────────────────────────────────────────────────
var currentTab = "following";
 
document.querySelectorAll(".tab-item[data-tab]").forEach(function(tab) {
  tab.addEventListener("click", function(e) {
    e.preventDefault();
    currentTab = tab.dataset.tab;
    document.querySelectorAll(".tab-item").forEach(function(t) { t.classList.remove("active"); });
    tab.classList.add("active");
    renderFeed(currentTab);
  });
});
 
// ── Feed ───────────────────────────────────────────────────────
function renderFeed(tab) {
  purgeExpiredPosts();
  var el = document.getElementById("postsContainer");
  if (!el) return;
 
  var posts;
  if (tab === "discover") {
    posts = getPosts().sort(function(a,b) { return b.timestamp - a.timestamp; });
  } else {
    var user    = getUserById(me.id);
    var visible = [me.id].concat(user && user.following ? user.following : []);
    posts = getPosts()
      .filter(function(p) { return visible.indexOf(p.authorId) !== -1; })
      .sort(function(a,b) { return b.timestamp - a.timestamp; });
  }
 
  if (!posts.length) {
    el.innerHTML = '<div class="empty-state">'
      + '<h3>' + (tab === "discover" ? "No pulses yet" : "Nothing here yet") + '</h3>'
      + '<p>' + (tab === "discover" ? "Be the first to pulse something!" : "Switch to Discover to find people.") + '</p>'
      + '</div>';
    return;
  }
 
  el.innerHTML = posts.map(function(p) { return renderPost(p, me); }).join("");
}
 
// ── Right sidebar ──────────────────────────────────────────────
function renderRightSidebar() {
  var el = document.getElementById("rightPanel");
  if (!el) return;
 
  var suggestions = getUsers().filter(function(u) {
    return u.id !== me.id && !isFollowing(me.id, u.id);
  }).slice(0, 5);
 
  var followRows = suggestions.map(function(u) {
    var bg = avatarGradient(u.id);
    return '<div class="follow-item" id="sug-' + u.id + '">'
      + '<div class="follow-avatar" style="background:' + bg + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;border-radius:50%;">'
      + u.name[0].toUpperCase() + '</div>'
      + '<div class="follow-info">'
      + '<a href="profile.html?id=' + u.id + '" class="follow-name">' + escapeHtml(u.name) + '</a>'
      + '<div class="follow-handle">@' + escapeHtml(u.username) + '</div>'
      + '</div>'
      + '<button class="btn-follow" data-uid="' + u.id + '">Follow</button>'
      + '</div>';
  }).join("");
 
  var noSuggestions = '<p style="padding:12px 16px;font-size:13px;color:var(--color-text-secondary);">No suggestions yet!</p>';
 
  el.innerHTML =
    '<div class="search-box">'
    + '<div class="search-input-wrapper">'
    + '<svg viewBox="0 0 24 24"><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"/></svg>'
    + '<input type="text" class="search-input" placeholder="Search people &amp; posts" id="searchInput"/>'
    + '</div></div>'
    + '<div id="searchResults" style="display:none;"></div>'
    + '<div class="sidebar-box" id="suggestBox">'
    + '<div class="sidebar-box-header">Who to follow</div>'
    + (followRows.length ? followRows : noSuggestions)
    + '<div class="sidebar-box-footer"><span>Use search to discover more</span></div>'
    + '</div>'
    + '<div class="right-footer"><div class="right-footer-links">'
    + '<span>Terms</span><span>Privacy</span><span>&#169; 2026 Asteria</span>'
    + '</div></div>';
 
  el.querySelectorAll(".btn-follow[data-uid]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      toggleFollow(me.id, btn.dataset.uid);
      var row = document.getElementById("sug-" + btn.dataset.uid);
      if (row) row.remove();
      renderFeed(currentTab);
    });
  });
 
  // ── Search ──────────────────────────────────────────────────
  var searchInput   = document.getElementById("searchInput");
  var searchResults = document.getElementById("searchResults");
  var suggestBox    = document.getElementById("suggestBox");
 
  if (!searchInput) return;
 
  searchInput.addEventListener("input", function() {
    var q = this.value.trim().toLowerCase();
 
    if (!q) {
      searchResults.style.display = "none";
      searchResults.innerHTML     = "";
      suggestBox.style.display    = "block";
      renderFeed(currentTab);
      return;
    }
 
    suggestBox.style.display = "none";
 
    // People results
    var matchedUsers = getUsers().filter(function(u) {
      return u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q);
    }).slice(0, 5);
 
    var userRows = matchedUsers.map(function(u) {
      var bg  = avatarGradient(u.id);
      var fol = isFollowing(me.id, u.id);
      return '<a href="profile.html?id=' + u.id + '"'
        + ' style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid var(--color-border);text-decoration:none;"'
        + ' onmouseover="this.style.background=\'var(--color-bg-hover)\'" onmouseout="this.style.background=\'transparent\'">'
        + '<div style="width:36px;height:36px;border-radius:50%;background:' + bg + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff;flex-shrink:0;">'
        + u.name[0].toUpperCase() + '</div>'
        + '<div style="flex:1;min-width:0;">'
        + '<div style="font-weight:700;font-size:13px;color:var(--color-text-primary);">' + escapeHtml(u.name) + '</div>'
        + '<div style="font-size:12px;color:var(--color-text-secondary);">@' + escapeHtml(u.username) + '</div>'
        + '</div>'
        + (fol ? '<span style="font-size:11px;color:var(--color-text-secondary);white-space:nowrap;">Following</span>' : '')
        + '</a>';
    }).join("");
 
    searchResults.style.display = "block";
    searchResults.innerHTML = matchedUsers.length
      ? '<div class="sidebar-box" style="margin-bottom:12px;">'
        + '<div class="sidebar-box-header" style="font-size:14px;">People</div>'
        + userRows + '</div>'
      : "";
 
    // Post results in feed area
    var matchedPosts = getPosts().filter(function(p) {
      var author = getUserById(p.authorId);
      return p.content.toLowerCase().includes(q)
        || (author && (author.username.toLowerCase().includes(q) || author.name.toLowerCase().includes(q)));
    }).sort(function(a,b) { return b.timestamp - a.timestamp; });
 
    var feedEl = document.getElementById("postsContainer");
    if (feedEl) {
      feedEl.innerHTML = matchedPosts.length
        ? matchedPosts.map(function(p) { return renderPost(p, me); }).join("")
        : '<div class="empty-state"><h3>No results</h3><p>Try a different search.</p></div>';
    }
  });
}
 
renderFeed(currentTab);
renderRightSidebar();
