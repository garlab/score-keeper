function ScorePlayer() {
	var that = this;

	that.annonce = ko.observable(0);
	that.pointsMarquees = ko.observable(0);
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

	that.dedans = ko.computed(function() {
		var annonce = +that.annonce(),
			totalMarquees = that.totalMarquees();

		return annonce > totalMarquees;
	});

	that.totalAvecAnnonce = ko.computed(function() {
		var annonce = +that.annonce(),
			totalMarquees = that.totalMarquees();

		return annonce + totalMarquees;
	})
}

function ScoreEntry() {
	var that = this;

	that.players = [
		new ScorePlayer(),
		new ScorePlayer()
	];

	that.scores = ko.computed(function() {
		var scores = [0, 0];

		if (that.players[0].dedans()) {
			scores[0] = that.players[0].pointsBelote();
			scores[1] = that.players[1].totalMarquees() + +that.players[0].annonce();
		} else if (that.players[1].dedans()) {
			scores[1] = that.players[1].pointsBelote();
			scores[0] = that.players[0].totalMarquees() + +that.players[1].annonce();
		} else {
			scores[0] = that.players[0].totalAvecAnnonce();
			scores[1] = that.players[1].totalAvecAnnonce();
		}

		return scores;
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
		for (var i = 0; i < 5; ++i) that.scoreEntries.push(new ScoreEntry());
	}
}

var vm = new ScoreKeeperViewModel();
ko.applyBindings(vm);