/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkSingleValue", "expectNormalScotlandValues", "expectValuesUnavailable"] }] */

import React from "react";
import RegionSingleValueBar from "./RegionSingleValueBar";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { FEATURE_CODE_SCOTLAND } from "../Utils/CsvUtils";
import moment from "moment";
import MockDate from "mockdate";

const DATE_TODAY = "2020-10-17";
const DATE_TOMORROW = "2020-10-18";

var container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
  fetch.resetMocks();
  MockDate.set(DATE_TODAY);
});

afterEach(() => {
  // cleanup on exiting
  MockDate.reset();
  unmountComponentAtNode(container);
  container.remove();
  container = null;
  jest.resetAllMocks();
});

describe("single value bar rendering", () => {
  it("scotland available", () => {
    act(() => {
      render(
        <RegionSingleValueBar
          placeStatsMap={testPlaceStatsMap}
          regionCode={FEATURE_CODE_SCOTLAND}
        />,
        container
      );
    });

    expectNormalScotlandValues();
  });

  it("health board available", () => {
    act(() => {
      render(
        <RegionSingleValueBar
          placeStatsMap={testPlaceStatsMap}
          regionCode="S08000017"
        />,
        container
      );
    });

    checkSingleValue("dailyCases", "4", "reported today");
    checkSingleValue("weeklyCases", "501", "last 7 days");
    checkSingleValue("totalCases", "305", "reported since 28 February, 2020");
    checkSingleValue("dailyDeaths", "0", "reported today");
    checkSingleValue("weeklyDeaths", "34", "last 7 days");
    checkSingleValue("totalDeaths", "40", "reported since 28 February, 2020");
  });

  it("council area available", () => {
    MockDate.set(DATE_TOMORROW);
    act(() => {
      render(
        <RegionSingleValueBar
          placeStatsMap={testPlaceStatsMap}
          regionCode="S12000006"
        />,
        container
      );
    });

    checkSingleValue("dailyCases", "1", "reported yesterday");
    checkSingleValue("weeklyCases", "150", "last 7 days");
    checkSingleValue("totalCases", "311", "reported since 28 February, 2020");
    checkSingleValue("dailyDeaths", "2", "reported yesterday");
    checkSingleValue("weeklyDeaths", "37", "last 7 days");
    checkSingleValue("totalDeaths", "40", "reported since 28 February, 2020");
  });

  it("scotland unavailable", () => {
    act(() => {
      render(
        <RegionSingleValueBar
          placeStatsMap={{}}
          regionCode={FEATURE_CODE_SCOTLAND}
        />,
        container
      );
    });

    expectValuesUnavailable();
  });

  it("health board unavailable", () => {
    act(() => {
      render(
        <RegionSingleValueBar placeStatsMap={{}} regionCode="S08000017" />,
        container
      );
    });

    expectValuesUnavailable();
  });

  it("council area unavailable", () => {
    act(() => {
      render(
        <RegionSingleValueBar placeStatsMap={{}} regionCode="S12000006" />,
        container
      );
    });

    expectValuesUnavailable();
  });
});

describe("regionCode", () => {
  it("missing should default to Scotland", () => {
    act(() => {
      render(
        <RegionSingleValueBar placeStatsMap={testPlaceStatsMap} />,
        container
      );
    });

    expectNormalScotlandValues();
  });

  it("null should default to Scotland", () => {
    act(() => {
      render(
        <RegionSingleValueBar
          placeStatsMap={testPlaceStatsMap}
          regionCode={null}
        />,
        container
      );
    });

    expectNormalScotlandValues();
  });

  it("unknown should throw error", () => {
    global.suppressConsoleErrorLogs();

    expect(() => {
      render(
        <RegionSingleValueBar
          placeStatsMap={testPlaceStatsMap}
          regionCode="unknown"
        />,
        container
      );
    }).toThrow("Unrecognised regionCode: unknown");
  });
});

function expectNormalScotlandValues() {
  checkSingleValue("dailyCases", "7", "reported today");
  checkSingleValue("weeklyCases", "1,572", "last 7 days");
  checkSingleValue("totalCases", "19,126", "reported since 28 February, 2020");
  checkSingleValue("dailyDeaths", "3", "reported today");
  checkSingleValue("weeklyDeaths", "86", "last 7 days");
  checkSingleValue("totalDeaths", "2,491", "reported since 28 February, 2020");
}

function expectValuesUnavailable() {
  checkSingleValue("dailyCases", "Not available", "Not available");
  checkSingleValue("weeklyCases", "Not available", "last 7 days");
  checkSingleValue(
    "totalCases",
    "Not available",
    "reported since 28 February, 2020"
  );
  checkSingleValue("dailyDeaths", "Not available", "Not available");
  checkSingleValue("weeklyDeaths", "Not available", "last 7 days");
  checkSingleValue(
    "totalDeaths",
    "Not available",
    "reported since 28 February, 2020"
  );
}

function checkSingleValue(
  singleValueId,
  expectedValue,
  expectedSubtitle = null
) {
  const singleValueElement = container.querySelector("#" + singleValueId);
  const subtitle = singleValueElement.querySelector(".subtitle");
  const value = singleValueElement.querySelector(".single-value-number");
  expect(subtitle.textContent).toBe(
    expectedSubtitle == null ? "" : expectedSubtitle
  );
  expect(value.textContent).toBe(expectedValue);
}

const testDate = moment.utc(DATE_TODAY).valueOf();

const testPlaceStatsMap = {
  S12000006: {
    dailyCases: { date: testDate, value: 1 },
    cumulativeCases: { date: testDate, value: 311 },
    cumulativeDeaths: { date: testDate, value: 40 },
    dailyDeaths: { date: testDate, value: 2 },
    weeklyCases: 150,
    weeklyDeaths: 37,
  },
  S08000017: {
    dailyCases: { date: testDate, value: 4 },
    cumulativeCases: { date: testDate, value: 305 },
    cumulativeDeaths: { date: testDate, value: 40 },
    dailyDeaths: { date: testDate, value: 0 },
    weeklyCases: 501,
    weeklyDeaths: 34,
  },
  S92000003: {
    dailyCases: { date: testDate, value: 7 },
    cumulativeCases: { date: testDate, value: 19126 },
    cumulativeDeaths: { date: testDate, value: 2491 },
    dailyDeaths: { date: testDate, value: 3 },
    weeklyCases: 1572,
    weeklyDeaths: 86,
  },
};
