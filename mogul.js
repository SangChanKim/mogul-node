var firebase = require("firebase");
var request = require('superagent');
var nessieURL = "http://api.reimaginebanking.com";
var nessieKey = "";

firebase.initializeApp({
  serviceAccount: './Mogul-a6b6dc3c36af.json',
  databaseURL: 'https://mogul-6792d.firebaseio.com'
});

var db = firebase.database();
var requestRef = db.ref('/requests');

// Listens for requests made by clients
requestRef.on('child_added', function(snapshot, prevChildKey) {
  var type = snapshot.val().type;
  console.log("Request Type of " + type);
  if (type === 'transaction') {
  	processTransaction(snapshot);
  } else if (type === 'addChildToParent') {
	//processAddChildToParent(snapshot);
  } else if (type === 'addParentToChild') {
	//processAddParentToChild(snapshot);
  } else if (type === 'updateBalance') {
  	//processUpdateBalance(snapshot);
  } else if (type === 'requestBalance') {
  	processBalanceRequest(snapshot);
  }
});


function processTransaction(snapshot) {

	var payerUID = snapshot.val().payer;
	var payeeUID = snapshot.val().payee;
	var amount = snapshot.val().amount;
	var description = snapshot.val().description;
	db.ref('/users/' + payerUID).on('value', function(snapshot) {
		var payerAccID = snapshot.val().accountid;
		db.ref('/users/' + payeeUID).on('value', function(snapshot) {
			var payeeAccID = snapshot.val().accountid;

			var url = nessieURL + "/accounts/" + payerAccID + "/transfers" + "?key=" + nessieKey;
			var datetime = new Date();
			request.post(url)
				.send({ "medium": "balance",
						"payee_id": payeeAccID,
						"amount": amount,
						"description": description,
						"transaction_date": datetime.toString()})
				.end(function(err, res) {
					console.log(res.status + ": " + url);
				});

		}); 
	});
}

function processBalanceRequest(snapshot) {
	var requester = snapshot.val().requester;
	db.ref('/users/' + requester).on('value', function(snapshot) {
		var accountid = snapshot.val().accountid;
		var url = nessieURL + "/accounts/" + accountid + "?key=" + nessieKey;
		request.get(url).end(function(err, res) {
			console.log(res.status + ": " + url);
			db.ref("/users").child(requester).update({"balance": res.body.balance});
		});
	});
}
