 function ScorePlayer() {
	var that = this;

	that.annonce = ko.observable();
	that.pointsMarquees = ko.observable();
	that.belote = ko.observable(false);

	that.pointsBelote = ko.computed(function() {
		var belote = that.belote();

		return belote ? 20 : 0;
	});

	that.totalMarquees = ko.computed(function() {
		var pointsMarquees = Math.round(+that.pointsMarquees() / 10) * 10,
			pointsBelote = that.pointsBelote();

		return pointsMarquees + pointsBelote;
	});

	// Computed

	that.dedans = ko.computed(function() {
		var annonce = +that.annonce() || 0,
			totalMarquees = that.totalMarquees();

		return annonce > totalMarquees;
	});

	that.totalAvecAnnonce = ko.computed(function() {
		var annonce = +that.annonce() || 0,
			totalMarquees = that.totalMarquees();

		return annonce + totalMarquees;
	});

	// Subscribers

	that.annonce.subscribe(function(annonce, old) {
		if (annonce <= 0) that.annonce(0);
		else if (annonce == 8 || annonce == 800) that.annonce(80);
		else if (annonce == 9 || annonce == 900) that.annonce(90);
		else if (annonce == 1 || annonce == 1000) that.annonce(100);
		else if (annonce > 1000 && annonce < 1009) that.annonce(100 + annonce % 10 * 10);
		else if (annonce < 80) that.annonce(80);
		else if (annonce == 190) that.annonce(250);
		else if (annonce == 240) that.annonce(180);
		else if (annonce > 250) that.annonce(250);
	});
}

function ScoreEntry(previous) {
	var that = this;

	that.players = [
		new ScorePlayer(),
		new ScorePlayer()
	];

	that.scores = ko.computed(function() {
		var scores = [0, 0],
			annonces = that.players.map(function(player) { return +player.annonce() || 0; });

		if (that.players[0].dedans()) {
			scores[0] = that.players[0].pointsBelote();
			scores[1] = 160 + +that.players[0].annonce() + that.players[1].pointsBelote();
		} else if (that.players[1].dedans()) {
			scores[1] = that.players[1].pointsBelote();
			scores[0] = 160 + +that.players[1].annonce() + that.players[0].pointsBelote();
		} else {
			scores[0] = that.players[0].totalAvecAnnonce();
			scores[1] = that.players[1].totalAvecAnnonce();
		}

		return scores;
	});

	that.cumulative = ko.computed(function() {
		var cumulative = that.scores().slice();

		if (previous) {
			cumulative[0] += previous.cumulative()[0];
			cumulative[1] += previous.cumulative()[1];
		}

		return cumulative;
	});

	checkBelote(that.players[0], that.players[1]);
	checkBelote(that.players[1], that.players[0]);
	guessPointsMarquees(that.players[0], that.players[1]);
	guessPointsMarquees(that.players[1], that.players[0]);

	function checkBelote(player1, player2) {
		player1.belote.subscribe(function(belote) {
			if (belote) player2.belote(false);
		});
	}

	function guessPointsMarquees(player1, player2) {
		player1.pointsMarquees.subscribe(function(pointsMarquees) {
			if (!player2.pointsMarquees()) player2.pointsMarquees(162 - pointsMarquees);
		});
	}
}

function ScoreKeeperViewModel() {
	var that = this,
		localStorage = window.localStorage;

	that.player1 = ko.observable("");
	that.player2 = ko.observable("");

	that.scoreEntries = ko.observableArray([new ScoreEntry()]);

	var subscription = that.scoreEntries()[0].scores.subscribe(addLine);

	that.addLines = function() {
		var curIndex = that.scoreEntries().length - 1;

		if (subscription) subscription.dispose();

		for (var i = 0; i < 5; ++i) {
			var previous = that.scoreEntries()[curIndex + i];
			that.scoreEntries.push(new ScoreEntry(previous));
		}

		subscription = lastScore().scores.subscribe(addLine);
	}

	if (localStorage) {
		storePlayerName("player1");
		storePlayerName("player2");
	}

	function storePlayerName(playerId) {
		var player = that[playerId],
			playerName = localStorage.getItem(playerId) || "";

		player(playerName);
		player.subscribe(function(newPlayerName) {
			localStorage.setItem(playerId, newPlayerName);
		})
	}

	function lastScore() {
		var scores = that.scoreEntries();

		return scores[scores.length - 1];
	}

	function addLine() {
		var newScore = new ScoreEntry(lastScore());

		if (subscription) subscription.dispose();
		that.scoreEntries.push(newScore);
		subscription = newScore.scores.subscribe(addLine);
	}
}
