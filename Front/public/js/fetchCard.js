const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html';
}

else {
    fetch('http://localhost:3001/cards?token=${token}')
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
}

let logoutLink = document.getElementById('logout-link');
if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
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
}