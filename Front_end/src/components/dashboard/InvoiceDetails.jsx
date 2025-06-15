import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toWords } from "number-to-words";
import { format } from "date-fns";
import axios from 'axios'



const InvoiceDetails = () => {
  const location = useLocation();
  const [data] = React.useState(location.state);
  const createdAtRaw = data.createdAt;
  const createdAtDate = new Date(
    createdAtRaw.seconds * 1000 + Math.floor(createdAtRaw.nanoseconds / 1e6)
  );
  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };


  const printInvoice = () => {
    const input = document.getElementById("invoice");
    html2canvas(input, { scale: 2 , useCORS:true,allowTaint:true }).then((canvas) => {
      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [794, 1123], // A4
      });
      const imgProps = pdf.getImageProperties(imageData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imageData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        "invoice_" +
        data.customerName +
        data.billType +
        new Date().toISOString() +
        ".pdf"
      );
    });
  };



  return (
    <>
      <div className="flex flex-col items-center bg-gray-100 py-6">
        <div
          id="invoice"
          className="bg-white w-[794px] h-[1123px] p-5 box-border flex flex-col justify-between border border-black"
        >
          <table className="w-full h-full border-collapse border border-black text-xs font-sans">
            <thead>
              <tr>
                <th
                  colSpan="11"
                  style={{ backgroundColor: 'gray' }}
                  className="bg-red-400 text-black font-bold text-xl h-9 text-center"
                >
                  Pragati Submersible Pump
                </th>
              </tr>
              <tr>
                <td colSpan="11" className="text-center border text-sm py-2">
                  A-1 , Umiya Godown Near Sardarnagra Society , Kumarpal Road ,
                  Opp New Guuj Bazar <br />
                  Patan , Mo: 97730-32446
                </td>
              </tr>
              <tr>
                <td colSpan="11" className="py-2">
                  <div className="flex justify-between px-10 font-bold text-sm">
                    <span>{data.pytype} Memo</span>
                    <span>Tax Invoice</span>
                    <span>Original</span>
                  </div>
                </td>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan="7" className="text-sm border px-2 py-2 align-top">
                  <br />
                  <b>Ms :</b> {data.customerName} <br />
                  <b>Address:</b> {data.customerAddress} <br />
                  <br />
                  <b>Place of Supply:</b> Patan <br />
                  <b>GSTIN No: </b> necryiweuynirm <br />
                  <br />
                </td>
                <td colSpan="4" className="text-sm border px-2 py-2 align-top">
                  <br />
                  <br />
                  <b>Invoice No:</b> {data.invoiceNo}
                  <br />
                  <b>Date:</b> {format(createdAtDate, "dd/MM/yyyy")}
                </td>
              </tr>

              <tr>
                <th className="border border-black py-1">Sr.no</th>
                <th colSpan="3" className="border border-black py-1">
                  Product Name
                </th>
                <th className="border border-black py-1">HSN</th>
                <th className="border border-black py-1">Qty</th>
                <th className="border border-black py-1">Rate</th>
                <th className="border border-black py-1">GST%</th>
                <th colSpan="3" className="border border-black py-1">
                  Amount
                </th>
              </tr>

              {data.products.map((product, index) => (
                <tr key={index} className="text-center">
                  <td className="border border-black py-1">{index + 1}</td>
                  <td
                    colSpan="3"
                    className="border border-black py-1 text-center px-1"
                  >
                    {product.name}
                  </td>
                  <td className="border border-black py-1">{product.hsn}</td>
                  <td className="border border-black py-1">
                    {product.quantity} {product.qtytype}
                  </td>
                  <td className="border border-black py-1">{product.price}.00</td>
                  <td className="border border-black py-1">{product.gst}%</td>
                  <td colSpan="3" className="border border-black py-1">
                    {product.total}.00 /-
                  </td>
                </tr>
              ))}

              {[...Array(15 - data.products.length)].map((_, i) => (
                <tr key={`empty-${i}`} className="text-center">
                  <td className="border-l border-r border-b border-black py-1">
                    &nbsp;
                  </td>
                  <td
                    colSpan="3"
                    className="border border-black border-t-0 py-1"
                  ></td>
                  <td className="border border-black border-t-0 py-1"></td>
                  <td className="border border-black border-t-0 py-1"></td>
                  <td className="border border-black border-t-0 py-1"></td>
                  <td className="border border-black border-t-0 py-1"></td>
                  <td
                    colSpan="3"
                    className="border border-black border-t-0 py-1"
                  ></td>
                </tr>
              ))}

              <tr>
                <td colSpan="8" className="text-sm border px-2 py-2">
                  <b>GSTIN No :</b> nwvxemiela,emuvsnkut
                </td>
                <td colSpan="3" className="text-sm border px-2 py-2">
                  <b>Subtotal:</b> ₹{data.subtotal}.00
                </td>
              </tr>

              <tr>
                <td colSpan="8" className="text-sm border px-2 py-2">
                  <b>Bank Name:</b> Bank of Baroda <br />
                  <b>Account No:</b> 7428368685 <br />
                  <b>RTGS/IFSC:</b> 132465798
                </td>
                <td colSpan="3" className="text-sm border px-2 py-2">
                  <b>Taxable :</b> ₹{((data.grandTotal)).toFixed(0)}.00 <br />
                  <b>CGST :</b>{" "}
                  ₹{((data.grandTotal * (data.products[0].gst / 100)) / 2).toFixed(0)}
                  .00 <br />
                  <b>SGST :</b>{" "}
                  ₹{((data.grandTotal * (data.products[0].gst / 100)) / 2).toFixed(0)}
                  .00
                </td>
              </tr>

              <tr>
                <td colSpan="8" className="text-sm border px-2 py-2">
                  <b>Total GST :</b>{" "}
                  ₹
                  {(
                    (data.grandTotal * (data.products[0].gst / 100)) / 2 +
                    (data.grandTotal * (data.products[0].gst / 100)) / 2
                  ).toFixed(0)}
                  .00 <br />
                  <b>Bill Amount :</b>{" "}
                  ₹
                  {(
                    data.grandTotal
                  ).toFixed(0)}
                  {" "}
                  .00 (
                  {capitalizeWords(
                    toWords(
                      data.grandTotal
                    )
                  )}{" "}
                  rupees only)

                </td>
                <td
                  colSpan="3"
                  className="bg-gray-200 border text-sm px-2 py-2 text-left"
                >
                  <b>Grand Total :</b>{" "}
                  ₹
                  {(
                    data.grandTotal
                  ).toFixed(0)}
                  .00
                </td>
              </tr>

              <tr>
                <td colSpan="11">
                  <div className=" border-black p-2 flex justify-between items-start text-sm">
                    <div className="flex flex-col space-y-1 max-w-[70%]">
                      <b>Terms & Condition :</b>
                      <p>1. Goods once sold will not be taken back.</p>
                      <p>2. Interest @18% p.a. will be charged if payment is not made within due date.</p>
                      <p>3. Our risk and responsibility ceases as soon as the goods leave our premises.</p>
                      <p>4. "Subject to 'Patan' jurisdiction only. E.& O.E"</p>
                    </div>
                    <div className="flex flex-col items-end max-w-[35%]">
                      <p>For, Pragati Submersible Pump</p>
                      <div className="h-16"></div>
                      <p>(Authorized Signatory)</p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          onClick={printInvoice}
          type="button"
          className="mt-5 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          PRINT INVOICE
        </button>
      </div>
    </>
  );
};

export default InvoiceDetails;
