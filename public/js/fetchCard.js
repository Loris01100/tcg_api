const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/card';
} else {
    fetch('/api/cards?token=' + token)
        .then(response => response.json())
        .then(result => {
            let cards = result.data;

            let cardList = document.getElementById('card-list');
            cards.forEach(card => {
                let div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `
                        <h3>${card.name}</h3>
                        <p>ID : ${card.id}</p>
                        <p>Rareté : ${card.rarity}</p>
                    `;
                cardList.appendChild(div);
            });
        })
        .catch(error => {
            console.error('Erreur lors du chargement des cartes :', error);
            window.location.href = '/card';
        });
}

let logoutLink = document.getElementById('logout-link');
if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        fetch('/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        }).then(() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
        });
    });
}