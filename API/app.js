import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { RegisterUser, Login, GetUser, DisconnectUser } from './users.js';
import { GetAllCards, OpenBooster } from './cards.js';
import cors from 'cors';

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//routes pour l'API
app.post('/login', Login);
app.post('/register', RegisterUser);
app.get('/api/profil', GetUser);
app.post('/logout', DisconnectUser);
app.get('/api/cards', GetAllCards);
app.post('/booster', OpenBooster);

app.listen(3001, () => {
    console.log('Serveur démarré sur http://localhost:3001');
});
