var PULSE_ICON = '<svg viewBox="0 0 24 24" fill="var(--color-brand-primary)" style="width:28px;height:28px"><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/></svg>';
 
// ── Safe avatar helper ─────────────────────────────────────────
function makeAvatar(user, size) {
  size = size || 40;
  var bg = avatarGradient(user.id);
  var letter = user.name[0].toUpperCase();
  var inner = (user.profilePic && user.profilePic.length > 0)
    ? '<img src="' + user.profilePic + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.parentNode.innerHTML=\'' + letter + '\'">'
    : letter;
  return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + bg
    + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;'
    + 'font-weight:700;font-size:' + Math.round(size * 0.38) + 'px;color:#fff;">'
    + inner + '</div>';
}
 
// ── Sidebar ────────────────────────────────────────────────────
function buildSidebar(activePage) {
  var el = document.getElementById("appSidebar");
  if (!el) return;
  var me = getCurrentUser();
  if (!me) return;
  var postCount = getPostsByUser(me.id).length;
  var bg = avatarGradient(me.id);
 
  var feedActive    = activePage === 'feed'    ? ' active' : '';
  var profileActive = activePage === 'profile' ? ' active' : '';
 
  el.innerHTML =
    '<div class="sidebar-logo"><a href="feed.html">' + PULSE_ICON + '</a></div>'
    + '<nav class="sidebar-nav">'
    + '<a href="feed.html" class="nav-item' + feedActive + '">'
    + '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21.591 7.146L12.52 1.157c-.316-.21-.724-.21-1.04 0l-9.071 5.99c-.26.173-.409.456-.409.757v13.183c0 .502.418.913.929.913h6.638c.511 0 .929-.41.929-.913v-7.075h3.008v7.075c0 .502.418.913.929.913h6.638c.511 0 .929-.41.929-.913V7.904c0-.301-.158-.584-.409-.758z"/></svg>'
    + '<span>Home</span></a>'
    + '<a href="profile.html?id=' + me.id + '" class="nav-item' + profileActive + '">'
    + '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z"/></svg>'
    + '<span>Profile</span></a>'
    + '</nav>'
    + '<a href="feed.html" class="nav-post-btn"><span>Pulse it</span></a>'
    + '<a href="profile.html?id=' + me.id + '" class="sidebar-profile">'
    + makeAvatar(me, 40)
    + '<div class="sidebar-profile-info">'
    + '<div class="sidebar-profile-name">' + escapeHtml(me.name) + '</div>'
    + '<div class="sidebar-profile-handle">@' + escapeHtml(me.username) + ' &middot; ' + postCount + ' pulses</div>'
    + '</div></a>'
    + '<button id="logoutBtn" style="margin:8px;width:calc(100% - 16px);background:transparent;'
    + 'border:1px solid var(--color-border);color:var(--color-text-secondary);border-radius:var(--radius-full);'
    + 'padding:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font-family);'
    + 'transition:all .15s;" onmouseover="this.style.borderColor=\'var(--color-danger)\';this.style.color=\'var(--color-danger)\'"'
    + ' onmouseout="this.style.borderColor=\'var(--color-border)\';this.style.color=\'var(--color-text-secondary)\'">Log out</button>';
 
  document.getElementById("logoutBtn").addEventListener("click", logoutUser);
}
 
// ── Vibe bar ───────────────────────────────────────────────────
function vibeBarHTML(post, me) {
  var myVibe = getUserVibe(post, me.id);
  var counts = getVibeCounts(post);
  var total  = getTotalVibes(post);
  var topV   = getTopVibe(post);
 
  var pills = SMP.vibes.map(function(e) {
    var n      = counts[e];
    var active = myVibe === e;
    return '<button class="vibe-btn" data-id="' + post.id + '" data-emoji="' + e + '"'
      + ' style="background:' + (active ? 'var(--color-brand-glow)' : 'transparent') + ';'
      + 'border:1px solid ' + (active ? 'var(--color-brand-primary)' : 'var(--color-border)') + ';'
      + 'border-radius:var(--radius-full);padding:3px 10px;font-size:13px;cursor:pointer;'
      + 'display:inline-flex;align-items:center;gap:4px;'
      + 'color:' + (active ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)') + ';"'
      + ' onclick="event.stopPropagation()">'
      + e + (n > 0 ? '<span style="font-size:11px">' + n + '</span>' : '')
      + '</button>';
  }).join('');
 
  var summary = total > 0
    ? '<span style="font-size:11px;color:var(--color-text-secondary);margin-left:4px;">'
      + total + ' vibe' + (total !== 1 ? 's' : '')
      + (topV ? ' &middot; ' + topV.emoji : '') + '</span>'
    : '';
 
  return '<div class="vibe-bar" style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px;align-items:center;">'
    + pills + summary + '</div>';
}
 
// ── Comment inline HTML ────────────────────────────────────────
function commentInlineHTML(c, postId, me) {
  var ca = getUserById(c.authorId);
  if (!ca) return '';
  var bg = avatarGradient(ca.id);
  var delBtn = c.authorId === me.id
    ? '<button class="del-cmt-btn" data-post="' + postId + '" data-cmt="' + c.id + '"'
      + ' onclick="event.stopPropagation()"'
      + ' style="margin-left:auto;background:none;border:none;color:var(--color-text-secondary);cursor:pointer;font-size:12px;">&#10005;</button>'
    : '';
  return '<div class="comment-card" id="cmt-' + c.id + '" style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid var(--color-border);">'
    + '<div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;background:' + bg
    + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#fff;">'
    + ca.name[0].toUpperCase() + '</div>'
    + '<div style="flex:1;min-width:0;">'
    + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'
    + '<span style="font-weight:700;font-size:13px;">' + escapeHtml(ca.name) + '</span>'
    + '<span style="color:var(--color-text-secondary);font-size:12px;">@' + escapeHtml(ca.username) + '</span>'
    + '<span style="color:var(--color-text-secondary);">&middot;</span>'
    + '<span style="color:var(--color-text-secondary);font-size:12px;">' + formatTime(c.timestamp) + '</span>'
    + delBtn + '</div>'
    + '<div style="font-size:13px;margin-top:2px;">' + escapeHtml(c.text) + '</div>'
    + '</div></div>';
}
 
// ── Post card ──────────────────────────────────────────────────
function renderPost(post, me) {
  var author = getUserById(post.authorId);
  if (!author) return '';
  var isOwn = post.authorId === me.id;
  var commentsList = (post.comments || []).map(function(c) {
    return commentInlineHTML(c, post.id, me);
  }).join('');
 
  var expiryBadge = post.expiresAt
    ? '<span class="expiry-badge">&#9203; ' + expiryLabel(post) + '</span>'
    : '';
 
  var delBtn = isOwn
    ? '<button class="del-post-btn" data-id="' + post.id + '" onclick="event.stopPropagation()"'
      + ' style="margin-left:auto;background:none;border:none;color:var(--color-text-secondary);'
      + 'cursor:pointer;padding:2px 6px;border-radius:50%;font-size:14px;line-height:1;"'
      + ' onmouseover="this.style.color=\'var(--color-danger)\'" onmouseout="this.style.color=\'var(--color-text-secondary)\'">&#10005;</button>'
    : '';
 
  return '<article class="post-card" id="post-' + post.id + '" data-id="' + post.id + '">'
    + '<a href="profile.html?id=' + author.id + '" onclick="event.stopPropagation()" style="text-decoration:none;flex-shrink:0;">'
    + makeAvatar(author, 40) + '</a>'
    + '<div class="post-body">'
    + '<div class="post-header">'
    + '<a href="profile.html?id=' + author.id + '" class="post-author" onclick="event.stopPropagation()">' + escapeHtml(author.name) + '</a>'
    + '<span class="post-handle">@' + escapeHtml(author.username) + '</span>'
    + '<span class="post-separator">&middot;</span>'
    + '<span class="post-time">' + formatTime(post.timestamp) + '</span>'
    + expiryBadge
    + delBtn
    + '</div>'
    + '<div class="post-content">' + escapeHtml(post.content) + '</div>'
    + '<div id="vibebar-' + post.id + '">' + vibeBarHTML(post, me) + '</div>'
    + '<div class="post-actions">'
    + '<button class="post-action comment" data-id="' + post.id + '" onclick="event.stopPropagation()">'
    + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>'
    + '<span class="rcount-' + post.id + '">' + (post.comments || []).length + '</span>'
    + '</button>'
    + '<button class="post-action share" onclick="event.stopPropagation()">'
    + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.12 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>'
    + '</button></div>'
    + '<div id="ci-' + post.id + '" style="display:none;margin-top:8px;border-top:1px solid var(--color-border);padding-top:8px;">'
    + '<div id="ci-list-' + post.id + '">' + commentsList + '</div>'
    + '<div style="display:flex;gap:8px;margin-top:8px;align-items:center;" onclick="event.stopPropagation()">'
    + '<input id="ci-input-' + post.id + '" type="text" placeholder="Reply..." maxlength="280"'
    + ' style="flex:1;background:var(--color-bg-surface);border:1px solid var(--color-border);'
    + 'border-radius:var(--radius-full);padding:8px 14px;color:var(--color-text-primary);'
    + 'font-size:13px;outline:none;font-family:var(--font-family);"'
    + ' onfocus="this.style.borderColor=\'var(--color-brand-primary)\'"'
    + ' onblur="this.style.borderColor=\'var(--color-border)\'"/>'
    + '<button class="submit-comment" data-id="' + post.id + '" onclick="event.stopPropagation()"'
    + ' style="background:var(--color-brand-primary);color:#fff;border:none;border-radius:var(--radius-full);'
    + 'padding:8px 16px;font-weight:700;font-size:13px;cursor:pointer;font-family:var(--font-family);">Reply</button>'
    + '</div></div>'
    + '</div></article>';
}
 
// ── Global click delegation ────────────────────────────────────
document.addEventListener("click", function(e) {
  var me = getCurrentUser();
  if (!me) return;
 
  // Post card → detail page
  var card = e.target.closest(".post-card");
  if (card && !e.target.closest("button") && !e.target.closest("a") && !e.target.closest("input")) {
    window.location.href = "post.html?id=" + card.dataset.id;
    return;
  }
 
  // Vibe
  var vibeBtn = e.target.closest(".vibe-btn");
  if (vibeBtn) {
    setVibe(vibeBtn.dataset.id, me.id, vibeBtn.dataset.emoji);
    var p = getPostById(vibeBtn.dataset.id);
    var bar = document.getElementById("vibebar-" + vibeBtn.dataset.id);
    if (bar && p) bar.innerHTML = vibeBarHTML(p, me);
    return;
  }
 
  // Toggle comment box
  var cBtn = e.target.closest(".post-action.comment");
  if (cBtn && cBtn.dataset.id) {
    var sec = document.getElementById("ci-" + cBtn.dataset.id);
    if (sec) sec.style.display = sec.style.display === "none" ? "block" : "none";
    return;
  }
 
  // Submit comment
  var subCmt = e.target.closest(".submit-comment");
  if (subCmt) {
    var postId = subCmt.dataset.id;
    var input  = document.getElementById("ci-input-" + postId);
    var text   = input ? input.value.trim() : "";
    if (!text) return;
    var c    = addComment(postId, me.id, text);
    var list = document.getElementById("ci-list-" + postId);
    if (list && c) list.insertAdjacentHTML("beforeend", commentInlineHTML(c, postId, me));
    if (input) input.value = "";
    var rc = document.querySelector(".rcount-" + postId);
    if (rc) { var pp = getPostById(postId); if (pp) rc.textContent = pp.comments.length; }
    return;
  }
 
  // Delete comment
  var delC = e.target.closest(".del-cmt-btn");
  if (delC) {
    removeComment(delC.dataset.post, delC.dataset.cmt, me.id);
    var cel = document.getElementById("cmt-" + delC.dataset.cmt);
    if (cel) cel.remove();
    var rc2 = document.querySelector(".rcount-" + delC.dataset.post);
    if (rc2) { var pp2 = getPostById(delC.dataset.post); if (pp2) rc2.textContent = pp2.comments.length; }
    return;
  }
 
  // Delete post
  var delP = e.target.closest(".del-post-btn");
  if (delP) {
    if (!confirm("Delete this pulse?")) return;
    removePost(delP.dataset.id, me.id);
    var pel = document.getElementById("post-" + delP.dataset.id);
    if (pel) pel.remove();
    return;
  }
});