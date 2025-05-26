// API/importCards.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Card from './Models/Card.js'; // Ton modèle Sequelize
import bdd from './db.js';
import './Models/Association.js';

// Fix __dirname en ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lire le fichier JSON
const cardsPath = path.join(__dirname, 'data', 'cards.json');
const raw = fs.readFileSync(cardsPath, 'utf-8');
const cards = JSON.parse(raw);

(async () => {
    try {
        await bdd.sync(); // s'assurer que la table existe
        for (const card of cards) {
            await Card.findOrCreate({
                where: { id: card.id },
                defaults: {
                    name: card.name,
                    rarity: card.rarity
                }
            });
        }
        console.log("Cartes insérées avec succès !");
        process.exit(0);
    } catch (err) {
        console.error("Erreur d'insertion :", err);
        process.exit(1);
    }
})();
