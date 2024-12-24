// const express = require('express')
// const app = express()
// const port = 4001
// const router = express.Router();
// app.use('/image',express.static(__dirname+'/public/assets/images'));
// //import body parser
// const bodyParser = require('body-parser')

// // parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }))

// // parse application/json
// app.use(bodyParser.json())

// //import library CORS
// const cors = require('cors')

// //use cors
// app.use(cors())

// //import route karyawan
// const authRouters = require('./api/Auth/auth');
// app.use('/api/auth', authRouters); // use route posts di Express

// //import route karyawan
// const Routers = require('./api/game');
// app.use('/api/clone-kahoot', Routers); // use route posts di Express

// //import route karyawan
// const Routerss = require('./api/quiz');
// app.use('/api', Routerss); // use route posts di Express

// router.get('/', (req, res) => {
//   console.log(`app running at http://localhost:${port}`);
//   res.send('Hello World!');
// });


// app.listen(port, () => {
//   console.log(`app running at http://localhost:${port}`)
// })


const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 4001;


// Middleware untuk menampilkan log permintaan (opsional, untuk debugging)
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.path} from origin: ${req.headers.origin}`);
  next();
});

// Konfigurasi CORS
const allowedOrigins = ['http://localhost:5173', 'http://10.1.4.41:5173']; // Ganti dengan URL frontend Anda
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Mengizinkan pengiriman cookie/credentials
}));

// Middleware untuk menangani preflight request (HTTP OPTIONS)
app.options('*', cors());

// Middleware Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware untuk melayani file statis (gambar, dll.)
app.use('/image', express.static(__dirname + '/public/assets/images'));

// Routes
const authRouters = require('./api/Auth/auth');
app.use('/api/auth', authRouters);

const Routers = require('./api/game');
app.use('/api/clone-kahoot', Routers);

const Routerss = require('./api/quiz');
app.use('/api', Routerss);

// Test Route (Opsional)
app.get('/', (req, res) => {
  res.send('Backend is running properly with CORS configured!');
});

// Start Server
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
