// let mysql = require('mysql2');
 
// let connection = mysql.createConnection({
//    host:        'localhost',
//    user:        'root',
//    password:    '',
//    database:    'kahoot-custom'
//  });

// connection.connect(function(error){
//    if(!!error){
//      console.log(error);
//    }else{
//      console.log('Connection Succuessfully!');
//    }
//  })

// module.exports = connection; 

let mysql = require('mysql2');
 
let connection = mysql.createConnection({
   host:        'localhost',
   user:        'developer',
   password:    'ai.dev@erl',
   database:    'quiz-erklika'
 });

connection.connect(function(error){
   if(!!error){
     console.log(error);
   }else{
     console.log('Connection Succuessfully!');
   }
 })

module.exports = connection; 