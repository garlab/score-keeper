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
		var pointsMarquees = +that.pointsMarquees(),
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
}

var mockScoreEntry = {
	players: [
		{annonce: 120, pointsMarquees: 110, belote: true},
		{annonce: 0, pointsMarquees: 50, belote: false},
	],
	scores: function() {
		return [250, 50];
	}
};

function ScoreKeeperViewModel() {
	var that = this;

	that.player1 = ko.observable("");
	that.player2 = ko.observable("");

	that.scoreEntries = ko.observableArray([new ScoreEntry()]);

	that.addLines = function() {
		var curIndex = that.scoreEntries().length - 1;

		for (var i = 0; i < 5; ++i) {
			var previous = that.scoreEntries()[curIndex + i];
			that.scoreEntries.push(new ScoreEntry(previous));
		}
	}
}

var vm = new ScoreKeeperViewModel();
ko.applyBindings(vm);