//data reference

    // names[0]

    // metadata[1] reference:
    //             [0] - id - int
    //             [1] - ethnicity - str
    //             [2] - gender - str
    //             [3] - age - int
    //             [4] - location - str
    //             [5] - bbtype - str
    //             [6] - frequency - int

    // samples[2] reference:
    //             [0] - id - str
    //             [1] - otu_ids - array - int
    //             [2] - otu_labels - array - str
    //             [3] - sample_values - array - int

function init(){
    //Read in JSON file
    d3.json("../../samples.json").then((data) => {
        //Define the dropdown selector options
        options=data.names;

        console.log(options)

        //Locate where the dropwdown menu is
        var menu = d3.select("#selDataset");

        //Create a for each to add each name/option into the dropdown menu
        options.forEach((selection)=>{
            menu.append('option').property('value',selection).text(selection)
        })

        demoInfo(options[0]);
        createCharts(options[0]);
    });
};

function demoInfo(selection){
    // Read in JSON data
    d3.json("../../samples.json").then((data) => {

            //Hold the metadata
            var meta = data.metadata;

            //Filter for the selected value
            var info = meta.filter(selected=>selected.id==selection)
            console.log(info)
            //Select the location in the index.html where the data will be printed
            var demographic = d3.select('#sample-metadata').html("")

            //Append each key value pair into the dropdown list
            Object.entries(info[0]).forEach(([key,value])=>{
                demographic.append('p').text(`${key}:${value}`)
            });
    });
};

function createCharts(selection){
    
    //Read in JSON data
    d3.json("../../samples.json").then((data) => {

        //Hold the samples data for the bar and the bubble charts
        var samps = data.samples;

        //Parse the metadata for the gauge chart
        var meta = data.metadata;

        //Filter for the selected value
        var info = samps.filter(selected=>selected.id==selection)[0]

        //Create variables to hold all the information for the charts
        var otu_ids = info.otu_ids;
        var otu_labels = info.otu_labels;
        var sample_values = info.sample_values;

        //Create an array to hold the names that we need for the y-axis
        var barLabels = []
        
        //Create the custom labels for each id
        otu_ids.forEach((id)=>{
            barLabels.push("OTU "+id)
        })

        //Create the data variable to be read by plotly, ensuring to only capture 10 items from the dataset
        var barData=[{
            type: "bar",    //ensure type is bar
            x: sample_values.slice(0,10).reverse(), //slice selects 10 values
            y: barLabels, // use our custome labels
            text: otu_labels.slice(0,10).reverse(),
            orientation: 'h' //orients the bar chart as horizontal
        }];


        //Plot the bar chart
        Plotly.newPlot("bar",barData)

        // Define the data for the bubble
        var bubbleData = [{
            x: otu_ids,
            y: sample_values,
            mode: 'markers',
            marker: {
              size: sample_values,
              color: otu_ids
            },
            text:otu_labels
          }];
          
          var bubbleLayout = {
            showlegend: false,
          };
          
          //Plot the bubble chart
          Plotly.newPlot('bubble', bubbleData, bubbleLayout);

        //Filter the metadata for use in the gauge chart
        var gaugeInfo = meta.filter(selected=>selected.id==selection);

        //Create a variable to hold our desired information, i.e. the number of washes
        var washes = gaugeInfo[0].wfreq

        //Create data to be plotted for the gauge chart
        var gaugeData = [
            {
                domain: { x: [0, 1], y: [0, 1] },
                value: washes,
                title: "Washing Frequency (Washes per Week)" ,
                type: "indicator",
                mode: "gauge+number",
                gauge:{axis:{range:[0,9]}},
            }
        ];

        //Plot the gauge chart
        Plotly.newPlot('gauge', gaugeData)
    });
};

//Define a function to run the above on change of the dropwdown value
function optionChanged(selection){
    d3.json("../../samples.json").then((data) => {
            demoInfo(selection);
            createCharts(selection)
    });
};

init();