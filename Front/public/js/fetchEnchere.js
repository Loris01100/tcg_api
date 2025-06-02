//récupère le token stocké dans le cache du navigateur
let token = localStorage.getItem('token');

//redirection si aucun token trouvé
if (!token) {
    window.location.href = 'login.html';
}
else {
    Promise.all([
        //Requête API
        fetch('http://localhost:3001/encheres?token=' + token).then(r => r.json()),
        fetch('http://localhost:3001/cards').then(r => r.json())
    ])
        .then(([encheresRes, cardData]) => {

            let encheres = encheresRes.encheres;
            let allCards = cardData.data;

            let container = document.getElementById('enchere-list');
            let messagePrevention = document.getElementById('message');

            //préviens l'utilisateur si aucune enchère n'est en cours
            if (!encheres || encheres.length === 0) {
                messagePrevention.textContent = "Aucune enchère en cours.";
                return;
            }

            //affiche toutes les enchères trouvés
            encheres.forEach(enchere => {
                let card = allCards.find(c => c.id === enchere.CardId);


                //bloc HTML pour une enchère
                let enchereDiv = document.createElement('div');
                enchereDiv.classList.add("card");

                enchereDiv.innerHTML = `
                <h3>${card.name}</h3>
                <p>Rareté : ${card.rarity}</p>
                <p>Prix actuel : ${enchere.bid} $</p>
                <p>Se termine le : ${new Date(enchere.end_date).toLocaleString()}</p>
            `;

                //bloc html pour pouvoir enchérir
                let input = document.createElement('input');
                input.type = 'number';
                input.placeholder = 'Votre mise';
                input.min = enchere.bid + 1;

                //bouton pour enchérir
                let button = document.createElement('button');
                button.textContent = 'Enchérir';
                button.addEventListener('click', () => {
                    let montant = parseInt(input.value);
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

                //ajout des blocs HTML sur la page
                enchereDiv.appendChild(input);
                enchereDiv.appendChild(button);
                container.appendChild(enchereDiv);
            });
        })
        .catch(err => {
            console.error("Erreur de chargement :", err);
        });
}
