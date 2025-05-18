const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html';
}

else {
    fetch('http://localhost:3001/api/profil?token=' + token)
        .then(response => response.json())
        .then(data => {
            let user = data.data;

            document.getElementById('username').textContent = user.username;

            let tableBody = document.getElementById('card-table-body');
            if (user.collection && Array.isArray(user.collection)) {
                user.collection.forEach(card => {
                    let row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${card.name}</td>
                        <td>${card.rarity}</td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        })
}

document.getElementById('logout-link').addEventListener('click', function(e) {
    e.preventDefault();
    fetch('http://localhost:3001/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    }).then(() => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
});