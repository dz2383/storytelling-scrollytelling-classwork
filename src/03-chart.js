import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 10, left: 10, right: 10, bottom: 10 }

let height = 400 - margin.top - margin.bottom
let width = 400 - margin.left - margin.right

let svg = d3
  .select('#chart-3')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let nyc = [-74, 40]
let sf = [-122, 37]
let shanghai = [121.4737, 31.2304]

let projection = d3.geoOrthographic()
let path = d3.geoPath().projection(projection)

d3.json(require('./data/world.topojson'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(json) {
  let countries = topojson.feature(json, json.objects.countries)
  projection.fitSize([width, height], countries)

  svg
    .append('path')
    .datum({ type: 'Sphere' })
    .attr('d', path)
    .attr('class', 'sphere')
    .attr('fill', '#81DAF5')
    .attr('stroke', 'black')
    .attr('stroke-width', 2)

  svg
    .append('g')
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', '#F5ECCE')
    .attr('stroke', 'black')
    .attr('stroke-width', 0.1)

  d3.select('#step-nyc').on('stepin', () => {
    d3.transition()
      .duration(500)
      .tween('rotate', () => {
        let target = [-nyc[0], -nyc[1]]
        let rotationInterpolator = d3.interpolate(projection.rotate(), target) 
        return function(t) {
          var currentRotation = rotationInterpolator(t)
          projection.rotate(currentRotation)
          svg.selectAll('.country').attr('d', path)
          svg.selectAll('.sphere').attr('d', path)
        }
      })
  })

  d3.select('#step-sf').on('stepin', () => {
    d3.transition()
      .duration(500)
      .tween('rotate', () => {
        let target = [-sf[0], -sf[1]]
        let rotationInterpolator = d3.interpolate(projection.rotate(), target) 
        return function(t) {
          var currentRotation = rotationInterpolator(t)
          projection.rotate(currentRotation)
          svg.selectAll('.country').attr('d', path)
          svg.selectAll('.sphere').attr('d', path)
        }
      })
  })

  d3.select('#step-shanghai').on('stepin', () => {
    d3.transition()
      .duration(500)
      .tween('rotate', () => {
        let target = [-shanghai[0], -shanghai[1]]
        let rotationInterpolator = d3.interpolate(projection.rotate(), target) 
        return function(t) {
          var currentRotation = rotationInterpolator(t)
          projection.rotate(currentRotation)
          svg.selectAll('.country').attr('d', path)
          svg.selectAll('.sphere').attr('d', path)
        }
      })
  })
}
