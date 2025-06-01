const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html';
}

else {

    Promise.all([
        fetch('http://localhost:3001/profil?token=' + token).then(res => res.json()),
        fetch('http://localhost:3001/cards').then(res => res.json())
    ])
        .then(([profilRes, cardsRes]) => {
            const user = profilRes.data;
            const allCards = cardsRes.data;

            document.getElementById('username').textContent = user.username;
            document.getElementById('currency').textContent = user.currency;

            const tableBody = document.getElementById('card-table-body');

            if (user.collection && Array.isArray(user.collection)) {
                user.collection.forEach(cardEntry => {
                    const card = allCards.find(c => c.id === cardEntry.id);
                    if (!card) return;

                    let row = document.createElement('tr');
                    row.innerHTML = `
                    <td>${card.name}</td>
                    <td>${card.rarity}</td>
                    <td>${cardEntry.nb}</td>
                    <td>${cardEntry.nb > 1 ? `<button class="convert-btn" data-id="${card.id}">Convertir</button>` : ''}</td>
                `;
                    tableBody.appendChild(row);
                });
                document.querySelectorAll('.convert-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const cardId = parseInt(btn.getAttribute('data-id'));
                        fetch('http://localhost:3001/convert', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ token, cardId })
                        })
                            .then(res => res.json())
                            .then(data => {
                                alert(data.message);
                                location.reload(); // ou mettre à jour dynamiquement
                            });
                    });
                });
            }
        });


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