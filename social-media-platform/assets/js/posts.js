// Post-related functions

// Load single post view
function loadPostView() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (!postId) {
        window.location.href = 'feed.html';
        return;
    }
    
    const posts = getAllPosts();
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
        showToast('Post not found', 'error');
        setTimeout(() => window.location.href = 'feed.html', 1500);
        return;
    }
    
    const currentUser = getCurrentUser();
    const author = getUserById(post.userId);
    
    if (!author) return;
    
    // Update page title
    document.title = `${author.username} on X: "${post.content.substring(0, 50)}..."`;
    
    // Render post detail
    renderPostDetail(post, author, currentUser);
    
    // Render comments
    renderComments(post.comments || []);
    
    // Setup reply composer
    setupReplyComposer(postId);
}

// Render post detail
function renderPostDetail(post, author, currentUser) {
    const postDetailContainer = document.getElementById('postDetail');
    if (!postDetailContainer) return;
    
    const isLiked = post.likes && post.likes.includes(currentUser.id);
    const likeCount = post.likes ? post.likes.length : 0;
    const authorHandle = `@${author.username.toLowerCase().replace(/\s/g, '')}`;
    const profilePic = author.profilePic || `https://ui-avatars.com/api/?background=1d9bf0&color=fff&bold=true&name=${author.username.charAt(0)}`;
    
    postDetailContainer.innerHTML = `
        <div class="post-detail">
            <div class="post-detail-header">
                <img class="post-detail-avatar" src="${profilePic}" alt="${author.username}">
                <div>
                    <div class="post-detail-author-name">${escapeHtml(author.username)}</div>
                    <div class="post-detail-author-handle">${escapeHtml(authorHandle)}</div>
                </div>
            </div>
            <div class="post-detail-content">${escapeHtml(post.content)}</div>
            <div class="post-detail-meta">
                <span>${new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>·</span>
                <span>${new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div class="post-detail-stats">
                <div class="post-detail-stat"><strong>${post.likes?.length || 0}</strong> Likes</div>
                <div class="post-detail-stat"><strong>${post.comments?.length || 0}</strong> Replies</div>
            </div>
            <div class="post-detail-actions">
                <button class="post-detail-action-btn" id="detailCommentBtn" title="Reply">
                    <svg viewBox="0 0 24 24" width="22" height="22">
                        <path fill="currentColor" d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01z"/>
                    </svg>
                </button>
                <button class="post-detail-action-btn ${isLiked ? 'liked' : ''}" id="detailLikeBtn" title="Like">
                    <svg viewBox="0 0 24 24" width="22" height="22">
                        <path fill="currentColor" d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91z"/>
                    </svg>
                </button>
                ${post.userId === currentUser.id ? `
                    <button class="post-detail-action-btn" id="detailDeleteBtn" title="Delete">
                        <svg viewBox="0 0 24 24" width="22" height="22">
                            <path fill="currentColor" d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.12 2 8 3.12 8 4.5V6H4v2h1.5v11c0 1.38 1.12 2.5 2.5 2.5h8c1.38 0 2.5-1.12 2.5-2.5V8H20V6h-4zm-6-1.5c0-.28.22-.5.5-.5h3c.28 0 .5.22.5.5V6h-4V4.5z"/>
                        </svg>
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('detailLikeBtn')?.addEventListener('click', () => toggleLike(post.id));
    document.getElementById('detailCommentBtn')?.addEventListener('click', () => {
        document.getElementById('replyInput')?.focus();
    });
    document.getElementById('detailDeleteBtn')?.addEventListener('click', () => deletePost(post.id));
}

// Render comments
function renderComments(comments) {
    const commentsContainer = document.getElementById('commentsContainer');
    if (!commentsContainer) return;
    
    if (!comments || comments.length === 0) {
        commentsContainer.innerHTML = `
            <div class="empty-state">
                <p>No replies yet. Be the first to reply!</p>
            </div>
        `;
        return;
    }
    
    commentsContainer.innerHTML = comments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(comment => renderComment(comment))
        .join('');
}

// Render single comment
function renderComment(comment) {
    const author = getUserById(comment.userId);
    if (!author) return '';
    
    const authorHandle = `@${author.username.toLowerCase().replace(/\s/g, '')}`;
    const profilePic = author.profilePic || `https://ui-avatars.com/api/?background=1d9bf0&color=fff&bold=true&name=${author.username.charAt(0)}`;
    
    return `
        <div class="comment-card" data-comment-id="${comment.id}">
            <img class="comment-avatar" src="${profilePic}" alt="${author.username}">
            <div class="comment-body">
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(author.username)}</span>
                    <span class="comment-handle">${escapeHtml(authorHandle)}</span>
                    <span class="post-separator">·</span>
                    <span class="comment-time">${formatDate(comment.createdAt)}</span>
                </div>
                <div class="comment-text">${escapeHtml(comment.content)}</div>
            </div>
        </div>
    `;
}

// Setup reply composer
function setupReplyComposer(postId) {
    const replyBtn = document.getElementById('replyBtn');
    const replyInput = document.getElementById('replyInput');
    
    if (replyBtn) {
        replyBtn.addEventListener('click', () => addReply(postId));
    }
    
    if (replyInput) {
        replyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addReply(postId);
            }
        });
    }
}

// Add reply to post
function addReply(postId) {
    const replyInput = document.getElementById('replyInput');
    const content = replyInput?.value.trim();
    const currentUser = getCurrentUser();
    
    if (!content) {
        showToast('Please write a reply', 'error');
        return;
    }
    
    const posts = getAllPosts();
    const post = posts.find(p => p.id === postId);
    
    if (post) {
        if (!post.comments) post.comments = [];
        
        const newComment = {
            id: Date.now().toString(),
            userId: currentUser.id,
            username: currentUser.username,
            content: content,
            createdAt: new Date().toISOString()
        };
        
        post.comments.push(newComment);
        savePosts(posts);
        
        replyInput.value = '';
        showToast('Reply added!', 'success');
        
        // Reload post view
        loadPostView();
    }
}

// Toggle like on post
function toggleLike(postId) {
    const posts = getAllPosts();
    const post = posts.find(p => p.id === postId);
    const currentUser = getCurrentUser();
    
    if (post) {
        if (!post.likes) post.likes = [];
        
        const likedIndex = post.likes.indexOf(currentUser.id);
        if (likedIndex === -1) {
            post.likes.push(currentUser.id);
            showToast('Post liked!', 'success');
        } else {
            post.likes.splice(likedIndex, 1);
            showToast('Post unliked', 'success');
        }
        
        savePosts(posts);
        
        // Reload post view
        loadPostView();
    }
}

// Delete post
function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        const posts = getAllPosts();
        const filteredPosts = posts.filter(p => p.id !== postId);
        savePosts(filteredPosts);
        
        showToast('Post deleted', 'success');
        setTimeout(() => window.location.href = 'feed.html', 1000);
    }
}

// Initialize post page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('post.html')) {
        loadPostView();
    }
});