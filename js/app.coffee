Manifold =
  create: ->
    w = 4
    h = 6
    s = 2
    color = _.random(s-1)
    row = -> _.times(w, -> color)
    game =
      rows: h
      cols: w
      board: _.times(h, row)
      states: s
      updates: []
      moves: 0
      complete: false
      nextState: (x, y) ->
        @moves += 1
        _.each [[0,0], [0,1], [1,0], [0,-1], [-1,0]], (offset) =>
          ox = (x + offset[0] + @cols) % @cols
          oy = (y + offset[1] + @rows) % @rows
          @board[oy][ox] = (@board[oy][ox] + 1) % @states
          @updates.push [ox, oy, @board[oy][ox]]
      bestScore: ->
        _.max(_.pairs(_.countBy(_.flatten(@board))), (x) -> x[1])
      randomPosition: ->
        [_.random(@cols), _.random(@rows)]

    moves = _.times(10, game.randomPosition)
    _.each moves, (p) -> game.nextState p[0], p[1]
    game.moves = 0
    game.updates = []
    game

render = (game, container) ->
  tiles = _.partialRight _.map, (tile, index) ->
    $("<div>").attr
      "class": "tile"
      "data-state": tile
      "data-x": index
  rows = _.partialRight _.map, (row, index) ->
    $("<div>").attr
      "class": "row x-#{row.length}"
      "data-y": index
    .html(tiles(row))

  container
    .empty()
    .attr(class: "y-#{game.board.length}")
    .html(rows(game.board))

  container.find(".tile").click ->
    tile = $(this)
    row = tile.parent(".row")
    x = parseInt tile.attr "data-x"
    y = parseInt row.attr "data-y"
    game.nextState x, y

update = (game, container) ->
  _.each game.updates, (update) ->
    [x, y, s] = update
    tile = container.find(".row[data-y=#{y}] .tile[data-x=#{x}]")
    $(tile).attr "data-state", game.board[y][x]
  game.updates = []

  [state, score] = game.bestScore()
  total = game.rows * game.cols
  $("#complete")
    .html(Math.floor 100 * score / total)
    .attr(class: "state-#{state}")

  if score == total
    localStorage.best = Math.min(localStorage.best, game.moves)
    alert "You won! Reload the page for another game."
    game.complete = true

  $("#moves").html game.moves

  $("#best").html(
    if _.isFinite(localStorage.best)
      localStorage.best
    else
      "&infin;"
  )

$(document).ready ->
  game = Manifold.create()
  container = $("#boardview")

  localStorage.best or= Infinity

  render game, container

  do step = ->
    update game, container
    unless game.complete then window.requestAnimationFrame step
