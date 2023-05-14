//index.js
const http = require('http'); 
const express = require('express'); 
const app = express(); 

// JWT
const jwt = require('jsonwebtoken');

// Secret
const SECRET = 'samaratools'
 
const bodyParser = require('body-parser');

// Middleware
app.use(bodyParser.json());

// Routes
app.get('/', (req, res, next) => {
    res.json({message: "Tudo ok por aqui!"});
})

// Calls Subsequentes obrigar o JWT
// Não permitir alguém autenticado acesse os dados
// Função de Middleware para usar nas rotas que sejam seguras
// Authorization

function verifyJSWT(req,res,next) {
    const token = req.headers['x-acess-token'];

    const index  = blacklist.findIndex(item => item === token);

    //if(index !== -1) return res.status(401).end();
    if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

    jwt.verify(token, SECRET, (err, decoded) => {
        //if(err) return res.status(401).end();
        if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });

        // se tudo estiver ok, salva no request para uso posterior
        req.userId = decoded.userId;
        next();
    })
}

app.get('/clientes', verifyJSWT, (req, res) => { 
    console.log("Retornou todos clientes!");
    console.log(req.userId + ' fez esta chamada!');
    res.json([{id:1, nome:'samara'}]);
}) 

// Authentication
app.post('/login', (req, res) => { 

    //esse teste abaixo deve ser feito no seu banco de dados
    if(req.body.user === "samara" && req.body.password === "senha") {
        // auth ok
        const token = jwt.sign({userId:1},SECRET, {expiresIn:120}); // expires in 2min
        return res.json({auth:true, token});
    }
    //res.status(401).end();
    res.status(500).json({message: 'Login inválido!'});
})

const blacklist = [];

app.post('/logout', (req, res) => {
    blacklist.push(req.headers['x-acess-token']);
    res.json({ auth: false, token: null });
})

// Connection Express
const server = http.createServer(app); 
server.listen(3000);
console.log("Servidor escutando na porta 3000...")