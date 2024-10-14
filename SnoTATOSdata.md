---
layout: inner
title: SnoTATOS Livestream
permalink: /SnoTATOSdata/
---
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SnoTATOS livestream</title>

  <link
  rel="stylesheet"
  href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css"
  />

  <link
  rel="stylesheet"
  href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
  />
  <link
  href="https://fonts.googleapis.com/css?family=Titillium+Web:400,600,700"
  rel="stylesheet"
  />

  <link rel="stylesheet" href="styles.css" />
</head>

<h1>SnoTATOS live data</h1>

<p> We deployed several SnoTATOS networks in the Lincoln Sea in late April 2024 as part of the <a href="https://espo.nasa.gov/arcsix/content/ARCSIX" target="_blank" rel="noopener noreferrer">NASA ARCSIX project</a>. Below you'll find live data from the active networks.

<body>
  <div id="wrapper">
    <div class="content-area">
      <div class="container-fluid">
        <!-- <div class="text-right mt-3 mb-3 d-fixed">
          <a
          href="https://github.com/apexcharts/apexcharts.js/tree/master/samples/vanilla-js/dashboards/modern"
          target="_blank"
          class="btn btn-outline-primary mr-2"
          >
          <span class="btn-text">View Code</span>
        </a>
      </div> -->
      <div class="main">
        <div class="row sparkboxes mt-4 mb-4 ml-4 mr-4">
          <div class="container-fluid">
            <div class="box">
              <div id="spark1"></div>
              <div id="spark2"</div>
            </div>
          </div>
        </div>


        <div class="row mt-5 mb-4">
          <div class="col-md-6">
            <div class="box">
              <div id="bar"></div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="box">
              <div id="donut"></div>
            </div>
          </div>
        </div>

        <div class="row mt-4 mb-4">
          <div class="col-md-6">
            <div class="box">
              <div id="area"></div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="box">
              <div id="line"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.slim.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
<script src="data.js"></script>
<script src="./js/plotSnotatos.js"></script>
<script src="scripts.js"></script>

<script></script>
</body>
</html>
