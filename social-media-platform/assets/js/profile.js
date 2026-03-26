// Load profile page
function loadProfile() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Update profile header
    const profileName = document.querySelector('.profile-name');
    const profileHandle = document.querySelector('.profile-handle');
    const profileBio = document.querySelector('.profile-bio');
    const profileAvatar = document.querySelector('.profile-avatar');
    
    if (profileName) profileName.textContent = currentUser.username;
    if (profileHandle) profileHandle.textContent = `@${currentUser.username.toLowerCase().replace(/\s/g, '')}`;
    if (profileBio) profileBio.textContent = currentUser.bio;
    
    if (profileAvatar) {
        if (currentUser.profilePic) {
            profileAvatar.src = currentUser.profilePic;
            profileAvatar.style.background = 'none';
        } else {
            profileAvatar.style.background = `linear-gradient(135deg, #1d9bf0, #1a8cd8)`;
        }
    }
    
    // Load user posts
    loadUserPosts(currentUser.id);
}

// Load user posts - FIXED: shows posts for any user
function loadUserPosts(userId) {
    const postsContainer = document.getElementById('profilePosts');
    if (!postsContainer) return;
    
    const allPosts = getAllPosts();
    const userPosts = allPosts
        .filter(post => post.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (userPosts.length === 0) {
        postsContainer.innerHTML = '<div class="empty-state"><h3>No posts yet</h3><p>When you create posts, they\'ll show up here.</p></div>';
        return;
    }
    
    const currentUser = getCurrentUser();
    postsContainer.innerHTML = userPosts.map(post => renderPost(post, currentUser)).join('');
    attachPostEventListeners();
}

// Initialize profile
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('profile.html')) {
        loadProfile();
    }
});