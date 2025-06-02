import express from 'express';
import cors from 'cors';
import bdd from './db.js'; //utile pour le bdd.sync
import './Models/Association.js';
import { RegisterUser, Login, GetUser, DisconnectUser } from './users.js';
import { GetAllCards, OpenBooster, ConvertCards } from './cards.js';
import {CreateEnchere, PlaceBid, GetEncheres, CloseEnchere } from './encheres.js';

//en commentaire car utile s'il y a une modification dans la base de données
/*bdd.sync({ alter: false }).then(() => {
    console.log("Base resynchronisée");
});*/

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//routes pour la connexion/inscription d'un utilisateur
app.post('/login', Login);
app.post('/register', RegisterUser);
//route profil
app.get('/profil', GetUser);
//route déconnexion
app.post('/logout', DisconnectUser);
//route pour accèder à toutes les cartes de l'application
app.get('/cards', GetAllCards);
//routes ouverture de booster
app.post('/booster', OpenBooster);
//route pour convertir les cartes en argent
app.post('/convert', ConvertCards);
//route pour les enchères
app.post('/enchere', CreateEnchere);
app.post('/encherir', PlaceBid);
app.get('/encheres', GetEncheres);
app.post('/cloturer', CloseEnchere);



app.listen(3001, () => {
    console.log('Serveur démarré sur http://localhost:3001');
});
