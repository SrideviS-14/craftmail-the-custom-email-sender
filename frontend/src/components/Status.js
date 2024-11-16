import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Status() {
  const [emailStatuses, setEmailStatuses] = useState([]);

  useEffect(() => {
    const fetchEmailStatuses = () => {
        axios.get('http://localhost:5000/api/email-status')
        .then(response => setEmailStatuses(response.data))
        .catch(error => console.error("Error fetching email statuses:", error));
    };

    fetchEmailStatuses();
    const intervalId = setInterval(fetchEmailStatuses, 50000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, []);

  return (
    <div className="email-dashboard">
      <h2>Email Status Dashboard</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Send Status</th>
            <th>Delivery Status</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(emailStatuses).map((status, index) => (
            <tr key={index}>
              <td>{status.email}</td>
              <td>{status.status}</td>
              <td>{status.delivery_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Status;