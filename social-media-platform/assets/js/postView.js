requireAuth();
const me     = getCurrentUser();
const params = new URLSearchParams(window.location.search);
const postId = params.get("id");
 
buildSidebar("");
 
if (!postId) window.location.href = "feed.html";
 
function renderDetail() {
  const post = getPostById(postId);
  if (!post) {
    document.getElementById("postDetailArea").innerHTML =
      `<div class="empty-state"><h3>Post not found</h3></div>`;
    return;
  }
 
  const author  = getUserById(post.authorId);
  if (!author) return;
  const bg      = avatarGradient(author.id);
  const liked   = post.likes.includes(me.id);
  const isOwn   = post.authorId === me.id;
  const d       = new Date(post.timestamp);
  const timeStr = d.toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit" });
  const dateStr = d.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
 
  document.getElementById("postDetailArea").innerHTML = `
    <div class="post-detail">
      <div class="post-detail-header">
        <a href="profile.html?id=${author.id}" class="post-avatar"
           style="background:${bg};width:48px;height:48px;border-radius:50%;display:block;flex-shrink:0;"></a>
        <div>
          <div class="post-detail-author-name">${escapeHtml(author.name)}</div>
          <div class="post-detail-author-handle">@${escapeHtml(author.username)}</div>
        </div>
        ${isOwn ? `<button id="delDetailPost"
          style="margin-left:auto;background:none;border:none;color:var(--color-text-secondary);cursor:pointer;font-size:18px;">✕</button>` : ""}
      </div>
      <div class="post-detail-content">${escapeHtml(post.content)}</div>
      <div class="post-detail-meta">
        <span>${timeStr}</span><span>·</span><span>${dateStr}</span>
      </div>
      <div class="post-detail-stats">
        <div class="post-detail-stat"><strong>${post.comments.length}</strong> Replies</div>
        <div class="post-detail-stat"><strong id="likeStatCount">${post.likes.length}</strong> Likes</div>
      </div>
      <div class="post-detail-actions">
        <button class="post-detail-action-btn" id="detailCommentBtn" title="Reply">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
        </button>
        <button class="post-detail-action-btn ${liked?"liked-detail":""}" id="detailLikeBtn"
          style="${liked?"color:var(--color-like)":""}" title="Like">
          <svg viewBox="0 0 24 24"><path fill="${liked?"var(--color-like)":"currentColor"}" d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>
        </button>
        <button class="post-detail-action-btn" title="Share">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.12 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
        </button>
      </div>
    </div>`;
 
  // Delete post
  const delBtn = document.getElementById("delDetailPost");
  if (delBtn) {
    delBtn.addEventListener("click", () => {
      if (!confirm("Delete this post?")) return;
      removePost(postId, me.id);
      window.location.href = "feed.html";
    });
  }
 
  // Like from detail
  document.getElementById("detailLikeBtn").addEventListener("click", function () {
    const likes  = toggleLike(postId, me.id);
    const p      = getPostById(postId);
    const nowL   = p.likes.includes(me.id);
    this.style.color = nowL ? "var(--color-like)" : "";
    this.querySelector("path").setAttribute("fill", nowL ? "var(--color-like)" : "currentColor");
    document.getElementById("likeStatCount").textContent = likes.length;
  });
 
  // Toggle reply composer
  document.getElementById("detailCommentBtn").addEventListener("click", () => {
    const comp = document.getElementById("replyComposerWrap");
    if (comp) comp.style.display = comp.style.display === "none" ? "flex" : "none";
  });
 
  renderReplies();
}
 
function renderReplies() {
  const post = getPostById(postId);
  if (!post) return;
  const el = document.getElementById("repliesContainer");
  if (!el) return;
 
  el.innerHTML = post.comments.map(c => {
    const ca = getUserById(c.authorId);
    if (!ca) return "";
    const cbg = avatarGradient(ca.id);
    return `
      <div class="comment-card" id="cmt-${c.id}">
        <a href="profile.html?id=${ca.id}" class="comment-avatar" style="background:${cbg}"></a>
        <div class="comment-body">
          <div class="comment-header">
            <a href="profile.html?id=${ca.id}" class="comment-author">${escapeHtml(ca.name)}</a>
            <span class="comment-handle">@${escapeHtml(ca.username)}</span>
            <span class="post-separator">·</span>
            <span class="comment-time">${formatTime(c.timestamp)}</span>
            ${c.authorId === me.id
              ? `<button class="del-reply-btn" data-cmt="${c.id}"
                   style="margin-left:auto;background:none;border:none;color:var(--color-text-secondary);cursor:pointer;">✕</button>`
              : ""}
          </div>
          <div class="comment-replying-to">Replying to
            <a href="profile.html?id=${post.authorId}">@${escapeHtml(getUserById(post.authorId)?.username || "")}</a>
          </div>
          <div class="comment-text">${escapeHtml(c.text)}</div>
        </div>
      </div>`;
  }).join("") || `<div class="empty-state"><p style="color:var(--color-text-secondary)">No replies yet.</p></div>`;
 
  // Delete reply buttons
  el.querySelectorAll(".del-reply-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      removeComment(postId, btn.dataset.cmt, me.id);
      renderDetail(); // full re-render to update stats
    });
  });
}
 
// ── Reply composer submit ──────────────────────────────────────
const submitReply = document.getElementById("submitReply");
if (submitReply) {
  submitReply.addEventListener("click", () => {
    const input = document.getElementById("replyInput");
    const text  = input ? input.value.trim() : "";
    if (!text) return;
    addComment(postId, me.id, text);
    if (input) input.value = "";
    renderDetail();
  });
}
 
renderDetail();