import express from 'express';
import cors from 'cors';
import bdd from './db.js';
import './Models/Association.js';
import { RegisterUser, Login, GetUser, DisconnectUser } from './users.js';
import { GetAllCards, OpenBooster, ConvertCards } from './cards.js';
import {CreateEnchere, PlaceBid, GetEncheres, CloseEnchere } from './encheres.js';

/*bdd.sync({ alter: true }).then(() => {
    console.log("Base resynchronisée");
});*/

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
//routes pour l'API
app.post('/login', Login);
app.post('/register', RegisterUser);
app.get('/api/profil', GetUser);
app.post('/logout', DisconnectUser);
app.get('/api/cards', GetAllCards);
app.post('/booster', OpenBooster);
app.post('/convert', ConvertCards);
app.post('/enchere', CreateEnchere);
app.post('/encherir', PlaceBid);
app.get('/encheres', GetEncheres);
app.post('/cloturer', CloseEnchere);



app.listen(3001, () => {
    console.log('Serveur démarré sur http://localhost:3001');
});
