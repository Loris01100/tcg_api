//récupère le token stocké dans le cache du navigateur
let token = localStorage.getItem('token');

//redirection si aucun token trouvé
if (!token) {
    window.location.href = 'login.html';
}

else {
    document.getElementById('openBoosterBtn').addEventListener('click', () => {
        //requête API
        fetch('http://localhost:3001/booster', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        })
            .then(res => res.json().then(data => ({ status: res.status, data })))
            .then(result => {
                let { status, data } = result;
                //éléments HTML (affichage du résultat)
                let resultDiv = document.getElementById('booster-result');
                let messageEl = document.getElementById('message');

                //clear les anciens résultats
                resultDiv.innerHTML = "";
                messageEl.textContent = "";

                if (status === 200) {
                    //affichage des cartes obtenus dans le booster
                    data.booster.forEach(card => {
                        let cardDiv = document.createElement('div');
                        cardDiv.className = 'card';
                        cardDiv.innerHTML = `
                            <h3>${card.name}</h3>
                            <p>Rareté : ${card.rarity}</p>
                        `;
                        resultDiv.appendChild(cardDiv);
                    });
                } else {
                    messageEl.textContent = data.message;
                }
            })
    });
}
