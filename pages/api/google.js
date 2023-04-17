import axios from "axios";
import path from "path";
import fs from "fs";

export default async (req, res) => {
  const API_KEY = process.env.GOOGLE_API_KEY;
  const { homeAddress, month, year, minKm , portfolio} = req.body;

  // Get number of days in the given month
  const daysInMonth = new Date(year, month, 0).getDate();
  // console.log('MONTH:',month , daysInMonth)
  // Generate list of all days in the month
  const days = [];
  // console.log(daysInMonth, year, month);
  for (let i = 1; i < daysInMonth+1; i++) {
    const date = new Date(year, month-1, i + 1);
    
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      days.push(date);
    }
  }
  // console.log(days[0],'-',days[days.length-1]);

  //PORTFOLIO
  let addresses = []
  if(portfolio === 'venthone'){
    const jsonDirectory = path.join(process.cwd(), "csv");

   addresses = JSON.parse(fs.readFileSync(jsonDirectory + "/data.json"));
  }
  if(portfolio === 'mark'){
    const cities = ["Brussels", "Antwerp", "Ghent", "Leuven", "Liège", "Namur", "Charleroi", "Mons", "Bruges", "Ostend", "Mechelen", "Genk", "Kortrijk"];
    const offices = ["Engie Office", "Proximus Office", "Solvay Office", "Orange Office", "USB Office"];
    for (let i = 0; i < offices.length; i++) {
      for (let j = 0; j < cities.length; j++) {
        addresses.push({ code: offices[i], address: cities[j] });
      }
    }
    addresses.push({code:'European Comission Brussels',address:'Brussels'})
    addresses.push({code:'European Comission Luxembourg',address:'Luxembourg'})
    addresses.push({code:'European Comission Strasbourg',address:'Strasbourg'})
  }
  const results = [];
  let totalDistance = 0;

  // Calculate distance for each day in the month
  for (let day of days) {
    let origin = homeAddress;
    const addressesAndDistances = [];
    const randomAddressCount = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < randomAddressCount; i++) {
      let addressIndex = Math.floor(Math.random() * addresses.length);
      let address = addresses[addressIndex];

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${address.address}&key=${API_KEY}`
      );

      const data = response.data.rows[0].elements[0];
      if (!data.hasOwnProperty("distance")) {
        continue;
      }
      addressesAndDistances.push({
        address,
        distance: data.distance.value || 0,
      });

      // Ensure that we don't use the same address twice in one day
      addresses.splice(addressIndex, 1);
      origin = address.address;
    }

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${homeAddress}&key=${API_KEY}`
    );
    const distance = response.data.rows[0].elements[0];
    if (!distance.hasOwnProperty("distance")) {
      continue;
    }
    addressesAndDistances.push({
      address: { address: homeAddress },
      distance: distance.distance.value,
    });

    results.push({ day, addressesAndDistances });
    // console.log(results);
    totalDistance = results.reduce((acc, { addressesAndDistances }) => {
      return (
        acc +
        addressesAndDistances.reduce((acc, { distance }) => acc + distance, 0)
      );
    }, 0);
    // console.log(totalDistance, minKm * 1000);
    if (results.length === daysInMonth || totalDistance >= minKm * 1000) {
      break;
    }
  }

  res.status(200).json({ results, totalDistance });
};
