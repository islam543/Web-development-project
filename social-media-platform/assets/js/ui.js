// ── Sidebar ────────────────────────────────────────────────────
function buildSidebar(activePage) {
  const el = document.getElementById("appSidebar");
  if (!el) return;
  const me = getCurrentUser();
  if (!me) return;
  const bg = avatarGradient(me.id);
 
  el.innerHTML = `
    <div class="sidebar-logo">
      <a href="feed.html">
        <svg class="logo-x-sm" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
    </div>
 
    <nav class="sidebar-nav">
      <a href="feed.html" class="nav-item ${activePage==='feed'?'active':''}">
        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M21.591 7.146L12.52 1.157c-.316-.21-.724-.21-1.04 0l-9.071 5.99c-.26.173-.409.456-.409.757v13.183c0 .502.418.913.929.913h6.638c.511 0 .929-.41.929-.913v-7.075h3.008v7.075c0 .502.418.913.929.913h6.638c.511 0 .929-.41.929-.913V7.904c0-.301-.158-.584-.409-.758z"/></svg>
        <span>Home</span>
      </a>
      <a href="profile.html?id=${me.id}" class="nav-item ${activePage==='profile'?'active':''}">
        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z"/></svg>
        <span>Profile</span>
      </a>
    </nav>
 
    <a href="feed.html" class="nav-post-btn"><span>Post</span></a>
 
    <a href="profile.html?id=${me.id}" class="sidebar-profile">
      <div class="sidebar-profile-avatar" style="background:${bg}"></div>
      <div class="sidebar-profile-info">
        <div class="sidebar-profile-name">${escapeHtml(me.name)}</div>
        <div class="sidebar-profile-handle">@${escapeHtml(me.username)}</div>
      </div>
      <span class="sidebar-profile-more">···</span>
    </a>
 
    <button id="logoutBtn" style="
      margin:8px 12px 16px;width:calc(100% - 24px);
      background:transparent;border:1px solid var(--color-border);
      color:var(--color-text-primary);border-radius:9999px;
      padding:10px;font-size:14px;font-weight:700;cursor:pointer;
      transition:background .15s;">
      Log out
    </button>`;
 
  document.getElementById("logoutBtn").addEventListener("click", logoutUser);
}
 
// ── Post HTML ──────────────────────────────────────────────────
function renderPost(post, me) {
  const author = getUserById(post.authorId);
  if (!author) return "";
  const bg    = avatarGradient(author.id);
  const liked = post.likes.includes(me.id);
  const isOwn = post.authorId === me.id;
 
  return `
    <article class="post-card" id="post-${post.id}" data-id="${post.id}">
      <a href="profile.html?id=${author.id}" class="post-avatar" style="background:${bg}" onclick="event.stopPropagation()"></a>
      <div class="post-body">
        <div class="post-header">
          <a href="profile.html?id=${author.id}" class="post-author" onclick="event.stopPropagation()">${escapeHtml(author.name)}</a>
          <span class="post-handle">@${escapeHtml(author.username)}</span>
          <span class="post-separator">·</span>
          <span class="post-time">${formatTime(post.timestamp)}</span>
          ${isOwn ? `<button class="del-post-btn" data-id="${post.id}" onclick="event.stopPropagation()"
            style="margin-left:auto;background:none;border:none;color:var(--color-text-secondary);cursor:pointer;padding:4px 6px;border-radius:50%;transition:background .15s;"
            title="Delete">✕</button>` : ""}
        </div>
        <div class="post-content">${escapeHtml(post.content)}</div>
        <div class="post-actions">
          <button class="post-action comment" data-id="${post.id}" onclick="event.stopPropagation()">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
            <span>${post.comments.length}</span>
          </button>
          <button class="post-action like ${liked?"liked":""}" data-id="${post.id}" onclick="event.stopPropagation()"
            style="${liked?"color:var(--color-like)":""}">
            <svg viewBox="0 0 24 24" fill="${liked?"var(--color-like)":"currentColor"}"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>
            <span class="like-count">${post.likes.length}</span>
          </button>
          <button class="post-action share" onclick="event.stopPropagation()">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.12 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
          </button>
        </div>
        <!-- Inline comment section -->
        <div class="comment-inline" id="ci-${post.id}" style="display:none;margin-top:8px;border-top:1px solid var(--color-border);padding-top:8px;">
          <div id="ci-list-${post.id}">
            ${post.comments.map(c => renderCommentInline(c, post.id, me)).join("")}
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;align-items:center;">
            <input type="text" id="ci-input-${post.id}" placeholder="Post your reply"
              style="flex:1;background:var(--color-bg-surface);border:1px solid var(--color-border);
              border-radius:9999px;padding:8px 14px;color:var(--color-text-primary);
              font-size:14px;outline:none;" maxlength="280" onclick="event.stopPropagation()"/>
            <button class="submit-comment" data-id="${post.id}" onclick="event.stopPropagation()"
              style="background:var(--color-brand-primary);color:#fff;border:none;border-radius:9999px;
              padding:8px 16px;font-weight:700;font-size:13px;cursor:pointer;">Reply</button>
          </div>
        </div>
      </div>
    </article>`;
}
 
function renderCommentInline(c, postId, me) {
  const ca = getUserById(c.authorId);
  if (!ca) return "";
  const bg = avatarGradient(ca.id);
  return `
    <div class="comment-card" id="cmt-${c.id}" style="padding:8px 0;border-bottom:1px solid var(--color-border);">
      <div class="comment-avatar" style="background:${bg};width:32px;height:32px;border-radius:50%;flex-shrink:0;"></div>
      <div class="comment-body" style="flex:1;min-width:0;">
        <div class="comment-header">
          <span class="comment-author">${escapeHtml(ca.name)}</span>
          <span class="comment-handle">@${escapeHtml(ca.username)}</span>
          <span class="post-separator">·</span>
          <span class="comment-time">${formatTime(c.timestamp)}</span>
          ${c.authorId === me.id ? `<button class="del-cmt-btn" data-post="${postId}" data-cmt="${c.id}" onclick="event.stopPropagation()"
            style="margin-left:auto;background:none;border:none;color:var(--color-text-secondary);cursor:pointer;font-size:14px;">✕</button>` : ""}
        </div>
        <div class="comment-text">${escapeHtml(c.text)}</div>
      </div>
    </div>`;
}
 
// ── Shared event delegation for posts ─────────────────────────
document.addEventListener("click", function (e) {
  const me = getCurrentUser();
  if (!me) return;
 
  // Click post card → go to post detail
  const card = e.target.closest(".post-card");
  if (card && !e.target.closest("button") && !e.target.closest("a") && !e.target.closest("input")) {
    window.location.href = "post.html?id=" + card.dataset.id;
    return;
  }
 
  // Like
  const likeBtn = e.target.closest(".post-action.like");
  if (likeBtn && likeBtn.dataset.id) {
    const postId = likeBtn.dataset.id;
    const likes  = toggleLike(postId, me.id);
    const post   = getPostById(postId);
    if (!post) return;
    const nowLiked = post.likes.includes(me.id);
    likeBtn.querySelector(".like-count").textContent = likes.length;
    likeBtn.style.color = nowLiked ? "var(--color-like)" : "";
    likeBtn.querySelector("svg").setAttribute("fill", nowLiked ? "var(--color-like)" : "currentColor");
    return;
  }
 
  // Toggle comment section
  const commentBtn = e.target.closest(".post-action.comment");
  if (commentBtn && commentBtn.dataset.id) {
    const sec = document.getElementById("ci-" + commentBtn.dataset.id);
    if (sec) sec.style.display = sec.style.display === "none" ? "block" : "none";
    return;
  }
 
  // Submit comment
  const submitCmt = e.target.closest(".submit-comment");
  if (submitCmt) {
    const postId = submitCmt.dataset.id;
    const input  = document.getElementById("ci-input-" + postId);
    const text   = input ? input.value.trim() : "";
    if (!text) return;
    const c    = addComment(postId, me.id, text);
    const list = document.getElementById("ci-list-" + postId);
    if (list && c) list.insertAdjacentHTML("beforeend", renderCommentInline(c, postId, me));
    if (input) input.value = "";
    // update count
    const cBtn = document.querySelector(`.post-action.comment[data-id="${postId}"] span`);
    if (cBtn) { const p = getPostById(postId); if (p) cBtn.textContent = p.comments.length; }
    return;
  }
 
  // Delete comment
  const delCmt = e.target.closest(".del-cmt-btn");
  if (delCmt) {
    removeComment(delCmt.dataset.post, delCmt.dataset.cmt, me.id);
    const el = document.getElementById("cmt-" + delCmt.dataset.cmt);
    if (el) el.remove();
    const cBtn = document.querySelector(`.post-action.comment[data-id="${delCmt.dataset.post}"] span`);
    if (cBtn) { const p = getPostById(delCmt.dataset.post); if (p) cBtn.textContent = p.comments.length; }
    return;
  }
 
  // Delete post
  const delPost = e.target.closest(".del-post-btn");
  if (delPost) {
    if (!confirm("Delete this post?")) return;
    removePost(delPost.dataset.id, me.id);
    const el = document.getElementById("post-" + delPost.dataset.id);
    if (el) el.remove();
    return;
  }
});