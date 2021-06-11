$(document).ready(() => {
    $('#assigned-users-table').DataTable();

    // Assign User Modal
    const usernameInput = document.getElementById('assigned-username-input');
    const findUserButton = document.getElementById('findUserButton');
    const clearUserButton = document.getElementById('clear-user-button');
    const assignUserSubmit = document.getElementById('assign-user-submit');

    assignUserSubmit.disabled = true;
    clearUserButton.disabled = true;
});