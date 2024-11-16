import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

function EmailStatusDashboard() {
  const [emailStatusCount, setEmailStatusCount] = useState({});
  const [responseRate, setResponseRate] = useState(0);

  // Function to fetch email status counts
  useEffect(() => {
    const fetchEmailStatusCount = () => {
      axios.get('http://localhost:5000/api/email-status-count')
        .then(response => {
          const data = response.data;

          // Update status counts
          setEmailStatusCount(data);

          // Calculate response rate if applicable (Sent vs Delivered or similar)
          if (data.Sent && data.Failed) {
            const rate = ((data.Sent - data.Failed) / data.Sent) * 100;
            setResponseRate(rate.toFixed(2)); // Example of response rate calculation
          }
        })
        .catch(error => console.error("Error fetching email status count:", error));
    };

    fetchEmailStatusCount(); // Fetch on load

    const intervalId = setInterval(fetchEmailStatusCount, 50000); // Poll every 50 seconds

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, []);

  // Filter out any status with 0 value
  const filteredData = [
    { name: 'Sent', value: emailStatusCount.Sent || 0 },
    { name: 'Scheduled', value: emailStatusCount.Pending || 0 },
    { name: 'Failed', value: emailStatusCount.Failed || 0 },
  ].filter(item => item.value > 0); // Filter out zero-value items

  const COLORS = ['#9c27b0', '#00C49F', '#FFBB28', '#FF8042']; // Purple color theme

  return (
    <div className="email-dashboard">
      <h2>Email Status Analytics Dashboard</h2>

      <div className="analytics-charts">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={150}
              fill="#8884d8"
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="email-status-summary">
        <div className="status-counter">
          <h3>Total Emails Sent - {emailStatusCount.Sent || 0} | Emails Scheduled - {emailStatusCount.Pending || 0} | Emails Failed - {emailStatusCount.Failed || 0}</h3>
        </div>
      </div>
    </div>
  );
}

export default EmailStatusDashboard;
