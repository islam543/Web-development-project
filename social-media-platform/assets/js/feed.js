 
requireAuth();
const me = getCurrentUser();
buildSidebar("feed");
 
// ── Composer ───────────────────────────────────────────────────
(function initComposer() {
  const bg   = avatarGradient(me.id);
  const wrap = document.getElementById("composerWrap");
  if (!wrap) return;
 
  wrap.innerHTML = `
    <div class="composer-avatar" style="background:${bg}"></div>
    <div class="composer-body">
      <textarea class="composer-input" id="postInput" placeholder="What is happening?!" rows="1" maxlength="280"></textarea>
      <div class="composer-actions">
        <div class="composer-tools">
          <button type="button" class="composer-tool-btn" title="Media">
            <svg viewBox="0 0 24 24"><path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"/></svg>
          </button>
          <button type="button" class="composer-tool-btn" title="Emoji">
            <svg viewBox="0 0 24 24"><path d="M8 9.5C8 8.119 8.672 7 9.5 7S11 8.119 11 9.5 10.328 12 9.5 12 8 10.881 8 9.5zm6.5 2.5c.828 0 1.5-1.119 1.5-2.5S15.328 7 14.5 7 13 8.119 13 9.5s.672 2.5 1.5 2.5zM12 16c-2.224 0-3.021-2.227-3.051-2.316l-1.897.633c.05.15 1.271 3.683 4.949 3.683s4.898-3.533 4.949-3.683l-1.896-.638c-.033.095-.83 2.321-3.054 2.321zm10.25-4.001c0 5.652-4.598 10.25-10.25 10.25S1.75 17.652 1.75 12 6.348 1.75 12 1.75 22.25 6.348 22.25 12zm-2 0c0-4.549-3.701-8.25-8.25-8.25S3.75 7.451 3.75 12s3.701 8.25 8.25 8.25 8.25-3.701 8.25-8.25z"/></svg>
          </button>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:13px;color:var(--color-text-secondary);" id="charCount">280</span>
          <button type="button" class="composer-submit" id="submitPost" disabled>Post</button>
        </div>
      </div>
    </div>`;
 
  const textarea  = document.getElementById("postInput");
  const charCount = document.getElementById("charCount");
  const submitBtn = document.getElementById("submitPost");
 
  textarea.addEventListener("input", () => {
    const left = 280 - textarea.value.length;
    charCount.textContent = left;
    charCount.style.color = left < 20 ? (left < 0 ? "#f4212e" : "#ffad1f") : "var(--color-text-secondary)";
    submitBtn.disabled    = !textarea.value.trim() || left < 0;
  });
 
  submitBtn.addEventListener("click", () => {
    const content = textarea.value.trim();
    if (!content) return;
    createPost(me.id, content);
    textarea.value    = "";
    charCount.textContent = "280";
    submitBtn.disabled = true;
    renderFeed();
  });
})();
 
// ── Feed ───────────────────────────────────────────────────────
function renderFeed() {
  const posts = getFeedPosts(me.id);
  const el    = document.getElementById("postsContainer");
  if (!el) return;
  if (!posts.length) {
    el.innerHTML = `<div class="empty-state">
      <h3>Welcome! 👋</h3>
      <p>Follow someone to see their posts, or write your first post above.</p>
    </div>`;
    return;
  }
  el.innerHTML = posts.map(p => renderPost(p, me)).join("");
}
 
// ── Right sidebar ──────────────────────────────────────────────
function renderRightSidebar() {
  const el = document.getElementById("rightPanel");
  if (!el) return;
 
  const suggestions = getUsers()
    .filter(u => u.id !== me.id && !isFollowing(me.id, u.id))
    .slice(0, 5);
 
  const followHtml = suggestions.length
    ? suggestions.map(u => `
        <div class="follow-item">
          <div class="follow-avatar" style="background:${avatarGradient(u.id)}"></div>
          <div class="follow-info">
            <a href="profile.html?id=${u.id}" class="follow-name">${escapeHtml(u.name)}</a>
            <div class="follow-handle">@${escapeHtml(u.username)}</div>
          </div>
          <button class="btn-follow" data-uid="${u.id}">Follow</button>
        </div>`).join("")
    : `<p style="padding:12px 16px;font-size:14px;color:var(--color-text-secondary)">No suggestions right now.</p>`;
 
  el.innerHTML = `
    <div class="search-box">
      <div class="search-input-wrapper">
        <svg viewBox="0 0 24 24"><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"/></svg>
        <input type="text" class="search-input" placeholder="Search" />
      </div>
    </div>
    <div class="sidebar-box">
      <div class="sidebar-box-header">Who to follow</div>
      ${followHtml}
      <div class="sidebar-box-footer"><a href="#">Show more</a></div>
    </div>
    <div class="right-footer">
      <div class="right-footer-links">
        <a href="#">Terms of Service</a><a href="#">Privacy Policy</a>
        <a href="#">Cookie Policy</a><a href="#">© 2026 X Corp.</a>
      </div>
    </div>`;
 
  // Follow buttons
  el.querySelectorAll(".btn-follow[data-uid]").forEach(btn => {
    btn.addEventListener("click", () => {
      toggleFollow(me.id, btn.dataset.uid);
      renderFeed();
      renderRightSidebar();
    });
  });
}
 
renderFeed();
renderRightSidebar();