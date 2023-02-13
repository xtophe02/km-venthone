import { useState, useEffect } from "react";
import _ from "lodash";
import axios from "axios";
import Image from "next/image";
// import { exportPdf } from "@/utils/exportPdf";
import Link from "next/link";
import jsPDF from "jspdf";
import "jspdf-autotable";

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Home() {
  const [values, setValues] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [name, setName] = useState("");
  // const [homeAddress, setHomeAddress] = useState("diegem");

  //to remove
  const [jsonValues, setJsonValues] = useState([]);

  // debounce the handleDistance function with a delay of 2 seconds
  useEffect(() => {
    _.debounce(() => {}, 2000).cancel(); // cancel any pending debounced calls when the component unmounts

    createDatesArray(selectedMonth, selectedYear);

    return () => _.debounce(() => {}, 2000).cancel();
  }, [selectedMonth, selectedYear]);

  const createDatesArray = (month, year) => {
    let date = new Date();
    date.setMonth(month);
    date.setFullYear(year);
    date.setDate(1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    const dates = [];
    for (let d = date; d <= lastDay; d.setDate(d.getDate() + 1)) {
      dates.push({
        date: `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
          "0" + d.getDate()
        ).slice(-2)}`,
        description: "",
        from: "",
        to: "",
        distance: 0,
      });
    }
    setValues(dates);
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    setValues((prevValues) => {
      const newValues = [...prevValues];
      newValues[index][name] = value;
      if (newValues[index].from && newValues[index].to) {
        _.debounce(() => callApi(index, newValues), 2000)(index);
      }

      return newValues;
    });
  };

  const callApi = async (index, newValues) => {
    try {
      const { data } = await axios.post("/api/distance", {
        from: newValues[index].from,
        to: newValues[index].to,
      });

      setValues((prevValues) => {
        const newValues = [...prevValues];
        newValues[index].distance = Number(data.distance / 1000);
        return newValues;
      });
      // return data;
    } catch (err) {
      console.error(err);
    }
  };

  function handleAddDay(val, index) {
    const newArray = values
      .slice(0, index + 1)
      .concat({ ...val, from: val.to, to: val.from }, values.slice(index + 1));

    setValues(newArray);
  }
  const handleRemove = (index) => {
    let newArray = [...values];
    newArray.splice(index, 1);
    setValues(newArray);
  };
  function calTotalKm() {
    return values.reduce((acc, cur) => acc + cur.distance, 0);
  }
  function isWeekend(date) {
    const d = new Date(date);

    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    return isWeekend;
  }
  async function exportKm() {
    const nonZeroValues = values.filter((value) => value.distance !== 0);
    const { data } = await axios.post("/api/export", {
      data: JSON.stringify(nonZeroValues),
    });
    // console.log(JSON.parse(data));
    setJsonValues(data);
  }
  function exportToPdf() {
    // Create a new pdf document
    const doc = new jsPDF();

    // Set the font and size
    // doc.setFont("helvetica");
    // doc.setFontSize(14);
    doc.addImage("/triglav.png", "PNG", 90, 10, 30, 30);
    // doc.addPage();
    // Add the data to the pdf
    // values.forEach(function (value) {
    //   if (value.distance != 0) {
    //     doc.text(`Date: ${value.date}`, 10, 10);
    //     doc.text(`From: ${value.from}`, 10, 20);
    //     doc.text(`To: ${value.to}`, 10, 30);
    //     doc.text(`Discription: ${value.description}`, 10, 40);
    //     doc.text(`Distance: ${value.distance}`, 10, 50);
    //     doc.addPage();
    //   }
    // });
    // doc.text(`Total: ${calTotalKm().toFixed(2)}`, 10, 10);
    // Save the pdf
    doc.text("Vehicle Mileage", 10, 50);
    doc.text(name, 10, 60);
    doc.autoTable({
      styles: { fontSize: 8 },
      margin: { top: 70 },
      didDrawPage: function (data) {
        // Reseting top margin. The change will be reflected only after print the first page.
        data.settings.margin.top = 10;
      },
      head: [["Day", "Activity", "Origin", "Destination", "Distance (km)"]],
      body: values.map((res) => {
        // console.log(addressesWithPrevious);
        return [
          {
            content: res.date,
          },
          {
            content: res.description,
          },
          {
            content: res.from,
            styles: { halign: "center" },
          },
          {
            content: res.to,
            styles: { halign: "center" },
          },

          {
            content: res.distance.toFixed(2),
            styles: { fontStyle: "bold", minCellHeight: 4 },
          },
        ];
      }),

      foot: [["Total", "", "", "", `${calTotalKm().toFixed(2)} km`]],
    });

    doc.save("km.pdf");
  }
  return (
    <main className="section">
      <div className="container">
        <div className="hero">
          <div className="hero-body">
            <div className="media">
              <div className="media-left">
                <Image
                  // className={styles.logo}
                  src="/venthone.png"
                  alt="Venthone Logo"
                  width={120}
                  height={120}
                  priority
                />
              </div>
              <div className="media-content">
                <h1 className="title">KM sheet</h1>
                <h2 className="subtitle">Automated KM sheet</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="columns">
          <div className="column is-half">
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
            {/* <div className="field">
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
            </div> */}
          </div>
        </div>

        <label htmlFor="" className="label">
          Select month and year
        </label>
        <div className="field is-grouped">
          <div className="control">
            <div className="select">
              <select
                onChange={(e) => setSelectedMonth(e.target.value)}
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
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            />
          </div>
          <div className="control">
            <button className="button is-primary" onClick={() => exportKm()}>
              <span>Export</span>
              <span className="icon">
                <i className="fas fa-file-export"></i>
              </span>
            </button>
          </div>
          <div className="control">
            <button
              className="button is-danger"
              // onClick={() =>
              //   exportPdf(
              //     "/venthone.png",
              //     values,
              //     calTotalKm(),
              //     name,
              //     homeAddress
              //   )
              // }
              onClick={exportToPdf}
            >
              <span>Export to PDF</span>
              <span className="icon">
                <i className="fas fa-download"></i>
              </span>
            </button>
          </div>
          {/* <div className="control">
            <Link href="/auto-generate" className="button is-info">
              <span>Auto Generate</span>
              <span className="icon">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>
          </div> */}
        </div>

        {jsonValues.length > 0 && <pre>{JSON.stringify(jsonValues)}</pre>}
        <div className="block is-size-6 has-text-centered is-italic">
          It may be beneficial to include the locations <strong>from</strong>{" "}
          and <strong>to</strong> before adding more daily travels, as the next
          destination&apos;s <strong>from</strong> will then be the previous
          destination&apos;s <strong>to</strong>
        </div>
        <table className="table is-fullwidth">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description Activity</th>
              <th>From</th>
              <th>to</th>
              <th>Distance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {values.map((val, index) => (
              <tr
                key={index}
                className={isWeekend(val.date) ? "has-background-light" : ""}
              >
                <td>
                  <input
                    className="input is-small"
                    type="date"
                    value={val.date}
                    name="date"
                    onChange={(e) => handleChange(e, index)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="input is-small"
                    placeholder="description"
                    value={val.description}
                    name="description"
                    onChange={(e) => handleChange(e, index)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="input is-small"
                    placeholder="from"
                    value={val.from}
                    name="from"
                    onChange={(e) => handleChange(e, index)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="input is-small"
                    placeholder="to"
                    value={val.to}
                    name="to"
                    onChange={(e) => handleChange(e, index)}
                  />
                </td>
                <td>
                  <p>{val.distance.toFixed(2)} km</p>
                </td>
                <td>
                  <div className="buttons is-small">
                    <button
                      onClick={() => handleAddDay(val, index)}
                      className="button is-small is-outlined is-primary"
                    >
                      <span className="icon is-small ">
                        <i className="fas fa-plus"></i>
                      </span>
                    </button>
                    <button
                      onClick={() => handleRemove(index)}
                      className="button is-small is-outlined is-danger"
                    >
                      <span className="icon is-small ">
                        <i className="fas fa-trash"></i>
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th></th>
              <th></th>
              <th></th>
              <th className="has-text-right">Total:</th>
              <th>{calTotalKm().toFixed(2)} km</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </main>
  );
}
