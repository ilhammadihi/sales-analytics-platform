// src/server.js : point d'entrée du serveur
import 'dotenv/config';
import { app } from './app.js';

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Sales Analytics API démarrée sur http://localhost:${port}`);
});
