(function() {
  var Manifold, render, update;

  Manifold = {
    create: function() {
      var color, game, h, moves, row, s, w;
      w = 4;
      h = 6;
      s = 3;
      color = _.random(s - 1);
      row = function() {
        return _.times(w, function() {
          return color;
        });
      };
      game = {
        rows: h,
        cols: w,
        board: _.times(h, row),
        states: s,
        updates: [],
        moves: 0,
        complete: false,
        nextState: function(x, y) {
          var _this = this;
          this.moves += 1;
          return _.each([[0, 0], [0, 1], [1, 0], [0, -1], [-1, 0]], function(offset) {
            var ox, oy;
            ox = (x + offset[0] + _this.cols) % _this.cols;
            oy = (y + offset[1] + _this.rows) % _this.rows;
            _this.board[oy][ox] = (_this.board[oy][ox] + 1) % _this.states;
            return _this.updates.push([ox, oy, _this.board[oy][ox]]);
          });
        },
        bestScore: function() {
          return _.max(_.pairs(_.countBy(_.flatten(this.board))), function(x) {
            return x[1];
          });
        },
        randomPosition: function() {
          return [_.random(this.cols), _.random(this.rows)];
        }
      };
      moves = _.times(10, game.randomPosition);
      _.each(moves, function(p) {
        return game.nextState(p[0], p[1]);
      });
      game.moves = 0;
      game.updates = [];
      return game;
    }
  };

  render = function(game, container) {
    var rows, tiles;
    tiles = _.partialRight(_.map, function(tile, index) {
      return $("<div>").attr({
        "class": "tile",
        "data-state": tile,
        "data-x": index
      });
    });
    rows = _.partialRight(_.map, function(row, index) {
      return $("<div>").attr({
        "class": "row x-" + row.length,
        "data-y": index
      }).html(tiles(row));
    });
    container.empty().attr({
      "class": "y-" + game.board.length
    }).html(rows(game.board));
    return container.find(".tile").click(function() {
      var row, tile, x, y;
      tile = $(this);
      row = tile.parent(".row");
      x = parseInt(tile.attr("data-x"));
      y = parseInt(row.attr("data-y"));
      return game.nextState(x, y);
    });
  };

  update = function(game, container) {
    var score, state, total, _ref;
    _.each(game.updates, function(update) {
      var s, tile, x, y;
      x = update[0], y = update[1], s = update[2];
      tile = container.find(".row[data-y=" + y + "] .tile[data-x=" + x + "]");
      return $(tile).attr("data-state", game.board[y][x]);
    });
    game.updates = [];
    _ref = game.bestScore(), state = _ref[0], score = _ref[1];
    total = game.rows * game.cols;
    $("#complete").html(Math.floor(100 * score / total)).attr({
      "class": "state-" + state
    });
    if (score === total) {
      localStorage.best = Math.min(localStorage.best, game.moves);
      alert("You won! Reload the page for another game.");
      game.complete = true;
    }
    $("#moves").html(game.moves);
    return $("#best").html(_.isFinite(localStorage.best) ? localStorage.best : "&infin;");
  };

  $(document).ready(function() {
    var container, game, step;
    game = Manifold.create();
    container = $("#boardview");
    localStorage.best || (localStorage.best = Infinity);
    render(game, container);
    return (step = function() {
      update(game, container);
      if (!game.complete) {
        return window.requestAnimationFrame(step);
      }
    })();
  });

}).call(this);
