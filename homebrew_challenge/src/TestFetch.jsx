import React, { useState, useEffect, useRef } from "react";
import { getRequest } from './helpers/requests';

const TestFetch = () => {
  const [results, setResults] = useState([]);
  const componentIsMounted = useRef(true);

  useEffect(() => {
    getRequest()
      .then(response => {
        if (componentIsMounted.current) {
          setResults(response);
        }
      })
      .catch(err => {
        console.log(err);
      });
    return () => {
      componentIsMounted.current = false;
    };
  }, []);
  return (
    <></>
  );
};

export default TestFetch;
