import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { RegisterUser, Login, GetUser, DisconnectUser } from './users.js';
import { GetAllCards, OpenBooster } from './cards.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/static', express.static(path.join(__dirname, 'public')));

//routes pour l'API
app.post('/login', Login);
app.post('/register', RegisterUser);
app.get('/api/profil', GetUser);
app.post('/logout', DisconnectUser);
app.get('/api/cards', GetAllCards);
app.post('/booster', OpenBooster);

//routes pour l'HTML
app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'createUser.html')));
app.get('/profil', (req, res) => res.sendFile(path.join(__dirname, 'public', 'profil.html')));
app.get('/card', (req, res) => res.sendFile(path.join(__dirname, 'public', 'card.html')));
app.get('/booster', (req, res) => res.sendFile(path.join(__dirname, 'public', 'booster.html')));
app.get('/createUser', (req, res) => res.sendFile(path.join(__dirname, 'public', 'createUser.html')));

app.listen(3001, () => {
    console.log('Serveur démarré sur http://localhost:3001');
});
