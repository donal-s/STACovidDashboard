import "./SingleValueBar.css";
import SingleValue from "./SingleValue";
import React, { useEffect, useState } from "react";
import { differenceInDays, format, subDays } from "date-fns";
import '../ToolTips/ToolTips';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

// Exported for tests
export function parseCsvData(csvData) {
  function getLatestValue(dateValueMap) {
    const lastDate = [...dateValueMap.keys()].sort().pop();
    const lastValue = dateValueMap.get(lastDate);
    return { date: Date.parse(lastDate), value: lastValue };
  }

  function getLatestDiff(dateValueMap) {
    const dates = [...dateValueMap.keys()].sort();
    const lastDate = dates.pop();
    const secondLastDate = dates.pop();
    const lastValue = dateValueMap.get(lastDate);
    const secondLastValue = dateValueMap.get(secondLastDate);
    return { date: Date.parse(lastDate), value: lastValue - secondLastValue };
  }

  var allTextLines = csvData.split(/\r\n|\n/);
  var lines = [];

  allTextLines.forEach((line) => {
    if (line.length > 0) {
      lines.push(line.split(",").map((s) => s.trim()));
    }
  });
  lines.shift();

  const dailyPositiveTestsMap = new Map();
  const cumulativePositiveTestsMap = new Map();
  const cumulativeTotalTestsMap = new Map();
  const cumulativeDeathsMap = new Map();

  lines.forEach(([date, countType, count], i) => {
    if ("dailyPositiveTests" === countType) {
      dailyPositiveTestsMap.set(date, Number(count));
    } else if ("cumulativePositiveTests" === countType) {
      cumulativePositiveTestsMap.set(date, Number(count));
    } else if ("cumulativeTotalTests" === countType) {
      cumulativeTotalTestsMap.set(date, Number(count));
    } else if ("cumulativeDeaths" === countType) {
      cumulativeDeathsMap.set(date, Number(count));
    } else {
      throw new Error("Unrecognised input: " + countType);
    }
  });

  const totalCases = getLatestValue(cumulativePositiveTestsMap);
  const totalFatalities = getLatestValue(cumulativeDeathsMap);

  return {
    dailyCases: getLatestValue(dailyPositiveTestsMap),
    totalCases: totalCases,
    dailyFatalities: getLatestDiff(cumulativeDeathsMap),
    totalFatalities: totalFatalities,
    fatalityCaseRatio:
      ((totalFatalities.value * 100) / totalCases.value).toFixed(1) + "%",
    dailyTestsCompleted: getLatestDiff(cumulativeTotalTestsMap),
    totalTestsCompleted: getLatestValue(cumulativeTotalTestsMap),
  };
}
const emptyDate = { date: Date.parse("1999-01-01"), value: 0 };

// Exported for tests
export function getDateValueClause() {
  const today = Date.now();
  const yesterday = subDays(Date.now(), 1);
  const dayBefore = subDays(Date.now(), 2);
  const twoDaysBefore = subDays(Date.now(), 3);

  const singleLine = (date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return (
      "( <http://reference.data.gov.uk/id/day/" +
      dateString +
      '> "' +
      dateString +
      '" )'
    );
  };

  return (
    singleLine(today) +
    singleLine(yesterday) +
    singleLine(dayBefore) +
    singleLine(twoDaysBefore)
  );
}

// Exported for tests
export function getRelativeDate(date) {
  const daysDifference = differenceInDays(Date.now(), date);
  if (daysDifference === 0) {
    return "Today";
  }
  if (daysDifference === 1) {
    return "Yesterday";
  }
  if (daysDifference > 1 && daysDifference < 7) {
    return "last " + format(date, "EEEE");
  }
  return format(date, "dd/MM/yyyy");
}

function SingleValueBar() {
  const [dailyCases, setDailyCases] = useState(emptyDate);
  const [totalCases, setTotalCases] = useState(emptyDate);
  const [dailyFatalities, setDailyFatalities] = useState(emptyDate);
  const [totalFatalities, setTotalFatalities] = useState(emptyDate);
  const [fatalityCaseRatio, setFatalityCaseRatio] = useState(0);
  const [dailyTestsCompleted, setDailyTestsCompleted] = useState(emptyDate);
  const [totalTestsCompleted, setTotalTestsCompleted] = useState(emptyDate);
  const [dataFetched, setDataFetched] = useState(false);

  // Get the last 3 days of data, to allow diff of the last two values even when today's data is not available
  const dataUrl = "data/summaryCounts.csv";

  useEffect(() => {
    // Only attempt to fetch data once
    if (!dataFetched) {
      setDataFetched(true);
      fetch(dataUrl, {
        method: "GET",
      })
        .then((res) => res.text())
        .then((csvData) => {
          const {
            dailyCases,
            totalCases,
            dailyFatalities,
            totalFatalities,
            fatalityCaseRatio,
            dailyTestsCompleted,
            totalTestsCompleted,
          } = parseCsvData(csvData);

          setDailyCases(dailyCases);
          setTotalCases(totalCases);
          setDailyFatalities(dailyFatalities);
          setTotalFatalities(totalFatalities);
          setFatalityCaseRatio(fatalityCaseRatio);
          setDailyTestsCompleted(dailyTestsCompleted);
          setTotalTestsCompleted(totalTestsCompleted);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [dataFetched]);

  function blockTitleRow(title) {
    return (
      <Row className="title-row">
        <Col className="title-col">
          <div className="title">{title}</div>
        </Col>
      </Row>
    );
  }

  return (
    <Container fluid className="single-value-bar">
      <Row>
        <Col xs={12} lg={4}>
          {blockTitleRow("Cases")}
          <Row className="single-value-bar-row">
            <Col className="single-value-bar-col">
              <div className="icon">
                <a href="#" data-toggle="tooltip" title="These are the Total Cases from today and reset after 11.59pm (Can be delayed because of data fetching)">
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    size="1x"
                    color="#319bd5"
                  />
                </a>
              </div>
              <SingleValue
                id="dailyCases"
                title={getRelativeDate(dailyCases.date)}
                value={dailyCases.value}
              />
            </Col>
            <Col className="single-value-bar-col">
              <div className="icon">
                <a href="#" data-toggle="tooltip" title="These are the Total Cases of COVID-19 since the COVID-19 Pandemic began">
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    size="1x"
                    color="#319bd5"
                  />
                </a>
              </div>
              <SingleValue
                id="totalCases"
                title="Total"
                value={totalCases.value}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={12} lg={4}>
          {blockTitleRow("Deaths")}
          <Row className="single-value-bar-row">
            <Col className="single-value-bar-col">
              <div className="icon">
                <a href="#" data-toggle="tooltip" title="These are the fatalities from today and reset after 11.59pm (Can be delayed because of data fetching)">
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    size="1x"
                    color="#319bd5"
                  />
                </a>
              </div>
              <SingleValue
                id="dailyFatalities"
                title={getRelativeDate(dailyFatalities.date)}
                value={dailyFatalities.value}
              />
            </Col>
            <Col className="single-value-bar-col">
              <div className="icon">
                <a href="#" data-toggle="tooltip" title="These are the Total Fatalities since the COVID-19 Pandemic began">
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    size="1x"
                    color="#319bd5"
                  />
                </a>
              </div>
              <SingleValue
                id="totalFatalities"
                title="Total"
                value={totalFatalities.value}
              />
            </Col>
            <Col className="single-value-bar-col">
              <div className="icon">
                <a href="#" data-toggle="tooltip" title="This shows the Ratio of Total Fatalities to Total Cases of COVID-19">
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    size="1x"
                    color="#319bd5"
                  />
                </a>
              </div>
              <SingleValue
                id="fatalityCaseRatio"
                title="Death / Case Ratio"
                value={fatalityCaseRatio}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={12} lg={4}>
          {blockTitleRow("Tests Completed")}
          <Row className="single-value-bar-row">
            <Col className="single-value-bar-col">
              <div className="icon">
                <a href="#" data-toggle="tooltip" title="This is how many tests were completed today and resets after 11.59pm (Can be delayed because of data fetching)">
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    size="1x"
                    color="#319bd5"
                  />
                </a>
              </div>
              <SingleValue
                id="dailyTestsCompleted"
                title="Daily"
                value={dailyTestsCompleted.value}
              />
            </Col>
            <Col className="single-value-bar-col">
              <div className="icon">
                <a href="#" data-toggle="tooltip" title="This shows how many COVID-19 Tests have been completed since the beginning of the COVID-19 Pandemic">
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    size="1x"
                    color="#319bd5"
                  />
                </a>
              </div>
              <SingleValue
                id="totalTestsCompleted"
                title="Total"
                value={totalTestsCompleted.value}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default SingleValueBar;
