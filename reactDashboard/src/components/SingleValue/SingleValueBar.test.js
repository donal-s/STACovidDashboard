/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkSingleValue"] }] */

import React from "react";
import SingleValueBar, { parseNhsCsvData } from "./SingleValueBar";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { readCsvData } from "../Utils/CsvUtils";

var container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
  fetch.resetMocks();
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
  jest.resetAllMocks();
});

const DATE_TODAY = "2020-10-17";
const DATE_TOMORROW = "2020-10-18";

test("singleValueBar renders default data when dataset is null", async () => {
  await act(async () => {
    render(
      <SingleValueBar currentTotalsHealthBoardDataset={null} />,
      container
    );
  });

  checkSingleValue("dailyCases", "0", "reported on 01 January, 1999");
  checkSingleValue("totalCases", "0", "reported since 28 February, 2020");
  checkSingleValue("dailyDeaths", "0", "reported on 01 January, 1999");
  checkSingleValue("totalDeaths", "0", "reported since 28 February, 2020");
  checkSingleValue("fatalityCaseRatio", "0");
});

test("singleValueBar renders dynamic fetched data for today", async () => {
  setMockDate(DATE_TODAY);

  await act(async () => {
    render(
      <SingleValueBar
        currentTotalsHealthBoardDataset={testCurrentTotalsHealthBoardDataset}
      />,
      container
    );
  });

  checkSingleValue("dailyCases", "1,167", "reported today");
  checkSingleValue("totalCases", "46,399", "reported since 28 February, 2020");
  checkSingleValue("dailyDeaths", "15", "reported today");
  checkSingleValue(
    "totalDeaths",
    "2,609",
    "reported since 28 February, 2020"
  );
  checkSingleValue("fatalityCaseRatio", "5.6%");
});

test("singleValueBar renders dynamic fetched data for yesterday", async () => {
  setMockDate(DATE_TOMORROW);

  await act(async () => {
    render(
      <SingleValueBar
        currentTotalsHealthBoardDataset={testCurrentTotalsHealthBoardDataset}
      />,
      container
    );
  });

  checkSingleValue("dailyCases", "1,167", "reported yesterday");
  checkSingleValue("totalCases", "46,399", "reported since 28 February, 2020");
  checkSingleValue("dailyDeaths", "15", "reported yesterday");
  checkSingleValue(
    "totalDeaths",
    "2,609",
    "reported since 28 February, 2020"
  );
  checkSingleValue("fatalityCaseRatio", "5.6%");
});

test("singleValueBar renders dynamic fetched data with missing NHS data", async () => {
  setMockDate(DATE_TOMORROW);

  await act(async () => {
    render(
      <SingleValueBar
        currentTotalsHealthBoardDataset={readCsvData(missingNhsCsvData)}
      />,
      container
    );
  });

  checkSingleValue("dailyCases", "Not available", "Not available");
  checkSingleValue(
    "totalCases",
    "Not available",
    "reported since 28 February, 2020"
  );
  checkSingleValue("dailyDeaths", "Not available", "Not available");
  checkSingleValue(
    "totalDeaths",
    "Not available",
    "reported since 28 February, 2020"
  );
  checkSingleValue("fatalityCaseRatio", "Not available");
});

test("parseNhsCsvData", () => {
  const date = Date.parse(DATE_TODAY);
  const expectedResult = {
    cases: { date: date, value: 1167 },
    deaths: { date: date, value: 15 },
    cumulativeCases: { date: date, value: 46399 },
    cumulativeDeaths: { date: date, value: 2609 },
    fatalityCaseRatio: "5.6%",
  };

  expect(parseNhsCsvData(testCurrentTotalsHealthBoardDataset)).toStrictEqual(
    expectedResult
  );
});

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

function setMockDate(date) {
  jest
    .spyOn(global.Date, "now")
    .mockImplementation(() => Date.parse(date).valueOf());
}

const nhsCsvData = `Date,HB,HBQF,HBName,NewPositive,TotalCases,CrudeRatePositive,NewDeaths,TotalDeaths,CrudeRateDeaths,TotalNegative,CrudeRateNegative
20201017,S08000015,"",NHS Ayrshire & Arran,103,2888,781.893004115226,1,182,49.2744206194499,54103,14647.7691141434
20201017,S08000016,"",NHS Borders,7,612,529.824257640031,0,40,34.6290364470609,16419,14214.3537356073
20201017,S08000017,"",NHS Dumfries & Galloway,10,663,445.384925433293,0,41,27.5426575305656,22549,15147.7898696762
20201017,S08000019,"",NHS Forth Valley,40,2099,684.516044873467,0,135,44.025567440647,46851,15278.8285937908
20201017,S08000020,"",NHS Grampian,38,2927,499.74389619259,1,153,26.1225883558136,87962,15018.2687382619
20201017,S08000022,"",NHS Highland,11,867,269.505750699409,0,67,20.8268573204849,42067,13076.468759714
20201017,S08000024,"",NHS Lothian,114,7579,835.077899468917,5,501,55.2017453006897,130740,14405.3416778686
20201017,S08000025,"",NHS Orkney,0,26,116.748989672205,0,1,4.49034575662326,2120,9519.53300404131
20201017,S08000026,"",NHS Shetland,0,63,274.869109947644,0,5,21.8150087260035,3462,15104.7120418848
20201017,S08000028,"",NHS Western Isles,3,62,232.035928143713,1,1,3.74251497005988,2808,10508.9820359281
20201017,S08000029,"",NHS Fife,27,1829,489.626556016597,0,129,34.5335296479722,51815,13870.9677419355
20201017,S08000030,"",NHS Tayside,33,3221,771.552446882411,0,208,49.8239394447505,65028,15576.6881452559
20201017,S08000031,"",NHS Greater Glasgow & Clyde,435,15279,1291.41591723578,6,767,64.8285888160119,207931,17574.8022178646
20201017,S08000032,"",NHS Lanarkshire,346,8284,1251.54857229189,1,379,57.259404743919,112787,17039.8851790301
20201017,S92000003,d,Scotland,1167,46399,849.285230538319,15,2609,47.7550198597917,846642,15496.8974795453
`;

const testCurrentTotalsHealthBoardDataset = readCsvData(nhsCsvData);

const missingNhsCsvData = `Date,HB,HBQF,HBName,NewPositive,TotalCases,CrudeRatePositive,NewDeaths,TotalDeaths,CrudeRateDeaths,TotalNegative,CrudeRateNegative`;
