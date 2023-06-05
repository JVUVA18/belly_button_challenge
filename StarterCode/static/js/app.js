const url = 'https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json';
const dataPromise = d3.json(url);

let otuData;
dataPromise.then(data => {
    console.log(data);
    otuData = data;
})

const metaDataBox = d3.select('#sample-metadata');
const dropdownMenu = d3.select('#selDataset');

function getAngle(wfreq) {
    var theta = 180 - 180 / 9 * wfreq
    var r = 0.35
    var x_head = r * Math.cos(Math.PI/180*theta)
    var y_head = r * Math.sin(Math.PI/180*theta)
    return [x_head, y_head]
}

function init() {

    otuData.names.map(name => {
        let option = dropdownMenu.append('option');
        option.text(name);
    })

    const samplesData = otuData.samples[0];
    const metadata = otuData.metadata[0];

    barTrace = {
        x: samplesData.sample_values.slice(0, 10),
        y: samplesData.otu_ids.slice(0, 10).map(id => `OTU-${id}`),
        text: samplesData.otu_labels.slice(0, 10),
        type: 'bar',
        orientation: 'h',
        transforms: [{
            type: 'sort',
            target: 'x',
            order: 'ascending'
        }]
    };
    barLayout = {
        title: 'Top Ten Bacteria'
    };
    Plotly.newPlot('bar', [barTrace], barLayout);

    bubbleTrace = {
        x: samplesData.otu_ids,
        y: samplesData.sample_values,
        text: samplesData.otu_labels,
        mode: 'markers',
        marker: {
            size: samplesData.sample_values,
            color: samplesData.otu_ids,
            colorscale: 'Earth'
        }
    };
    bubbleLayout = {
        xaxis: { title: {text: 'OTU id'}}
    }
    Plotly.newPlot('bubble', [bubbleTrace], bubbleLayout);

    for (const [key, value] of Object.entries(metadata)) {
        let p = metaDataBox.append('p');
        p.text(`${key}: ${value}`)
    }

    function getSteps() {
        let steps = [];
        for (j=0; j<9; j++) {
            let range = [j, j+1];
            let color = `rgb(${230 - j*30}, ${j*30}, 0)`;
            let step = {range:range, color:color};
            steps.push(step);
        }
        return steps;
    };

    let washTrace = {
        domain: {x: [0, 1], y: [0, 1]},
        value: metadata.wfreq,
        title: {text: 'Belly Button Scrubs per Week'},
        type: 'indicator',
        mode: 'gauge',
        gauge: {
            axis: {
                range: [null, 9],
                tickmode: 'linear',
                ticks: 'inside',
                ticklabelstep: 1
            },
            steps: getSteps(),
            bar: {thickness:0},
        },
    }

    var arrowTip = getAngle(metadata.wfreq)

    let washLayout = {
        xaxis: {range: [0, 1], showgrid: false, 'zeroline': false, 'visible': false},
        yaxis: {range: [0, 1], showgrid: false, 'zeroline': false, 'visible': false},
        showlegend: false,
        annotations: [{
            ax: 0.5,
            ay: 0.25,
            axref: 'x',
            ayref: 'y',
            x: 0.5+arrowTip[0],
            y: 0.25+arrowTip[1],
            xref: 'x',
            yref: 'y',
            showarrow: true,
            arrowhead: 9,
        }]
    }
    Plotly.newPlot('gauge', [washTrace], washLayout)
}

function optionChanged(id) {

    const sampleData = otuData.samples.filter(item => item.id === id)[0];
    const metadata = otuData.metadata.filter(item => item.id === parseInt(id))[0];

    let barX = sampleData.sample_values.slice(0, 10);
    let barY = sampleData.otu_ids.slice(0, 10).map(id => `OTU-${id}`);
    let barText = sampleData.otu_labels.slice(0, 10);
    Plotly.update('bar', {x:[barX], y:[barY], text:[barText]});

    let bubX = sampleData.otu_ids;
    let bubY = sampleData.sample_values;
    let bubText = sampleData.otu_labels;
    Plotly.update('bubble', {x:[bubX], y:[bubY], text:[bubText],
                             marker:{size:bubY, color:bubX}});

    metaDataBox.html(null);
    for (const [key, value] of Object.entries(metadata)) {
        let p = metaDataBox.append('p');
        p.text(`${key}: ${value}`);
    }

    let arrowTip = getAngle(metadata.wfreq)
    Plotly.update('gauge', {value:[metadata.wfreq]}, {annotations:[{
        ax: 0.5,
        ay: 0.25,
        axref: 'x',
        ayref: 'y',
        x: 0.5+arrowTip[0],
        y: 0.25+arrowTip[1],
        xref: 'x',
        yref: 'y',
    }]})
}

dataPromise.then(() => init());