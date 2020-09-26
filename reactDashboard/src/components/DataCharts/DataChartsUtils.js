const keyDates = [
  { date: Date.parse("2020-03-24"), name: "Lockdown" },
  { date: Date.parse("2020-05-29"), name: "Phase 1" },
  { date: Date.parse("2020-06-19"), name: "Phase 2" },
  { date: Date.parse("2020-07-10"), name: "Phase 3" },
  { date: Date.parse("2020-07-15"), name: "Bars reopen" },
  { date: Date.parse("2020-08-11"), name: "Schools reopen" },
];

function getDateLine({ date, name }, index) {

  return {
    type: "line",
    drawTime: "afterDatasetsDraw",
    mode: "vertical",
    scaleID: "x-axis-0",
    borderColor: "rgba(0,0,0,0.25)",
    borderWidth: 2,
    value: date,
    label: {
      backgroundColor: "white",
      fontColor: "black",
      xPadding: 0,
      yPadding: 0,
      position: "top",
      enabled: true,
      yAdjust: index * 20,
      content: name,
    },
  };
}



export function getWhoThresholdLine() {
  return {
    type: "line",
    drawTime: "afterDatasetsDraw",
    mode: "horizontal",
    scaleID: "y-axis-0",
    borderColor: "rgba(255,0,0,0.8)",
    borderWidth: 2,
    value: 5,
    label: {
      backgroundColor: "white",
      fontColor: "black",
      xPadding: 0,
      yPadding: 0,
      position: "top",
      enabled: true,
      content: "WHO recommended threshold",
    },
  };
}

export function datasetConfiguration(datasetLabel, seriesData, colour) {
  return {
    label: datasetLabel,
    data: seriesData,
    backgroundColor: colour,
    borderColor: colour,
    fill: false,
    pointRadius: 0,
    borderWidth: 2,
    lineTension: 0,
  };
}

export function commonChartConfiguration(datasets, {startDate, endDate}) {
  return {
    type: "line",

    data: {
      datasets: datasets,
    },
    options: {
      animation: {
        duration: 0,
      },
      hover: {
        animationDuration: 0,
        mode: "index",
        intersect: false,
      },
      responsiveAnimationDuration: 0,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            id: "y-axis-0",
            ticks: {
              beginAtZero: true,
              maxTicksLimit: 20,
              callback: function (value, index, values) {
                return Math.round(value);
              },
            },
          },
        ],
        xAxes: [
          {
            type: "time",
            distribution: "series",
            time: {
              tooltipFormat: "D MMM YYYY",
            },
            gridLines: {
              display: false,
            },
            ticks: {
              min: startDate,
              max: endDate,
            }
          },
        ],
      },
      legend: {
        position: "bottom",
      },
      annotation: {
        annotations: keyDates.map(getDateLine),
      },
      tooltips: {
        callbacks: {
          label: (tooltipItem, data) => {
            return (
              data.datasets[tooltipItem.datasetIndex].label +
              ": " +
              (Number.isInteger(tooltipItem.yLabel)
                ? tooltipItem.yLabel
                : tooltipItem.yLabel.toFixed(1))
            );
          },
        },
      },
    },
  };
}
