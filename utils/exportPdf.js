import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportPdf = (
  imageUrl,
  results,
  totalDistance,
  name,
  homeAddress
) => {
  const doc = new jsPDF();

  doc.addImage(imageUrl, "PNG", 20, 10, 20, 20);
  // doc.addImage(imageUrl, "JPG", 90, 10, 30, 30);
  // doc.setFontSize(18);
  // doc.text("Vehicle Mileage", 10, 50);
  // doc.setFontSize(12);
  // doc.text(name, 10, 60);
  // doc.setFontSize(12);
  // doc.text(results[0].day.slice(0, 7), 10, 70);
  // doc.addImage("/triglav.jpg", "JPG", 20, 10, 20, 20);
  doc.setFontSize(18);
  doc.text("Vehicle Mileage", 90, 10);
  doc.setFontSize(12);
  doc.text(name, 90, 20);
  doc.setFontSize(12);
  doc.text(results[0].day.slice(0, 7), 90, 30);
  doc.autoTable({
    styles: { fontSize: 8 },
    margin: { top: 40 },
    didDrawPage: function (data) {
      // Reseting top margin. The change will be reflected only after print the first page.
      data.settings.margin.top = 10;
    },
    head: [["Day", "Activity", "Origin", "Destination", "Distance (km)"]],
    body: results.map((res) => {
      const addressesWithPrevious = [
        { address: { address: homeAddress } },
        ...res.addressesAndDistances.filter(
          (_, i) => i !== res.addressesAndDistances.length - 1
        ),
      ];
      // console.log(addressesWithPrevious);
      return [
        {
          content: res.day.slice(0, 10),
        },
        {
          content: res.addressesAndDistances
            .map((r) => `${r.address.code ? r.address.code : "HOME"}\n`)
            .join(""),
        },
        {
          content: addressesWithPrevious
            .map((r) => r.address.address + "\n")
            .join(""),
          styles: { halign: "center" },
        },
        {
          content: res.addressesAndDistances
            .map((r) => r.address.address + "\n")
            .join(""),
          styles: { halign: "center" },
        },

        {
          content: res.addressesAndDistances
            .map((r) => (r.distance / 1000).toFixed(2) + "\n")
            .join(""),
          styles: { fontStyle: "bold", minCellHeight: 4 },
        },
      ];
    }),

    foot: [["Total", "", "", "", `${(totalDistance / 1000).toFixed(2)} km`]],
  });

  doc.save(
    `${name.replace(/ +/g, "")}_${new Date(results[0].day).getFullYear()}-${
      new Date(results[0].day).getMonth() + 1
    }_${(totalDistance / 1000).toFixed(2)}.pdf`
  );
};
