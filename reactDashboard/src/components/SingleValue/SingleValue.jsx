import React from "react";
import ToolTip from "../ToolTips/ToolTip";
import "./SingleValueBar.css";

function SingleValue({
  subtitle,
  tooltip,
  value = "Missing value",
  title,
  id
}) {
  return (
    <div className="single-value" id={id}>
      {tooltip ? <ToolTip tooltip={tooltip} /> : <></>}
      <div className="single-value-heading">
        <strong>{title}</strong>

        <div className="subtitle">{subtitle !== null ? subtitle : ""}</div>
      </div>
      <hr aria-hidden={true} className="single-value-hr" />
      <div className="single-value-number">{value}</div>
    </div>
  );
}

export default SingleValue;
