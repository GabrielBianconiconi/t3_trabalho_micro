// frontend/src/components/Dashboard.js
import React, { useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './Dashboard.css'; // Importa o CSS
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [sensorData, setSensorData] = useState({ temperature: null, humidity: null });
  const [countryData, setCountryData] = useState({ capital: '', temperature: null, humidity: null });
  const [selectedCountry, setSelectedCountry] = useState('Japan');
  const [error, setError] = useState(null);

  const raspberryPiIP = process.env.REACT_APP_RASPBERRY_PI_IP || 'http://127.0.0.1:5000';
  const weatherApiKey = process.env.REACT_APP_WEATHER_API_KEY;

  const countries = ['Japan', 'USA', 'Brazil', 'Canada', 'France', 'Germany', 'China', 'India', 'Russia', 'Australia'];

  // Função para buscar dados do sensor DHT11
  const fetchSensorData = async () => {
    try {
      const response = await axios.get(`${raspberryPiIP}/sensor-data`);
      setSensorData(response.data);
    } catch (err) {
      setError("Erro ao buscar dados do sensor");
    }
  };

  
  // Função para buscar dados climáticos da capital do país
  const fetchCountryData = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${selectedCountry}&appid=${weatherApiKey}&units=metric`
      );
      const { name: capital, main: { temp, humidity } } = response.data;
      setCountryData({ capital, temperature: temp, humidity });
    } catch (err) {
      setError("Erro ao buscar dados do clima do país");
    }
  };

  // Define o estilo de fundo com base na temperatura e umidade
  const backgroundStyle = {
    background: `linear-gradient(to bottom, 
      rgba(255, ${255 - countryData.temperature * 5}, ${255 - countryData.humidity * 2}, 0.8), 
      rgba(${255 - countryData.temperature * 3}, ${255 - countryData.humidity * 4}, 255, 0.8))`
  };

  const chartData = {
    labels: ['Temperatura (°C)', 'Umidade (%)'],
    datasets: [
      {
        label: 'Local (DHT11)',
        data: [sensorData.temperature, sensorData.humidity],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: `Capital: ${countryData.capital}`,
        data: [countryData.temperature, countryData.humidity],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard" style={backgroundStyle}>
      <h1>Dashboard de Temperatura e Umidade</h1>

      <div className="controls">
        <label htmlFor="countrySelect">Selecione um país: </label>
        <select id="countrySelect" onChange={(e) => setSelectedCountry(e.target.value)} value={selectedCountry}>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        <button onClick={fetchCountryData}>Buscar Clima da Capital</button>
      </div>

      <div className="controls">
        <button onClick={fetchSensorData}>Buscar Dados do Sensor DHT11</button>
      </div>

      {error ? (
        <p>{error}</p>
      ) : (
        <div className="chart-container">
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
