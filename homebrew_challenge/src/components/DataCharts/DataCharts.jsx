import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js";
import "./DataCharts.css";
import LoadingComponent from "../LoadingComponent/LoadingComponent";
import {
  PERCENTAGE_CASES,
  TOTAL_CASES,
  TOTAL_DEATHS,
} from "./DataChartsConsts";
import { readCsvData } from "../Utils/CsvUtils";
import "./FullscreenButton";

const dataUrl = "data/dailyScottishCasesAndDeaths.csv";

// Exported for tests
export function parseCsvData(csvData) {
  var lines = readCsvData(csvData);

  const positiveCasesMap = new Map();
  const totalsCasesMap = new Map();
  const totalsDeathsMap = new Map();
  const dateSet = new Set();

  lines.forEach(([date, countType, count], i) => {
    if ("positiveCases" === countType) {
      positiveCasesMap.set(date, Number(count));
    } else if ("totalCases" === countType) {
      totalsCasesMap.set(date, Number(count));
    } else if ("totalDeaths" === countType) {
      totalsDeathsMap.set(date, Number(count));
    } else {
      throw new Error("Unrecognised input: " + countType);
    }

    dateSet.add(date);
  });

  const dates = [...dateSet].sort();
  const percentageCasesPoints = [];
  const totalCasesPoints = [];
  const totalDeathsPoints = [];

  dates.forEach((dateString) => {
    const totalCases = totalsCasesMap.get(dateString);
    const positiveCases = positiveCasesMap.get(dateString);
    const totalDeaths = totalsDeathsMap.get(dateString);
    const date = Date.parse(dateString);

    percentageCasesPoints.push({
      t: date,
      y: totalCases === 0 ? 0 : (positiveCases * 100) / totalCases,
    });
    totalCasesPoints.push({
      t: date,
      y: positiveCases,
    });
    totalDeathsPoints.push({
      t: date,
      y: totalDeaths,
    });
  });

  return {
    percentageCases: percentageCasesPoints,
    totalCases: totalCasesPoints,
    totalDeaths: totalDeathsPoints,
  };
}

const DataCharts = ({
  chartType = PERCENTAGE_CASES,
  fullscreenEnabled = false,
  toggleFullscreen,
}) => {
  const chartContainer = useRef();
  const chartInstance = useRef(null);
  const [percentageCasesSeriesData, setPercentageCasesSeriesData] = useState(
    null
  );
  const [totalCasesSeriesData, setTotalCasesSeriesData] = useState(null);
  const [totalDeathsSeriesData, setTotalDeathsSeriesData] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);

  const percentageCasesDatasetLabel = "% of Positive Tests";
  const totalCasesDatasetLabel = "Total Cases";
  const totalDeathsDatasetLabel = "Total Deaths";

  useEffect(() => {
    function commonChartConfiguration(datasetLabel, seriesData) {
      return {
        type: "line",

        data: {
          datasets: [
            {
              label: datasetLabel,
              data: seriesData,
              backgroundColor: " #fdeee8",
              borderColor: "#ec6730",
            },
          ],
        },
        options: {
          animation: {
            duration: 0,
          },
          hover: {
            animationDuration: 0,
          },
          responsiveAnimationDuration: 0,
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            yAxes: [
              {
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
              },
            ],
          },
          legend: {
            position: "bottom",
          },
          plugins: {
            chartJsPluginFullscreenButton: {
              fullscreenEnabled: fullscreenEnabled,
              toggleFullscreen: toggleFullscreen,
            },
          },
        },
      };
    }

    function percentageCasesChartConfiguration(chartRef) {
      const configuration = commonChartConfiguration(
        percentageCasesDatasetLabel,
        percentageCasesSeriesData
      );
      configuration.options.scales.yAxes[0].ticks.callback = (
        value,
        index,
        values
      ) => {
        return Math.round(value) + "%";
      };
      configuration.options.tooltips = {
        callbacks: {
          label: (tooltipItem, data) => {
            return (
              percentageCasesDatasetLabel + ": " + tooltipItem.yLabel.toFixed(2)
            );
          },
        },
      };
      return configuration;
    }

    function totalCasesChartConfiguration(chartRef) {
      return commonChartConfiguration(
        totalCasesDatasetLabel,
        totalCasesSeriesData
      );
    }

    function totalDeathsChartConfiguration(chartRef) {
      return commonChartConfiguration(
        totalDeathsDatasetLabel,
        totalDeathsSeriesData
      );
    }

    // Only attempt to fetch data once
    if (!dataFetched) {
      setDataFetched(true);
      fetch(dataUrl, {
        method: "GET",
      })
        .then((res) => res.text())
        .then((csvData) => {
          const { percentageCases, totalCases, totalDeaths } = parseCsvData(
            csvData
          );
          setPercentageCasesSeriesData(percentageCases);
          setTotalCasesSeriesData(totalCases);
          setTotalDeathsSeriesData(totalDeaths);
        })
        .catch((error) => {
          console.error(error);
        });
    }

    if (chartInstance.current !== null) {
      chartInstance.current.destroy();
    }

    const chartRef = chartContainer.current.getContext("2d");
    if (chartType === PERCENTAGE_CASES) {
      chartInstance.current = new Chart(
        chartRef,
        percentageCasesChartConfiguration()
      );
    }
    if (chartType === TOTAL_CASES) {
      chartInstance.current = new Chart(
        chartRef,
        totalCasesChartConfiguration()
      );
    }
    if (chartType === TOTAL_DEATHS) {
      chartInstance.current = new Chart(
        chartRef,
        totalDeathsChartConfiguration()
      );
    }
  }, [
    dataFetched,
    percentageCasesSeriesData,
    totalCasesSeriesData,
    totalDeathsSeriesData,
    chartType,
    fullscreenEnabled,
    toggleFullscreen,
  ]);

  const isDataReady = () => {
    if (chartType === PERCENTAGE_CASES) {
      return percentageCasesSeriesData !== null;
    }
    if (chartType === TOTAL_CASES) {
      return totalCasesSeriesData !== null;
    }
    if (chartType === TOTAL_DEATHS) {
      return totalDeathsSeriesData !== null;
    }
    return false;
  };

  function getScreenModeClassName() {
    if (isDataReady()) {
      return fullscreenEnabled
        ? "full-screen chart-container"
        : "chart-container";
    } else {
      return "chart-container hidden-chart";
    }
  }

  return (
    <>
      <div className={getScreenModeClassName()}>
        <canvas ref={chartContainer} />
      </div>
      {isDataReady() ? <></> : <LoadingComponent />}
    </>
  );
};

export default DataCharts;
