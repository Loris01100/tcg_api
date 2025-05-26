const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html';
} else {
    Promise.all([
        fetch('http://localhost:3001/encheres?token=' + token).then(r => r.json()),
        fetch('http://localhost:3001/api/cards').then(r => r.json())
    ])
        .then(([encheresRes, cardData]) => {
            console.log("Réponse brute API /encheres :", encheresRes);

            const encheres = encheresRes.encheres; // ✅ fix ici
            const allCards = cardData.data;

            const container = document.getElementById('auction-list');
            const messageEl = document.getElementById('message');

            if (!encheres || encheres.length === 0) {
                messageEl.textContent = "Aucune enchère en cours.";
                return;
            }

            encheres.forEach(enchere => {
                const card = allCards.find(c => c.id === enchere.CardId);

                if (!card) {
                    console.warn(`Carte id ${enchere.cardId} introuvable.`);
                    return;
                }

                const enchereDiv = document.createElement('div');
                enchereDiv.classList.add("card");

                enchereDiv.innerHTML = `
                <h3>${card.name}</h3>
                <p>Rareté : ${card.rarity}</p>
                <p>Prix actuel : ${enchere.bid} 🪙</p>
                <p>Se termine le : ${new Date(enchere.end_date).toLocaleString()}</p>
            `;

                const input = document.createElement('input');
                input.type = 'number';
                input.placeholder = 'Votre mise';
                input.min = enchere.bid + 1;

                const button = document.createElement('button');
                button.textContent = 'Enchérir';
                button.addEventListener('click', () => {
                    const montant = parseInt(input.value);
                    if (isNaN(montant) || montant <= enchere.bid) {
                        alert("Montant invalide");
                        return;
                    }

                    fetch('http://localhost:3001/encherir', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            token,
                            enchereId: enchere.id,
                            montant
                        })
                    })
                        .then(res => res.json())
                        .then(result => {
                            alert(result.message || "Mise effectuée !");
                            location.reload();
                        });
                });

                enchereDiv.appendChild(input);
                enchereDiv.appendChild(button);
                container.appendChild(enchereDiv);
            });
        })
        .catch(err => {
            console.error("Erreur de chargement :", err);
        });
}
