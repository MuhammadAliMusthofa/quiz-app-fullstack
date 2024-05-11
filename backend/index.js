const express = require('express')
const app = express()
const port = 4001
const router = express.Router();
app.use('/image',express.static(__dirname+'/public/assets/images'));
//import body parser
const bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//import library CORS
const cors = require('cors')

//use cors
app.use(cors())

//import route karyawan
const authRouters = require('./router/Auth/auth');
app.use('/api/auth', authRouters); // use route posts di Express

//import route karyawan
const Routers = require('./router/game');
app.use('/api/clone-kahoot', Routers); // use route posts di Express

//import route karyawan
const Routerss = require('./router/quiz');
app.use('/api', Routerss); // use route posts di Express

router.get('/', (req, res) => {
  console.log(`app running at http://localhost:${port}`);
  res.send('Hello World!');
});


app.listen(port, () => {
  console.log(`app running at http://localhost:${port}`)
})


