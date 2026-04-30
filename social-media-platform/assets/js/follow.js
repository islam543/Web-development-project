// Follow/Unfollow functionality

// Follow a user
function followUser(userId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const users = getAllUsers();
    const userToFollow = users.find(u => u.id === userId);
    
    if (!userToFollow) return;
    
    // Update current user's following
    if (!currentUser.following) currentUser.following = [];
    if (!currentUser.following.includes(userId)) {
        currentUser.following.push(userId);
        updateCurrentUser(currentUser);
        
        // Update user's followers
        if (!userToFollow.followers) userToFollow.followers = [];
        if (!userToFollow.followers.includes(currentUser.id)) {
            userToFollow.followers.push(currentUser.id);
            const index = users.findIndex(u => u.id === userId);
            if (index !== -1) {
                users[index] = userToFollow;
                saveUsers(users);
            }
        }
        
        showToast(`Following ${userToFollow.username}`);
        return true;
    }
    
    return false;
}

// Unfollow a user
function unfollowUser(userId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const users = getAllUsers();
    const userToUnfollow = users.find(u => u.id === userId);
    
    if (!userToUnfollow) return;
    
    // Update current user's following
    if (currentUser.following) {
        const index = currentUser.following.indexOf(userId);
        if (index !== -1) {
            currentUser.following.splice(index, 1);
            updateCurrentUser(currentUser);
        }
    }
    
    // Update user's followers
    if (userToUnfollow.followers) {
        const index = userToUnfollow.followers.indexOf(currentUser.id);
        if (index !== -1) {
            userToUnfollow.followers.splice(index, 1);
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                users[userIndex] = userToUnfollow;
                saveUsers(users);
            }
        }
    }
    
    showToast(`Unfollowed ${userToUnfollow.username}`);
    return true;
}

// Check if current user is following another user
function isFollowing(userId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    return currentUser.following?.includes(userId) || false;
}

// Render follow button
function renderFollowButton(userId, container) {
    const following = isFollowing(userId);
    const btn = document.createElement('button');
    btn.className = 'btn-follow';
    btn.textContent = following ? 'Following' : 'Follow';
    
    if (following) {
        btn.style.background = '#16181c';
        btn.style.border = '1px solid #2f3336';
        btn.style.color = '#e7e9ea';
    }
    
    btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (following) {
            await unfollowUser(userId);
            btn.textContent = 'Follow';
            btn.style.background = '';
            btn.style.border = '';
            btn.style.color = '';
        } else {
            await followUser(userId);
            btn.textContent = 'Following';
            btn.style.background = '#16181c';
            btn.style.border = '1px solid #2f3336';
            btn.style.color = '#e7e9ea';
        }
    });
    
    container.appendChild(btn);
}