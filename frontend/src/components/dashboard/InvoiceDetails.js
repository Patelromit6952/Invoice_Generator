import React, { useEffect, useState } from "react";
import "../dashboard/invoicedetails.css";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toWords } from "number-to-words";
import { format } from "date-fns";

const InvoiceDetails = () => {
  const location = useLocation();
  const [data, setData] = useState(location.state);
const createdAtRaw = data.createdAt;
const createdAtDate = new Date(
  createdAtRaw.seconds * 1000 + Math.floor(createdAtRaw.nanoseconds / 1e6)
);
  
  const printInvoice = () => {
    const input = document.getElementById("invoice");
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [794, 1123] // A4
      });
      const imgProps = pdf.getImageProperties(imageData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imageData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("invoice_" + data.customerName + data.billType+new Date().toISOString() + ".pdf");
    });
  };
  
  return (
    <>
      <div className="invoice-main">
      <div className="main-wrapper" id="invoice">
        <table className="main-table">
          <thead>
            <tr>
              <th colSpan="11" className="div-1">
                Pragati Submersible Pump
              </th>
            </tr>
            <tr>
              <td colSpan="11" className="div-2">
                A-1 , Umiya Godown Near Sardarnagra Society , Kumarpal Road ,Opp
                New Guuj BAzar <br />
                Patan , MO:123456789
              </td>
            </tr>
            <tr>
              <td colSpan="11">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0 40px",
                    fontWeight: "bold",
                    fontSize:'14px'
                  }}
                >
                  <span>{data.pytype} Memo</span>
                  <span>Tax Invoice</span>
                  <span>Original</span>
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="7" className="div-3">
                <br/>
                <b>Ms :</b> {data.customerName} <br />
                <b>Address:</b> {data.customerAddress} <br /><br/>
                <b>Place of Supply:</b> Patan <br />
                <b>GSTIN No: </b> necryiweuynirm <br /><br/>
              </td>
              <td colSpan="4" className="div-3">
                <br/><br/>
                <b>Invoice No:</b> {data.invoiceNo}
                <br />
                <b>Date:</b>{ format(createdAtDate, 'dd/MM/yyyy')}
              </td>
            </tr>

            <tr>
              <th>Sr.no</th>
              <th colSpan="3">Product Name</th>
              <th>HSN</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>GST%</th>
              <th colSpan="3">Amount</th>
            </tr>
            {data.products.map((product, index) => {
              const amount = product.quantity * product.price;
              return (
                <tr key={index} className="items">
                  <td>{index + 1}</td>
                  <td colSpan="3">{product.name}</td>
                  <td>{product.hsn}</td>
                  <td>{product.quantity} {product.qtytype}</td>
                  <td>{product.price}.00</td>
                  <td>{product.gst}%</td>
                  <td colSpan="3">{product.total}.00 /-</td>
                </tr>
              );
            })}

            {[...Array(15 - data.products.length)].map((_, i) => (
              
              <tr key={`empty-${i}`} className="empty-row">
                <td>&nbsp;{}</td>
                <td colSpan="3">{}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td colSpan="3"></td>
              </tr>
            ))}
            <tr>
              <td colSpan="8" className="div-3">
                <b>GSTIN No :</b> nwvxemiela,emuvsnkut
              </td>
              <td colSpan="3" className="div-3">
                <b>Subtotal:</b> ₹{data.grandTotal}.00
              </td>
            </tr>
            <tr>
              <td colSpan="8" className="div-3">
                <b>Bank Name:</b> Bank of Baroda <br />
                <b>Account No:</b> 7428368685 <br />
                <b>RTGS/IFSC:</b> 132465798
              </td>
              <td colSpan="3" className="div-3">
                <b>Taxable :</b> ₹{data.grandTotal}.00 <br />
                <b>CGST :</b> ₹{((data.grandTotal * (data.products[0].gst/100))/2).toFixed(0)}.00 <br />
                <b>SGST :</b> ₹{((data.grandTotal * (data.products[0].gst/100))/2).toFixed(0)}.00
              </td>
            </tr>
            <tr>
              <td colSpan="8" className="div-3">
                <b>Total GST :</b> ₹{((data.grandTotal * (data.products[0].gst/100))/2+(data.grandTotal * (data.products[0].gst/100))/2.).toFixed(0)}.00 <br />
                <b>Bill Amount :</b> ₹{((data.grandTotal * (data.products[0].gst/100))/2+(data.grandTotal * (data.products[0].gst/100))/2+data.grandTotal).toFixed(0)}.00 ({toWords((data.grandTotal * (data.products[0].gst/100))/2+(data.grandTotal * (data.products[0].gst/100))/2+data.grandTotal)} rupees only)
              </td>
              <td colSpan="3" className="div-3" style={{ backgroundColor: "#eee" }}>
                <b>Grand Total :</b> ₹{((data.grandTotal * (data.products[0].gst/100))/2+(data.grandTotal * (data.products[0].gst/100))/2 + data.grandTotal).toFixed(0)}.00
              </td>
            </tr>
            <tr>
              <td colSpan="11">
                <div
                  style={{
                    border: "1px solid black",
                    padding: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    fontSize: "14px"
                  }}
                >
                  <div  className="t-c">
                    <b>Terms & Condition :</b>
                    1. Goods once sold will not be taken back.
                    <br />
                    2. Interest @18% p.a. will be charged if payment is not made
                    within due date.
                    <br />
                    3. Our risk and responsibility ceases as soon as the goods
                    leave our premises.
                    <br />
                    4. "Subject to 'Patan' jurisdiction only. E.& O.E"
                  </div>
                  <div style={{ textAlign: "right" }} className="auth">
                    <p>for, PRAGATI SUBMERSIBLE PUMP</p>
                    <br />
                    <br/>
                    <br />
                    <p>(Authorized Signatory)</p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button onClick={printInvoice} type="button" className="print-btn">PRINT INVOICE</button>
      </div>
    </>
  );
};

export default InvoiceDetails;
