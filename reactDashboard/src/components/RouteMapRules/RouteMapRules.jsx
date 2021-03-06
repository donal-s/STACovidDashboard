import React from "react";
import "./RouteMapRules.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const RouteMapRules = () => {
  function createLink(url, text) {
    return (
      <a
        className="link"
        id="link"
        target="_blank"
        rel="noopener noreferrer"
        href={url}
      >
        {text}
      </a>
    );
  }
  return (
    <Container fluid className="d-flex flex-column">
      <Row>
        <Col className="hr-container">
          <hr aria-hidden={true} className="full-width-hr" />
        </Col>
      </Row>
      <Row>
        <Col xs="12" className="headline-banner">
          <p>
            There are a number of{" "}
            <span className="headline-banner-highlight">
              Regional Restrictions
            </span>{" "}
            to help fight the pandemic. See the{" "}
            {createLink(
              "https://www.gov.scot/publications/coronavirus-covid-19-local-measures/",
              "latest Scottish Government guidance"
            )}
            .
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default RouteMapRules;
