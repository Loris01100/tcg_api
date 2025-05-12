function getTokenFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('token');
}

let token = getTokenFromURL();

if (!token) {
    window.location.href = '/booster';
}

document.getElementById('openBoosterBtn').addEventListener('click', () => {
    fetch('/booster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    })
        .then(res => res.json().then(data => ({ status: res.status, data })))
        .then(result => {
            let { status, data } = result;
            let resultDiv = document.getElementById('booster-result');
            let messageEl = document.getElementById('message');
            resultDiv.innerHTML = "";
            messageEl.textContent = "";

            if (status === 200) {
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
        .catch(error => {
            document.getElementById('message').textContent = "Erreur lors de l'ouverture du booster.";
            console.error(error);
        });
});