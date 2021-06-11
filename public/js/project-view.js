$(document).ready(() => {
    $('#assigned-users-table').DataTable();

    // Assign User Modal
    const findUserButton = document.getElementById('find-user-button');
    const clearUserButton = document.getElementById('clear-user-button');
    const assignUserSubmit = document.getElementById('assign-user-submit');

    assignUserSubmit.disabled = true;
    clearUserButton.disabled = true;

    findUserButton.addEventListener('click', (e) => findUserOnClick(e));
});

async function findUserOnClick(e) {
    e.preventDefault();

    const usernameInput = document.getElementById('assigned-username-input');
    const findUserButton = document.getElementById('find-user-button');
    const clearUserButton = document.getElementById('clear-user-button');
    const assignUserSubmit = document.getElementById('assign-user-submit');

    const assignUsernameSpan = document.getElementById('assign-username-span');
    const assignEmailSpan = document.getElementById('assign-email-span');

    const xhr = await fetch(`/api/user/username/${usernameInput.value}`, { method: 'GET' });
    const response = await xhr.json();
    
    if (response.isSuccess) {
        findUserButton.disabled = true;
        clearUserButton.disabled = false;
        assignUserSubmit.disabled = false;
        assignUserSubmit.dataset.userId = response.userId;

        assignUsernameSpan.innerText = response.username + " ";
        assignEmailSpan.innerText = "(" + response.email + ")";
    } else {
        assignUsernameSpan.innerText = "Invalid user...";
    }
}