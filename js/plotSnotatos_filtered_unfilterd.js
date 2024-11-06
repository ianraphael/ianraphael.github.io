// script for plotting a snotatos file. need to remove hardcoded values
// and instead pass dynamic vals (e.g. buoy name, api url, init snow depths, etc.)
//
//  Ian Raphael
//  ianaraphael@gmail.com
//  2024.09.24
// <html>
// <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
// <script>


// if we're just pulling data up from local dir
let localFiles = true;

// define URL
// let remoteUrl = "https://api.cryosphereinnovation.com/public/deployment/data/60f4bc71-6942-49dc-89ab-d5434424e6dc/";
// let localUrl = "/files/file.json";
let plotErrorsAsZero = false;  // if false, plot as nans

let firstSnotatosColumn = 14; // first column in the simb datasheet in which there's snotatos data
let numStations = 10; // numnber of snotatos stations in the network
let lastSnotatosColumn = firstSnotatosColumn + (numStations)*2;
let timeStampColumn = 3;
let simbPingerColumn = 10;

// let buoyName = '2024L';

// let simbInitSnow = 0.26; // initial snow depth at SIMB2024R
// let simbInitSnow = 0.36; // initial snow depth at SIMB2024L
// let simbInitSnow = 0.19; // initial snow depth at SIMB2024P
// let simbInitSnow = 0.51; // initial snow depth at SIMB2024O
let simbInitSnow = {"SIMB 2024R":0.26,"SIMB 2024L":0.36,"SIMB 2024P":0.19,"SIMB 2024O":0.51};

let pingerStandoff = 1.44 - 0.19; // height of pinger above ice surface depth stop

let emaAlpha = 2/(10+1); // smoothing factor for exponential moving average
// let emaAlpha = 2/(20+1); // smoothing factor for exponential moving average
let maxChangeRate_mmsec = 7; // 7 mm as specified by Maxbotix for snow specific pinger https://maxbotix.com/pages/hrxl-maxsonar-wrs-datasheet
let samplingInterval_hours = 4;

/**************************** fetch function def ****************************/
// define function for fetching simb data
async function fetchData(url, buoyName, filtered, targetPane1,targetPane2, callbackFx) {

  let options;
  if (localFiles != true){
    options = {headers: {'Authorization': 'Bearer '+ 'RgHhXQ58vGePoaDaaL6y8Ck9oClokGsf'}};
  }

  const response = await fetch(url, options);
  let data = await response.json();

  callbackFx(data,buoyName,filtered,targetPane1,targetPane2);
}

/*************************** data processing callback def ***************************/
// define callback function which will execute once data is fetched
function processData(data,buoyName,filtered,targetPane1,targetPane2) {

  /************************* extract data from json *************************/

  // declare an array to hold our data
  let dataArray = new Array();

  // for every row
  for (let i=0;i<data.length;i++) {

    // convert the row object into an array
    dataArray[i] = Object.values(data[i]);
  }


  // now extract snotatos range data
  // rangeReadings = simbData(:,firstSnotatosColumn:2:lastSnotatosColumn);
  let rangeReadings = new Array();
  let batteryVoltages = new Array();
  let timeStamp = new Array();
  let simbSurfaceDistance = new Array();

  // for every row
  for (let row=0;row<dataArray.length;row++){

    // create a new array at that row for the range and battery readings
    rangeReadings[row] = new Array();
    batteryVoltages[row] = new Array();

    // start back at the zeroeth column
    let column = 0;
    // then for every snotatos column
    for (let snotatosColumn = firstSnotatosColumn; snotatosColumn<lastSnotatosColumn; snotatosColumn+=2){
      // read the correct element into that spot
      rangeReadings[row][column] = dataArray[row][snotatosColumn];
      batteryVoltages[row][column] = dataArray[row][snotatosColumn+1];
      column++;
    }

    // read in the timestamp and simb pinger data
    timeStamp[row] = dataArray[row][timeStampColumn];
    simbSurfaceDistance[row] = dataArray[row][simbPingerColumn];
  }

  /**************************** convert timestamp ****************************/

  let datenum_js = new Array();

  // for every row
  for (let i=0;i<dataArray.length;i++){
    // convert to ms for native display in html
    datenum_js[i] = timeStamp[i]*1000;

    // and convert the unix timestamp to a datestring in place
    timeStamp[i] = new Date(timeStamp[i]*1000);
  }

  /***************** convert simb pinger range to snow depth *****************/

  // allocate an array for snowdepths
  let simbSnowDepth = new Array();

  // first get the pinger initial offset
  let simbPingerOffset = simbInitSnow[buoyName] + simbSurfaceDistance[0];

  // now for every value
  for (let i=0;i<dataArray.length;i++){

    // if it's greater than three meters
    if (simbSurfaceDistance[i] > 3){
      // make it nan
      simbSnowDepth[i] = null;
    } else {
      // otherwise calculate snow depth
      simbSnowDepth[i] = simbPingerOffset - simbSurfaceDistance[i];
    }

    // add to array with timestamp
    simbSnowDepth[i] = [datenum_js[i],simbSnowDepth[i]];
  }

  /************ filter and convert range data to snow depth ************/

  // allocate an array for snow depths
  let snowDepth = new Array();

  // allocate an array to keep track of how many comms errors we have
  let commsErrors = new Array();

  // allocate an array to hold the number of stations reporting for any transmission
  let n_stationsReporting = new Array();

  // for every row (data transmission)
  for (let row=0; row<dataArray.length;row++) {

    // allocate new array for this row of snow depths
    snowDepth[row] = new Array();

    commsErrors[row] = 0;

    // for every column (station)
    for (let column = 0;column<numStations;column++){

      // if there's a comms error
      if (rangeReadings[row][column] == 5.000){
        // increment the counter for this row (data transmission)
        commsErrors[row]++;
      }

      // if there's any kind of error
      if (rangeReadings[row][column] > 2.5) {
        // if we're plotting errors as zero
        if (plotErrorsAsZero) {
          // find all of the range readings where that exceed 2.5 m and make snow depth 0
          snowDepth[row][column] = 0;
        } else{
          // find all of the range readings where that exceed 2.5 m and make snow depth nan
          snowDepth[row][column] = null;
        }
      } else {
        // otherwise convert to snow depth
        snowDepth[row][column] = pingerStandoff - rangeReadings[row][column];
      }
    }

    // figure out how many stations reported
    n_stationsReporting[row] = [datenum_js[row], (numStations - commsErrors[row])];
  }

  /******************************* Filter data *******************************/

  // make a copy of snow depth for filtered data
  let snowDepth_filtered = snowDepth.slice();
  for (let row=0;row<snowDepth_filtered.length;row++) {
    snowDepth_filtered[row] = snowDepth[row].slice();
  }

  // for every row after the first
  for (let row=1;row<dataArray.length;row++){

    // for every station
    for (let column=0;column<numStations;column++) {

      // calculate dh_dt
      let dh_dt = (snowDepth[row][column] - snowDepth[row-1][column])/samplingInterval_hours;

      // convert to mm/second and take abs
      dh_dt = Math.abs(dh_dt * 1000/3600);

      // if we exceed max change rate
      if (dh_dt >  maxChangeRate_mmsec){
        // replace value with nan
        snowDepth_filtered[row][column] = null;
      } else {
        // otherwise continue
        // continue;
      }

      // if there is no valid value at the current index at this point
      if (snowDepth_filtered[row][column] == null) {
        // forward fill the data from the previous row
        snowDepth_filtered[row][column] = snowDepth_filtered[row-1][column];
      }

      // if there's a valid value at the previous index
      if (snowDepth_filtered[row-1][column] != null) {

        // calculate ema filtered value
        snowDepth_filtered[row][column] = emaAlpha*snowDepth[row][column] +
        ((1-emaAlpha)*snowDepth_filtered[row-1][column]);

      } else {
        // otherwise just continue without altering this value
        continue;
      }
    }
  }

  /******************************* Filter data *******************************/

  // allocate a new array to hold the average
  let averageSnowDepth = new Array();

  // for every row of the data
  for (let i=0;i<dataArray.length;i++){

    // reset the row sum
    let rowSum = 0;
    // and the count
    let nVals = 0;

    // for every column
    for (let i2=0;i2<numStations;i2++) {
      // if the value isn't null
      if (snowDepth_filtered[i][i2] != null){
        // add it to the running sum
        rowSum += snowDepth_filtered[i][i2];
        nVals++;
      }
    }

    let rowAvg = (rowSum/nVals);
    // console.log(rowAvg);
    if (isNaN(rowAvg)){
      rowAvg = null;
    }

    // find the average and store it along with timestamp
    averageSnowDepth[i] = [datenum_js[i], rowAvg];
  }

  let dataObject = new Object();

  dataObject.snowDepth_filtered_indiv = new Array();
  dataObject.snowDepth_unfiltered_indiv = new Array();

  // for every station
  for (let i=0;i<numStations;i++) {

    // allocate a new array for the filtered data
    let holdStationFiltered = new Array();

    // repeat for filtered data
    let holdStationUnfiltered = new Array();

    // for every measurement
    for (let i2=0;i2<dataArray.length;i2++){
      // grab it and put it in the array
      holdStationUnfiltered[i2] = [datenum_js[i2], snowDepth[i2][i]];
      holdStationFiltered[i2] = [datenum_js[i2],snowDepth_filtered[i2][i]];
    }

    // now put the data in our return object
    dataObject.snowDepth_filtered_indiv[i] = holdStationFiltered;
    dataObject.snowDepth_unfiltered_indiv[i] = holdStationUnfiltered;
  }

  dataObject.snowDepth_filtered = snowDepth_filtered;
  dataObject.snowDepth = snowDepth;
  dataObject.simbSnowDepth = new Array();
  dataObject.simbSnowDepth = simbSnowDepth;
  dataObject.timeStamp = timeStamp;
  dataObject.datenum_js = datenum_js;
  dataObject.dataLength = dataArray.length;
  dataObject.averageSnowDepth = averageSnowDepth;
  dataObject.n_stationsReporting = n_stationsReporting;

  // plot the data
  plotData(dataObject,filtered,buoyName,targetPane1,targetPane2);

  return dataObject;
}

/**************************** plot data function def ****************************/
function plotData(dataObject,filtered,buoyName,targetPane1,targetPane2) {

  var options_filtered = {
    series: [
      {
        name: 'Station #1 (filtered)',
        data: dataObject.snowDepth_filtered_indiv[0],
      },
      {
        name: 'Station #2 (filtered)',
        data: dataObject.snowDepth_filtered_indiv[1],
      },
      {
        name: 'Station #3 (filtered)',
        data: dataObject.snowDepth_filtered_indiv[2],
      },
      {
        name: 'Station #4 (filtered)',
        data: dataObject.snowDepth_filtered_indiv[3],
      },
      {
        name: 'Station #5 (filtered)',
        data: dataObject.snowDepth_filtered_indiv[4],
      },
      {
        name: 'Station #6 (filtered)',
        data: dataObject.snowDepth_filtered_indiv[5],
      },
      {
        name: 'Station #7 (filtered)',
        data: dataObject.snowDepth_filtered_indiv[6],
      },
      {
        name: 'Station #8 (filtered)',
        data: dataObject.snowDepth_filtered_indiv[7],
      },
      {
        name: 'Station #9 (filtered)',
        data: dataObject.snowDepth_filtered_indiv[8],
      },
      {
        name: 'Station #10 (filtered)',
        data: dataObject.snowDepth_filtered_indiv[9],
      },
      {
        name: "Mean (active stations)",
        data: dataObject.averageSnowDepth,
      },
      {
        name: 'SIMB3',
        data: dataObject.simbSnowDepth,
      },
    ],
    chart: {
      id: buoyName,
      group: 'snotatosPlots',
      animations: {
        enabled: false,
        animateGradually: {
          enabled: false,
        },
        dynamicAnimation: {
          enabled: false,
        }
      },
      type: 'line',
      stacked: false,
      height: 467,
      zoom: {
        type: 'x',
        enabled: true,
        autoScaleYaxis: true
      },
      toolbar: {
        autoSelected: 'zoom',
        offsetX: -30,

      }
    },
    stroke: {
      show: true,
      // curve: 'straight',
      lineCap: 'butt',
      // colors: undefined,
      width: 2,
      // dashArray: [0,0,0,0,0,0,0,0,0,0,4,0,],
    },
    colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0',
    '#3F51B5', '#03A9F4', '#4CAF50', '#F9CE1D', '#FF9800','#000000','#7b7b7b',],
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 0,
    },
    title: {
      text: buoyName,
      align: 'center',
      margin: 10,
      offsetX: 0,
      offsetY: 15,
      floating: false,
      style: {
        fontSize:  '28px',
        fontWeight:  'bold',
        fontFamily:  undefined,
        color:  '#263238'
      },
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          if (val!=null){
            return (val).toFixed(2);
          }
        },
        offsetX: 12,
      },
      title: {
        text: 'Snow depth (m)',
        style: {
          fontSize: '22px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 800,
          cssClass: 'apexcharts-yaxis-label',
        },
        offsetX: -5,
        offsetY: 0,
        align: 'left',
      },
    },
    xaxis: {
      type: 'datetime',
      tooltip: {
        enabled: false,
      },
    },
    grid: {
      show: true,
      borderColor: '#90A4AE',
      strokeDashArray: 0,
      position: 'back',
      xaxis: {
        lines: {
          show: false,
        }
      },
      yaxis: {
        lines: {
          show: true,
        }
      },
      row: {
        colors: undefined,
        opacity: 0.5
      },
      column: {
        colors: undefined,
        opacity: 0.5
      },
      padding: {
        top: 20,
        right: 30,
        bottom: 0,
        left: 20
      },
    },
    legend: {
      show: true,
      showForSingleSeries: false,
      showForNullSeries: true,
      showForZeroSeries: true,
      position: 'top',
      horizontalAlign: 'center',
      floating: false,
      fontSize: '14px',
      fontFamily: 'Helvetica, Arial',
      fontWeight: 400,
      formatter: undefined,
      inverseOrder: false,
      width: undefined,
      height: undefined,
      tooltipHoverFormatter: undefined,
      customLegendItems: [],
      offsetX: 0,
      offsetY: 0,
      labels: {
        colors: undefined,
        useSeriesColors: false
      },
      markers: {
        size: 7,
        shape: 'square',
        strokeWidth: 1,
        fillColors: undefined,
        customHTML: undefined,
        onClick: undefined,
        offsetX: 0,
        offsetY: 0
      },
      itemMargin: {
        horizontal: 5,
        vertical: 0
      },
      onItemClick: {
        toggleDataSeries: true
      },
      onItemHover: {
        highlightDataSeries: true
      },
    },
    tooltip: {
      shared: true,
      y: {
        formatter: function (val) {
          if (val!=null){
            return (val).toFixed(2);
          }
        }
      },
      x: {
        formatter: function (val) {
          if (val!=null){
            return (new Date(val)).toUTCString();
          }
        }
      },
    }
  };

  var options_unfiltered = {
    series: [
      {
        name: 'Station #1 (unfiltered)',
        hidden: true,
        data: dataObject.snowDepth_unfiltered_indiv[0],
      },
      {
        name: 'Station #2 (unfiltered)',
        hidden: true,
        data: dataObject.snowDepth_unfiltered_indiv[1],
      },
      {
        name: 'Station #3 (unfiltered)',
        hidden: true,
        data: dataObject.snowDepth_unfiltered_indiv[2],
      },
      {
        name: 'Station #4 (unfiltered)',
        hidden: true,
        data: dataObject.snowDepth_unfiltered_indiv[3],
      },
      {
        name: 'Station #5 (unfiltered)',
        hidden: true,
        data: dataObject.snowDepth_unfiltered_indiv[4],
      },
      {
        name: 'Station #6 (unfiltered)',
        hidden: true,
        data: dataObject.snowDepth_unfiltered_indiv[5],
      },
      {
        name: 'Station #7 (unfiltered)',
        hidden: true,
        data: dataObject.snowDepth_unfiltered_indiv[6],
      },
      {
        name: 'Station #8 (unfiltered)',
        hidden: true,
        data: dataObject.snowDepth_unfiltered_indiv[7],
      },
      {
        name: 'Station #9 (unfiltered)',
        hidden: true,
        data: dataObject.snowDepth_unfiltered_indiv[8],
      },
      {
        name: 'Station #10 (unfiltered)',
        hidden: true,
        data: dataObject.snowDepth_unfiltered_indiv[9],
      },
      {
        name: "Mean (active stations)",
        type: 'line',
        data: dataObject.averageSnowDepth,
        markers: {
          size: 6,
        },
      },
      {
        name: 'SIMB3',
        type: 'line',
        data: dataObject.simbSnowDepth,
        markers: {
          size: 6,
        },
      },
    ],
    chart: {
      id: buoyName,
      group: 'snotatosPlots',
      animations: {
        enabled: false,
        animateGradually: {
          enabled: false,
        },
        dynamicAnimation: {
          enabled: false,
        }
      },
      type: 'scatter',
      stacked: false,
      height: 467,
      zoom: {
        type: 'x',
        enabled: true,
        autoScaleYaxis: true
      },
      toolbar: {
        autoSelected: 'zoom',
        offsetX: -30,

      }
    },
    stroke: {
      show: true,
      // curve: 'straight',
      lineCap: 'butt',
      // colors: undefined,
      width: 2,
      // dashArray: [0,0,0,0,0,0,0,0,0,0,4,0,],
    },
    colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0',
    '#3F51B5', '#03A9F4', '#4CAF50', '#F9CE1D', '#FF9800','#000000','#7b7b7b',],
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 6,
    },
    title: {
      text: buoyName,
      align: 'center',
      margin: 10,
      offsetX: 0,
      offsetY: 15,
      floating: false,
      style: {
        fontSize:  '28px',
        fontWeight:  'bold',
        fontFamily:  undefined,
        color:  '#263238'
      },
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          if (val!=null){
            return (val).toFixed(2);
          }
        },
        offsetX: 12,
      },
      title: {
        text: 'Snow depth (m)',
        style: {
          fontSize: '22px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 800,
          cssClass: 'apexcharts-yaxis-label',
        },
        offsetX: -5,
        offsetY: 0,
        align: 'left',
      },
    },
    xaxis: {
      type: 'datetime',
      tooltip: {
        enabled: false,
      },
    },
    grid: {
      show: true,
      borderColor: '#90A4AE',
      strokeDashArray: 0,
      position: 'back',
      xaxis: {
        lines: {
          show: false,
        }
      },
      yaxis: {
        lines: {
          show: true,
        }
      },
      row: {
        colors: undefined,
        opacity: 0.5
      },
      column: {
        colors: undefined,
        opacity: 0.5
      },
      padding: {
        top: 20,
        right: 30,
        bottom: 0,
        left: 20
      },
    },
    legend: {
      show: true,
      showForSingleSeries: false,
      showForNullSeries: true,
      showForZeroSeries: true,
      position: 'top',
      horizontalAlign: 'center',
      floating: false,
      fontSize: '14px',
      fontFamily: 'Helvetica, Arial',
      fontWeight: 400,
      formatter: undefined,
      inverseOrder: false,
      width: undefined,
      height: undefined,
      tooltipHoverFormatter: undefined,
      customLegendItems: [],
      offsetX: 0,
      offsetY: 0,
      labels: {
        colors: undefined,
        useSeriesColors: false
      },
      markers: {
        size: 7,
        shape: 'square',
        strokeWidth: 1,
        fillColors: undefined,
        customHTML: undefined,
        onClick: undefined,
        offsetX: 0,
        offsetY: 0
      },
      itemMargin: {
        horizontal: 5,
        vertical: 0
      },
      onItemClick: {
        toggleDataSeries: true
      },
      onItemHover: {
        highlightDataSeries: true
      },
    },
    tooltip: {
      shared: true,
      y: {
        formatter: function (val) {
          if (val!=null){
            return (val).toFixed(2);
          }
        }
      },
      x: {
        formatter: function (val) {
          if (val!=null){
            return (new Date(val)).toUTCString();
          }
        }
      },
    }
  };

  if (typeof chart != "undefined") {
    chart.destroy();
  }

  if (!filtered) {
    new chart = ApexCharts(document.querySelector(targetPane1), options_filtered).render();
    filtered = true;
  } else {
    new chart = ApexCharts(document.querySelector(targetPane1), options_unfiltered).render();
    filtered = false;
  }

  var options1 = {
    series: [
      {
        name: 'nStations',
        data: dataObject.n_stationsReporting,
      },
    ],
    chart: {
      id: buoyName+'_nStations',
      group: 'snotatosPlots',
      animations: {
        enabled: false,
        animateGradually: {
          enabled: false,
        },
        dynamicAnimation: {
          enabled: false,
        }
      },
      type: 'line',
      stacked: false,
      height: 220,
      zoom: {
        type: 'x',
        enabled: true,
        autoScaleYaxis: true
      },
      toolbar: {
        show: false,
      }
    },
    stroke: {
      show: true,
      // curve: 'straight',
      lineCap: 'butt',
      // colors: undefined,
      width: 2,
    },
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 0,
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          if (val!=null){
            return (val).toFixed(0);
          }
        },
        offsetX: 22,
      },
      title: {
        text: 'Stations reporting',
        style: {
          fontSize: '22px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 800,
          cssClass: 'apexcharts-yaxis-label',
        },
        offsetX: -8,
        offsetY: 13,
        align: 'left',
      },
    },
    xaxis: {
      type: 'datetime',
      tooltip: {
        enabled: false,
      },
    },
    grid: {
      show: true,
      borderColor: '#90A4AE',
      strokeDashArray: 0,
      position: 'back',
      xaxis: {
        lines: {
          show: false,
        }
      },
      yaxis: {
        lines: {
          show: true,
        }
      },
      row: {
        colors: undefined,
        opacity: 0.5
      },
      column: {
        colors: undefined,
        opacity: 0.5
      },
      padding: {
        top: 0,
        right: 30,
        bottom: 20,
        left: 30,
      },
    },
    tooltip: {
      // shared: true,
      y: {
        formatter: function (val) {
          if (val!=null){
            return (val).toFixed(0);
          }
        }
      },
      x: {
        show: false,
      },
    }
  };

  var chart = new ApexCharts(document.querySelector(targetPane2), options1).render();
}


function changeData(url, buoyName, filtered, targetPane1,targetPane2, callbackFx) {

  fetchData(url, buoyName, filtered, targetPane1,targetPane2, callbackFx);
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #1 (filtered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #2 (filtered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #3 (filtered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #4 (filtered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #5 (filtered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #6 (filtered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #7 (filtered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #8 (filtered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #9 (filtered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #10 (filtered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #1 (unfiltered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #2 (unfiltered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #3 (unfiltered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #4 (unfiltered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #5 (unfiltered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #6 (unfiltered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #7 (unfiltered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #8 (unfiltered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #9 (unfiltered)');
  // ApexCharts.exec(buoyName, "toggleSeries",'Station #10 (unfiltered)');


}

// if (localFiles != true) {
//   // call fetch function
//   fetchData(remoteUrl,"#spark1","#spark2",processData);
//   console.log("fetched remote data");
// } else {
// call fetch function
// fetchData(localUrl,"SIMB 2024L","#spark1","#spark2",processData);
// console.log("fetched local data");
// }
