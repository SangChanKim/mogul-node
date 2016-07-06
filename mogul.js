var firebase = require("firebase");
var nessie = require('superagent');
var nessieURL = 'http://api.reimaginebanking.com/atms?key=eddd389a9f4fbd8e6327b89923c3e4a1'

firebase.initializeApp({
  serviceAccount: "./Mogul-a6b6dc3c36af.json",
  databaseURL: "https://mogul-6792d.firebaseio.com"
});

var db = firebase.database();
var requestRef = db.ref("/requests");


// Listens for requests made by clients
requestRef.on('child_added', function(snapshot, prevChildKey) {
  console.log(snapshot.val());
});

