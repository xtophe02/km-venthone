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

  doc.addImage(imageUrl, "PNG", 90, 10, 30, 30);
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

  doc.save("results.pdf");
};
