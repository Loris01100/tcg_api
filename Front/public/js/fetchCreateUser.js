const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html';
} else {
    fetch('http://localhost:3001/api/profil?token=' + token)
        .then(res => res.json())
        .then(data => {
            const user = data.data;
            const cards = user.collection;
            const list = document.getElementById('card-list');

            if (!cards || cards.length === 0) {
                document.getElementById('message').textContent = "Aucune carte à vendre.";
                return;
            }

            cards.forEach(card => {
                if (card.nb > 0) {
                    const div = document.createElement('div');
                    div.className = 'card';
                    div.innerHTML = `
                        <h3>${card.Card.name}</h3>
                        <p>Rareté : ${card.Card.rarity}</p>
                        <p>Nombre : ${card.nb}</p>
                        <button onclick="vendreCarte(${card.Card.id})">Mettre en enchère</button>
                    `;
                    list.appendChild(div);
                }
            });
        });
}

function vendreCarte(cardId) {
    const token = localStorage.getItem('token');

    fetch("http://localhost:3001/enchere", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, cardId })
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            window.location.href = 'enchere.html';
        });
}
