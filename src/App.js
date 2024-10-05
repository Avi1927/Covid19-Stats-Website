import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('India');
    const [dates, setDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [stats, setStats] = useState([]);

    // Utility function to format date as dd-mm-yyyy
    const formatDate = (date) => {
        const [year, month, day] = date.split('-');
        return `${day}-${month}-${year}`;
    };

    // Fetch countries on component mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await axios.get('https://covid-193.p.rapidapi.com/countries', {
                    headers: {
                        'X-RapidAPI-Key': 'c994f4b868msh5dc8b51945e63c2p1d6729jsnaded16128cf2',
                    },
                });
                setCountries(response.data.response);
                setSelectedCountry('India'); // Set India as the default country
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };

        fetchCountries();
    }, []);

    // Fetch statistics for the selected country and date
    const fetchStatistics = useCallback(async (date) => {
        try {
            const response = await axios.get(`https://covid-193.p.rapidapi.com/history?country=${selectedCountry}&day=${date}`, {
                headers: {
                    'X-RapidAPI-Key': 'c994f4b868msh5dc8b51945e63c2p1d6729jsnaded16128cf2',
                },
            });
            setStats(response.data.response);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    }, [selectedCountry]);  // Memoize the function, dependency is `selectedCountry`

    // Fetch dates when the selected country changes (initially India)
    useEffect(() => {
        if (selectedCountry) {
            const fetchDates = async () => {
                try {
                    const response = await axios.get(`https://covid-193.p.rapidapi.com/history?country=${selectedCountry}`, {
                        headers: {
                            'X-RapidAPI-Key': 'c994f4b868msh5dc8b51945e63c2p1d6729jsnaded16128cf2',
                        },
                    });
                    const history = response.data.response;
                    if (history.length > 0) {
                        const latestDate = history[0].day;
                        setDates(history.map(stat => stat.day));
                        setSelectedDate(latestDate);
                        fetchStatistics(latestDate);  // Fetch statistics for the latest date
                    }
                } catch (error) {
                    console.error('Error fetching dates:', error);
                }
            };

            fetchDates();
        }
    }, [selectedCountry, fetchStatistics]);  // Include `fetchStatistics` in dependency array

    const handleCountryChange = (e) => {
        setSelectedCountry(e.target.value);
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        fetchStatistics(e.target.value);
    };

    return (
        <div id="form">
            <h1>COVID-19 Statistics</h1>
            <div className="drop">
                <h4>Select a Country</h4>
                <select className="form-select" id="searchBy" value={selectedCountry} onChange={handleCountryChange}>
                    {countries.map((country, index) => (
                        <option key={index} value={country}>{country}</option>
                    ))}
                </select>
            </div>
            <div className="dateDrop">
                <h4>Select a Date</h4>
                <select id="select-date" className="dateSelect" value={selectedDate} onChange={handleDateChange}>
                    {dates.map((date, index) => (
                        <option key={index} value={date}>{formatDate(date)}</option>
                    ))}
                </select>
                <button id="getDate" onClick={() => fetchStatistics(selectedDate)}>Get Data</button>
            </div>

            <div id="table-container">
                <table id="stats-table">
                    <thead>
                        <tr>
                            <th>Active Cases</th>
                            <th>Total Cases</th>
                            <th>Deaths</th>
                            <th>Recovered</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.length > 0 ? stats.map((stat, index) => (
                            <tr key={index}>
                                <td>{stat.cases.active ? stat.cases.active : 'Null cases'}</td>
                                <td>{stat.cases.total ? stat.cases.total : 'Null cases'}</td>
                                <td>{stat.deaths.total ? stat.deaths.total : 'Null cases'}</td>
                                <td>{stat.cases.recovered ? stat.cases.recovered : 'Null cases'}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4">No data available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default App;
