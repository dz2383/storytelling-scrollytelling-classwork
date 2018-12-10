import * as d3 from 'd3'

let margin = { top: 50, left: 50, right: 20, bottom: 100 }

let height = 400 - margin.top - margin.bottom
let width = 400 - margin.left - margin.right

let svg = d3
  .select('#chart-4')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var xPositionScale = d3
  .scaleLinear()
  .domain([1955, 2017])
  .range([0, width])

var yPositionScale = d3
  .scaleLinear()
  .domain([0, 6000])
  .range([height, 0])

var line = d3
  .line()
  .x(d => xPositionScale(d.year))
  .y(d => yPositionScale(d.cumulativePoints))
  .curve(d3.curveStepAfter)

var colorScale = d3
  .scaleOrdinal()
  .domain([
    'LeBron James',
    'Michael Jordan',
    'Kareem Abdul-Jabbar',
    'Jerry West',
    'Kevin Durant'
  ])
  .range(['#FDBB30', '#CE1141', '#333333', '#552582', '#006BB6'])

d3.tsv(require('./data/every-game.tsv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  // Extract the year from the date column
  // Make sure points is a number
  datapoints.forEach(d => {
    d.year = +d.date.split('-')[0]
    d.pts = +d.pts
  })

  // Group the games by each player...
  var nested = d3
    .nest()
    .key(d => d.name)
    .entries(datapoints)

  // Clean up each of the player groups
  nested.forEach(player => {
    var games = player.values

    // Give them a .name instead of a .key
    player.name = player.key

    // Is there name inside of the colorScale? If yes,
    // let's mark them as important
    player.important = colorScale.domain().indexOf(player.name) !== -1
    player.firstYear = games[0].year

    // Count the cumulative points as they go through
    // their career
    var cumulativePoints = 0
    var cumulativeLastTwoRoundsPoints = 0
    games.forEach((d, i) => {
      d.index = i
      // Get the year by itself
      d.careerYear = d.year - player.firstYear

      // Keeping a running total of the points scored
      // so far (assumes the games are all in order)
      d.cumulativePoints = cumulativePoints += d.pts
      if (d.rank < 2) {
        d.cumulativeLastTwoRoundsPoints = cumulativeLastTwoRoundsPoints += d.pts
      } else {
        d.cumulativeLastTwoRoundsPoints = cumulativeLastTwoRoundsPoints
      }
    })
  })

  // Draw a line for every player based
  // on their games
  svg
    .selectAll('.player-line')
    .data(nested)
    .enter()
    .append('path')
    .attr('class', 'player-line')
    .attr('d', d => line(d.values))
    .attr('fill', 'none')
    .classed('important', d => d.important)
    .attr('stroke', '#CCCCCC')
    .attr('stroke-width', 1)

  // Go back to the important people and
  // color/thicken their lines
  svg
    .selectAll('.important')
    .attr('stroke', d => colorScale(d.name))
    .attr('stroke-width', 2)
    .raise()

  // Now let's add labels for the important people
  var important = nested.filter(d => d.important)
  svg
    .selectAll('.name-label')
    .data(important)
    .enter()
    .append('text')
    .attr('class', 'name-label')
    .text(d => d.name.split(' ')[1])
    .attr('x', d => {
      var lastGame = d.values[d.values.length - 1]
      return xPositionScale(lastGame.year)
    })
    .attr('y', d => {
      var lastGame = d.values[d.values.length - 1]
      return yPositionScale(lastGame.cumulativePoints)
    })
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('font-weight', 'bold')
    .attr('dy', -5)
    .style('text-shadow', '-1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF')

  var yAxis = d3
    .axisLeft(yPositionScale)
    .ticks(5)
    .tickSize(3)

  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)

  var xAxis = d3
    .axisBottom(xPositionScale)
    .tickFormat(d3.format('0'))
    .ticks(5)
    .tickSize(3)

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  svg.selectAll('.axis line, .axis path')
}
