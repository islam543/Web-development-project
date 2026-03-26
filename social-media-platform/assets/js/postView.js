requireAuth();
const me     = getCurrentUser();
const params = new URLSearchParams(window.location.search);
const postId = params.get("id");
if (!postId) window.location.href = "feed.html";
 
buildSidebar("");
 
function renderDetail() {
  const post   = getPostById(postId);
  const area   = document.getElementById("postDetailArea");
  if (!post || !area) {
    if (area) area.innerHTML = `<div class="empty-state"><h3>Post not found</h3></div>`;
    return;
  }
 
  const author = getUserById(post.authorId);
  if (!author) return;
  const bg     = avatarGradient(author.id);
  const isOwn  = post.authorId === me.id;
  const d      = new Date(post.timestamp);
 
  area.innerHTML = `
    <div class="post-detail">
      <div class="post-detail-header">
        <a href="profile.html?id=${author.id}" class="post-avatar"
           style="background:${bg};width:48px;height:48px;border-radius:50%;display:block;flex-shrink:0;"></a>
        <div>
          <div class="post-detail-author-name">${escapeHtml(author.name)}</div>
          <div class="post-detail-author-handle">@${escapeHtml(author.username)}</div>
        </div>
        ${isOwn?`<button id="delDetailPost" data-id="${post.id}"
          style="margin-left:auto;background:none;border:none;color:var(--color-text-secondary);
          cursor:pointer;font-size:18px;">✕</button>`:""}
      </div>
 
      <div class="post-detail-content">${escapeHtml(post.content)}</div>
 
      <!-- Vibes on detail page -->
      <div style="padding:12px 0;border-bottom:1px solid var(--color-border);">
        <p style="font-size:13px;color:var(--color-text-secondary);margin-bottom:8px;font-weight:600;">Send a vibe</p>
        <div id="detail-vibebar" style="display:flex;flex-wrap:wrap;gap:6px;">
          ${SMP.vibes.map(e => {
            const myV  = getUserVibe(post, me.id);
            const cnt  = getVibeCounts(post)[e];
            const active = myV === e;
            return `<button class="vibe-btn-detail" data-emoji="${e}"
              style="background:${active?"rgba(29,155,240,0.18)":"var(--color-bg-surface)"};
              border:1px solid ${active?"var(--color-brand-primary)":"var(--color-border)"};
              border-radius:9999px;padding:6px 14px;font-size:16px;cursor:pointer;
              display:inline-flex;align-items:center;gap:6px;color:var(--color-text-primary);
              transition:all .15s;">
              ${e}<span style="font-size:13px;color:var(--color-text-secondary);">${cnt}</span>
            </button>`;
          }).join("")}
        </div>
        <p id="vibe-summary" style="font-size:13px;color:var(--color-text-secondary);margin-top:8px;">
          ${getTotalVibes(post)} vibes total
        </p>
      </div>
 
      <div class="post-detail-meta">
        <span>${d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</span>
        <span>·</span>
        <span>${d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
      </div>
 
      <div class="post-detail-stats">
        <div class="post-detail-stat"><strong id="replyStatCount">${(post.comments||[]).length}</strong> Replies</div>
        <div class="post-detail-stat"><strong id="vibeStatCount">${getTotalVibes(post)}</strong> Vibes</div>
      </div>
 
      <div class="post-detail-actions">
        <button class="post-detail-action-btn" id="toggleReplyComposer" title="Reply">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
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
 
  // Vibe buttons on detail page
  document.querySelectorAll(".vibe-btn-detail").forEach(btn => {
    btn.addEventListener("click", () => {
      setVibe(postId, me.id, btn.dataset.emoji);
      renderDetail(); // full refresh to update counts
    });
  });
 
  // Toggle reply composer
  document.getElementById("toggleReplyComposer").addEventListener("click", () => {
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
 
  el.innerHTML = (post.comments || []).map(c => {
    const ca = getUserById(c.authorId);
    if (!ca) return "";
    const bg = avatarGradient(ca.id);
    return `
      <div class="comment-card" id="rcmt-${c.id}">
        <a href="profile.html?id=${ca.id}" class="comment-avatar" style="background:${bg}"></a>
        <div class="comment-body">
          <div class="comment-header">
            <a href="profile.html?id=${ca.id}" class="comment-author">${escapeHtml(ca.name)}</a>
            <span class="comment-handle">@${escapeHtml(ca.username)}</span>
            <span class="post-separator">·</span>
            <span class="comment-time">${formatTime(c.timestamp)}</span>
            ${c.authorId===me.id?`<button class="del-reply-btn" data-cmt="${c.id}"
              style="margin-left:auto;background:none;border:none;color:var(--color-text-secondary);cursor:pointer;">✕</button>`:""}
          </div>
          <div class="comment-replying-to">Replying to
            <a href="profile.html?id=${post.authorId}">@${escapeHtml(getUserById(post.authorId)?.username||"")}</a>
          </div>
          <div class="comment-text">${escapeHtml(c.text)}</div>
        </div>
      </div>`;
  }).join("") || `<div class="empty-state"><p style="color:var(--color-text-secondary)">No replies yet. Be first!</p></div>`;
 
  // Delete reply buttons
  el.querySelectorAll(".del-reply-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      removeComment(postId, btn.dataset.cmt, me.id);
      renderDetail();
    });
  });
}
 
// ── Reply composer submit ──────────────────────────────────────
// Called after the composer HTML is injected
function initReplyComposer() {
  const submitBtn = document.getElementById("submitReply");
  const replyInput = document.getElementById("replyInput");
  if (!submitBtn || !replyInput) return;
 
  submitBtn.addEventListener("click", () => {
    const text = replyInput.value.trim();
    if (!text) return;
    addComment(postId, me.id, text);
    replyInput.value = "";
    renderDetail();
    // hide composer after posting
    const comp = document.getElementById("replyComposerWrap");
    if (comp) comp.style.display = "none";
  });
 
  // Also allow Enter key
  replyInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitBtn.click();
    }
  });
}
 
renderDetail();
 
// Build reply composer
const me2 = getCurrentUser();
const replyWrap = document.getElementById("replyComposerWrap");
if (me2 && replyWrap) {
  const bg = avatarGradient(me2.id);
  replyWrap.innerHTML = `
    <div class="composer-avatar" style="background:${bg}"></div>
    <div class="composer-body">
      <textarea class="composer-input" id="replyInput" placeholder="Post your reply" rows="1" maxlength="280"></textarea>
      <div class="composer-actions">
        <div></div>
        <button type="button" class="composer-submit" id="submitReply">Reply</button>
      </div>
    </div>`;
  initReplyComposer();
}