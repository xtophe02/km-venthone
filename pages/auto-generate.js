import React, { useState } from "react";
import axios from "axios";

// import venthone from "../public/venthone.png";
import { months } from ".";
// import Navbar from "@/components/Navbar";
import { exportPdf } from "@/utils/exportPdf";
import Modal from "@/components/Modal";

export default function AutoGenerate() {
  const [name, setName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [minDistance, setMinDistance] = useState(2000);
  const [results, setResults] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    open: false,
    username: "",
    password: "",
  });

  const imageUrl =
    "https://www.venthone.lu/wp-content/uploads/2021/07/logo-venthone.png";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data } = await axios.post("/api/checkCredentials", {
      username: credentials.username,
      password: credentials.password,
    });

    if (!data.data) {
      setCredentials((prev) => ({ ...prev, open: !prev.open }));
      alert("invalid credentials");

      return;
    }
    setCredentials((prev) => ({ ...prev, open: !prev.open }));
    if (name.trim().length <= 0 || homeAddress.trim().length <= 0) {
      alert("insert name");
      return;
    }
    setLoading(true);
    const response = await axios.post(`/api/google`, {
      homeAddress,
      month: new Date(`${month} 1, 2023`).getMonth() + 1,
      year,
      minKm: minDistance,
    });
    // console.log(response);
    setLoading(false);
    setTotalDistance(response.data.totalDistance);
    setResults(response.data.results);
  };
  function credentialsHandler(e) {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  }
  function modalHandler() {
    // console.log("teste");
    setCredentials((prev) => ({ ...prev, open: !prev.open }));
  }
  return (
    <>
      <Modal
        credentials={credentials}
        credentialsHandler={credentialsHandler}
        modalHandler={modalHandler}
        handleSubmit={handleSubmit}
      />
      <main className="section">
        <section className="container">
          <div>
            <div className="field">
              <label htmlFor="name" className="label">
                Your Name:
              </label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="homeAddress" className="label">
                Home Address:
              </label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  id="homeAddress"
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                />
              </div>
            </div>
            <label htmlFor="" className="label">
              Select month and year
            </label>
            <div className="field is-grouped">
              <div className="control">
                <div className="select">
                  <select
                    onChange={(e) => setMonth(e.target.value)}
                    defaultValue={month}
                  >
                    {months.map((month, index) => (
                      <option value={index + 1} key={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="control">
                <input
                  className="input"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="minDistance" className="label">
                Minimum Distance:
              </label>
              <div className="control">
                <input
                  className="input"
                  type="number"
                  id="minDistance"
                  value={minDistance}
                  onChange={(e) => setMinDistance(e.target.value)}
                />
              </div>
            </div>
            <div className="field is-grouped">
              <div className="control">
                <button
                  className={`button ${loading && "is-loading"} is-info`}
                  // type="submit"
                  // disabled={results.length > 0}
                  onClick={modalHandler}
                >
                  Generate
                </button>
              </div>
              <div className="control">
                <button
                  className="button is-danger"
                  type="button"
                  onClick={() => {
                    exportPdf(
                      imageUrl,
                      results,
                      totalDistance,
                      name,
                      homeAddress
                    );
                    setResults([]);
                    setTotalDistance(0);
                  }}
                  disabled={results.length <= 0}
                >
                  Export to PDF
                </button>
              </div>
            </div>

            <table className="table is-fullwidth">
              <tbody>
                {results.map((result, index) => (
                  <tr key={index}>
                    <th>{result.day.slice(0, 10)} </th>
                    <td>
                      {result.addressesAndDistances.map((add, i) => (
                        <div key={add.distance} className="columns">
                          <div className="column">
                            {add.address.code === undefined
                              ? "HOME"
                              : add.address.code}
                          </div>
                          <div className="column">
                            {i === 0
                              ? homeAddress
                              : result.addressesAndDistances[i - 1]?.address
                                  .address}
                          </div>
                          <div className="column">{add.address.address}</div>
                          <div className="column">
                            {(add.distance / 1000).toFixed(2)} km
                          </div>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>Total</th>
                  <td>{(totalDistance / 1000).toFixed(2)} km</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
