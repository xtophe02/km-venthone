import React, { useState } from "react";
import axios from "axios";

// import venthone from "../public/venthone.png";
import { months } from ".";
import Navbar from "@/components/Navbar";
import { exportPdf } from "@/utils/exportPdf";

export default function AutoGenerate() {
  const [name, setName] = useState("Christophe Moreira");
  const [homeAddress, setHomeAddress] = useState("diegem");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [minDistance, setMinDistance] = useState(2000);
  const [results, setResults] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [loading, setLoading] = useState(false);

  const imageUrl =
    "https://www.venthone.lu/wp-content/uploads/2021/07/logo-venthone.png";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await axios.post(`/api/google`, {
      homeAddress,
      month: new Date(`${month} 1, 2023`).getMonth() + 1,
      year,
      minKm: minDistance,
    });
    setLoading(false);
    setTotalDistance(response.data.totalDistance);
    setResults(response.data.results);
  };

  return (
    <>
      <Navbar />
      <main className="section">
        <section className="container">
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name" className="label">
                Your Name:
              </label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  id="namme"
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
                    defaultValue={new Date().getMonth()}
                  >
                    {months.map((month, index) => (
                      <option value={index} key={month}>
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
                  type="submit"
                  disabled={results.length > 0}
                >
                  Generate
                </button>
              </div>
              <div className="control">
                <button
                  className="button is-danger"
                  type="button"
                  onClick={() =>
                    exportPdf(
                      imageUrl,
                      results,
                      totalDistance,
                      name,
                      homeAddress
                    )
                  }
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
          </form>
        </section>
      </main>
    </>
  );
}
