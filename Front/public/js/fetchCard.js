//récupère le token stocké dans le cache du navigateur
let token = localStorage.getItem('token');

//redirection si aucun token trouvé
if (!token) {
    window.location.href = 'login.html';
}

else {
    //requête API
    fetch('http://localhost:3001/cards?token=${token}')
        .then(response => response.json())
        .then(result => {
            let cards = result.data;

            //élément HTML
            let cardList = document.getElementById('card-list');

            //ajout de la carte sur la page
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