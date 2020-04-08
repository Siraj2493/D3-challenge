function updataData (xField, yField) {
  // get rid of the previous svg if it exists
  d3.selectAll('svg').remove()

  // Define SVG area dimensions
  var svgWidth = 960
  var svgHeight = 660

  // Define the chart's margins as an object
  var margin = {
    top: 20,
    right: 40,
    bottom: 90,
    left: 100
  }

  // Define dimensions of the chart area
  var width = svgWidth - margin.left - margin.right
  var height = svgHeight - margin.top - margin.bottom

  // Select body, append SVG area to it, and set the dimensions
  var svg = d3.select('#scatter')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)

  var chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // Load data
  d3.csv('assets/data/data.csv').then(function (censusData) {
    // change the data to numerical
    censusData.forEach(function (data) {
      data[xField] = +data[xField]
      data[yField] = +data[yField]
    })

    // populate the data arrays
    var xData = []
    var yData = []

    censusData.map(function (d) {
      xData.push(d[xField])
      yData.push(d[yField])
    })

    // set margins between chart labels and data points
    var dataMargin = 0.15

    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(xData) * (1 - dataMargin), d3.max(xData) * (1 + dataMargin)])
      .range([0, width])

    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(yData) * (1 - dataMargin * 2), d3.max(yData) * (1 + dataMargin)])
      .range([height, 0])

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale)
    var leftAxis = d3.axisLeft(yLinearScale)

    // Append Axes to the chart
    chartGroup.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(bottomAxis)

    chartGroup.append('g')
      .call(leftAxis)

    // if the field has a percent sign show it
    var xBefore
    var xAfter

    switch (xField) {
      case 'poverty':
        xBefore = ''
        xAfter = '%'
        break
      case 'age':
        xBefore = ''
        xAfter = ' years'
        break
      case 'income':
        xBefore = '$'
        xAfter = ''
        break
    }

    var tool_tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-8, 0])
      .html(function (d) { return d.state + '<br>' + xField + ': ' + xBefore + d[xField] + xAfter + '<br>' + yField + ': ' + d[yField] + '%' })
    svg.call(tool_tip)

    // Create datapoints
    var circlesGroup = chartGroup.selectAll('circle')
      .data(censusData)
      .enter()
      .append('circle')
      .attr('cx', d => xLinearScale(d[xField]))
      .attr('cy', d => yLinearScale(d[yField]))
      .attr('r', '12')
      .attr('fill', 'lightblue')

    // add text to the circles
    var circleText = chartGroup.selectAll()
      .data(censusData)
      .enter()
      .append('text')
      .text(d => (d.abbr))
      .attr('x', d => xLinearScale(d[xField]))
      .attr('y', d => yLinearScale(d[yField]))
      .style('font-size', '12px')
      .style('text-anchor', 'middle')
      .style('alignment-baseline', 'middle')
      .style('fill', 'white')
      .on('mouseover', tool_tip.show)
      .on('mouseout', tool_tip.hide)

    // prepare labels based on what is active changes class
    var obeseLabel
    var smokeLabel
    var healthLabel

    var povertyLabel
    var ageLabel
    var incomeLabel

    switch (xField) {
      case 'poverty':
        povertyLabel = 'active'
        ageLabel = 'inactive'
        incomeLabel = 'inactive'
        break
      case 'age':
        povertyLabel = 'inactive'
        ageLabel = 'active'
        incomeLabel = 'inactive'
        break
      case 'income':
        povertyLabel = 'inactive'
        ageLabel = 'inactive'
        incomeLabel = 'active'
        break
      default:
        var xLabel = ''
    }

    switch (yField) {
      case 'healthcare':
        obeseLabel = 'inactive'
        smokeLabel = 'inactive'
        healthLabel = 'active'
        break
      case 'obesity':
        obeseLabel = 'active'
        smokeLabel = 'inactive'
        healthLabel = 'inactive'
        break
      case 'smokes':
        obeseLabel = 'inactive'
        smokeLabel = 'active'
        healthLabel = 'inactive'
        break
      default:
        var yLabel = ''
    }

    // add obese label
    chartGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 40)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .attr('class', 'axisText')
      .text('Obese (%)')
      .classed(obeseLabel, true)
      .classed('y_label', true)

    // add smoke label
    chartGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 20)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .attr('class', 'axisText')
      .text('Smokes (%)')
      .classed(smokeLabel, true)
      .classed('y_label', true)

    // add health label
    chartGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 0)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .attr('class', 'axisText')
      .text('Lacks Healthcare (%)')
      .classed(healthLabel, true)
      .classed('y_label', true)

    // add poverty label
    chartGroup.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.top + 15})`)
      .attr('class', 'axisText')
      .text('In Poverty (%)')
      .classed(povertyLabel, true)
      .classed('x_label', true)

    // add age label
    chartGroup.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.top + 35})`)
      .attr('class', 'axisText')
      .text('Age (Median)')
      .classed(ageLabel, true)
      .classed('x_label', true)

    // add income label
    chartGroup.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.top + 55})`)
      .attr('class', 'axisText')
      .text('Household Income (Median)')
      .classed(incomeLabel, true)
      .classed('x_label', true)

    // add click events to the labels
    var xLabels = ['poverty', 'age', 'income']

    d3.selectAll('.x_label')
      .data(xLabels)
      .on('click', function (d) {
        xAttr = d
        updataData(xAttr, yAttr)
      })

    var yLabels = ['obesity', 'smokes', 'healthcare']

    d3.selectAll('.y_label')
      .data(yLabels)
      .on('click', function (d) {
        yAttr = d
        updataData(xAttr, yAttr)
      })
  }).catch(function (error) {
    console.log(error)
  })
}

var xAttr = 'poverty'
var yAttr = 'healthcare'

updataData(xAttr, yAttr)