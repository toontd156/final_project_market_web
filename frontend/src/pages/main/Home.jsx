import { Link, useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from "react";
import Template from "../../components/Template";
import BarChart from "../../components/BarChart";
import image_map from '../../assets/image_map.png';
import { Doughnut, Chart } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import * as FinancialPlugin from 'chartjs-chart-financial';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import dash_board_1 from '../../assets/dash_board_1.jpeg';
import icon_tabler from '../../assets/icon_tabler.png';
import icon_check_payment from '../../assets/icon_check_payment.png';
import icon_edit_user from '../../assets/icon_edit_user.png';
import icon_history from '../../assets/icon_history.png';
import icon_manage_ads from '../../assets/icon_manage_ads.png';
import data_shop_type from '../../conf/config';
import checkToken from '../../func/CheckToken';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, FinancialPlugin);

import '../../index.css';
import bg_home from '../../assets/bg_home.png';
const getNextWeekday = (currentDate, weekday) => {
    const date = new Date(currentDate);
    const daysToAdd = (weekday - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + daysToAdd);
    return date;
};

const getCountdownTime = (targetDate) => {
    const now = new Date();
    const timeDiff = targetDate - now;

    if (timeDiff <= 0) return '00 : 00';

    const day = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${day} Days : ${hours} Hours`;
};

function Home() {
    const [roleIsLogin, setRoleIsLogin] = useState(null)

    const navigate = useNavigate();

    const [nowDate, setNowDate] = useState('');
    const [thaiDate, setThaiDate] = useState('');
    const [countdown, setCountdown] = useState('');
    const [chartDataMoney, setChartDataMoney] = useState({
        datasets: [],
    });
    const [typeChart, setTypeChart] = useState('daily');
    useEffect(() => {
        const currentDate = new Date();
        const currentDay = currentDate.getDay();

        const nextWednesday = getNextWeekday(currentDate, 3);
        const nextFriday = getNextWeekday(currentDate, 5);

        let selectedDate;
        if (currentDay === 0 || currentDay === 1 || currentDay === 2) {
            selectedDate = nextWednesday;
        } else if (currentDay === 3 || currentDay === 4 || currentDay === 5 || currentDay === 6) {
            selectedDate = nextFriday;
        }
        const formattedDate = new Intl.DateTimeFormat("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
            timeZone: "Asia/Bangkok",
        }).format(selectedDate);
        setThaiDate(formattedDate);
        setNowDate(selectedDate.toLocaleDateString("en-GB"));
        fetchDataDashboard();
        getDataShop(selectedDate.toLocaleDateString("en-GB"));
        const token = checkToken();
        
        if (token) {
            const decodeToken = jwtDecode(token);
            setRoleIsLogin(decodeToken.role)
            if (decodeToken.role === 'admin') {
                console.log('fetch data for chart');
                fetchDataForChart(selectedDate.toLocaleDateString("en-GB"));
            }
        }

        const interval = setInterval(() => {
            setCountdown(getCountdownTime(selectedDate));
        }, 1000);

        return () => clearInterval(interval);

    }, []);

    const [chartData, setChartData] = useState({
        datasets: [
            {
                data: [5, 25, 50],
                backgroundColor: ["#87C38F", "#FFE279", "#FF7171"],
                borderWidth: 1,
                borderColor: "#fff",
                hoverOffset: 4,
            },
        ],
    });

    const fetchDataForChart = async (date) => {
        let date_is_coming = date.replace(/\//g, "-");
        try {
            const response = await axios.get('http://localhost:3333/api/getDataForChart', {
                params: { date_is_coming }
            });

            const date_res = response.data.data;

            setChartData((prevState) => ({
                datasets: [
                    {
                        ...prevState.datasets[0],
                        data: [date_res.Approve, date_res.Pending, date_res.Disapproved],
                    },
                ],
            }));

            fetchFinancialData()
        } catch (error) {
            console.log('Error fetching data:', error);
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    }

    const fetchDataDashboard = async () => {
        try {
            const response = await axios.get('http://localhost:3333/api/get_data_ads');
            console.log('response.data.data:', response.data.data);
            setDataDashboard(response.data.data);
        } catch (error) {
            console.error('Error fetching data dashboard:', error);
        }
    };

    const fetchFinancialData = async () => {
        try {
            const response = await axios.get('http://localhost:3333/api/getFinancialData', {
                params: { typeChart }
            });

            const response_data = response.data.data;
            setChartDataMoney({
                labels: [formatDate(response.data.time_stamp)],
                datasets: [
                    {
                        label: `${typeChart} Financial Data`,
                        data: [response_data[0]?.total || 0],
                        borderColor: "#000",
                        borderWidth: 1,
                        backgroundColor: "rgba(0, 123, 255, 0.2)",
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching financial data:', error);
        }
    };
    const labels = ["Available", "Waiting", "Reserved"];
    useEffect(() => {
        const token = checkToken();
        if (token) {
            const decodeToken = jwtDecode(token);
            if (decodeToken.role === 'admin') {
                fetchFinancialData();
            }
        }
    }, [typeChart]);

    const options = {
        plugins: {
            tooltip: {
                enabled: false,
            },
            legend: {
                position: "left",
                labels: {
                    color: "#333",
                    font: {
                        size: 14,
                    },
                },
            },
        },
        cutout: "10%",
    };

    const optionsBar = {
        responsive: true,
        scales: {
            x: {
                type: 'category',
                title: {
                    display: true,
                    text: 'Date',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Price',
                },
                ticks: {
                    beginAtZero: false,
                },
            },
        },
        plugins: {
            legend: {
                display: true,
            },
        },

    };

    const [data_shop, setDataShop] = useState([]);

    const getDataShop = async (original_date) => {
        let date = original_date.replace(/\//g, "-");

        try {
            const response = await axios.post('http://localhost:3333/api/get_market_on_event', { date });
            const result = response.data
            if (result.status) {
                setDataShop(result.data)
            }
        } catch (error) {
            console.log(error);
        }
    }

    const [data_dashboard, setDataDashboard] = useState([
        {
            name_ads: 'Size(Market)',
            high_light: '3*3',
            image_ads: dash_board_1
        },
        {
            name_ads: 'Price(baht)',
            high_light: '50B',
            image_ads: dash_board_1
        },
        {
            name_ads: 'Market day next week',
            get_next_week: true,
            image_ads: dash_board_1
        },
        {
            name_ads: 'MFU exam week',
            high_light: '25-29/11/2024',
            image_ads: dash_board_1
        },
    ]);

    const [filterSearch, setFilterSearch] = useState('all');
    const [searchInput, setSearchInput] = useState('');

    const total = chartData.datasets[0].data.reduce((acc, val) => acc + val, 0);


    return (
        <Template use_me_bg="#fff" use_height={roleIsLogin === null ? false : true}> {
            roleIsLogin === 'user' ? (
                <div className="container-fluid h-100" style={{ background: `url(${bg_home})`, backgroundSize: 'cover' }}>
                    <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100">
                        <div className=" row g-0 w-100" style={{ height: '69vh' }}>
                            <div className="col-4 d-flex align-items-center justify-content-center h-100">
                                <img src={image_map} alt="" className="w-100 h-100 image-fluid" style={{ objectFit: 'contain' }} />
                            </div>
                            <div className="col d-flex flex-column align-items-center justify-content-center h-100">
                                <div className="d-flex flex-column align-items-start justify-content-evenly h-75 w-100">
                                    <div className="d-flex flex-column align-items-start justify-content-start rounded px-5" style={{ gap: '8px' }}>
                                        <span style={{ fontSize: '60px', fontWeight: 800, color: '#6D4C3D', textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>Upcoming market <br /> days : {nowDate}</span>
                                        <span style={{ fontSize: '60px', fontWeight: 800, color: '#6D4C3D', textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>COUNTDOWN</span>
                                        <div className="p-1 px-3" style={{ background: '#A4C3B2', borderRadius: '0.2vh' }}>
                                            <span style={{ fontSize: '34px', fontWeight: 800 }}>{countdown}</span>
                                        </div>
                                        <button className='btn  px-4' onClick={(e) => {
                                            let date_is_coming = nowDate.replace(/\//g, "-");
                                            navigate(`/RequestZone`, { state: { date_is_coming } })
                                        }} style={{ fontSize: '34px', fontWeight: 800, color: '#fff', background: '#6D4C3D', border: '2px solid #000', borderRadius: '5px' }}>BOOKING</button>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="w-100 d-flex align-items-center justify-content-center align-self-stretch">
                            {
                                data_dashboard.filter((item) => item.status_open === 1).map((item, index) => {
                                    return (
                                        <div className="d-flex align-items-center justify-content-between p-2" key={index} style={{ flex: 1, height: '180px', background: index % 2 === 0 ? '#A4C3B2' : '#EAE0D5' }}>
                                            <div className="w-50 h-100 d-flex flex-column align-items-center justify-content-center">
                                                <span style={{ fontSize: '24px', fontWeight: 800, height: '70px' }}>{item.name_ads}</span>
                                                <div className="d-flex align-items-center justify-content-center p-2 px-4 rounded-circle" style={{ background: index % 2 === 0 ? '#EAE0D5' : '#A4C3B2' }}>
                                                    <span style={{ fontSize: item.get_next_week ? '28px' : item.high_light.length > 3 ? '20px' : '36px', fontWeight: 800 }}>{item.get_next_week ? nowDate : item.high_light}</span>
                                                </div>
                                            </div>
                                            <div className="w-50 h-100 d-flex align-items-center justify-content-center">
                                                <img src={`http://localhost:3333${item.image_ads}`} alt="" className='img-fluid rounded' style={{ maxWidth: '150px' }} />
                                            </div>
                                        </div>
                                    )
                                })
                            }

                        </div>
                    </div>
                </div>
            ) : roleIsLogin === 'admin' ? (
                <div className="container-fluid h-100 w-100" >
                    <div className="h-100 row g-0" style={{ height: '92vh' }}>
                        <div className="col-2 d-flex flex-column align-items-center justify-content-between h-100 p-2 gap-2">
                            <div className="d-flex align-items-center justify-content-start bg-light shadow-lg rounded gap-2 hov w-100 p-2" onClick={(e) => navigate('/SetRent')} style={{ height: '154px' }}>
                                <img src={icon_tabler} alt="" style={{ maxWidth: '90px', maxHeight: '90px', objectFit: 'cover' }} />
                                <span className='p-1 text-center' style={{ fontSize: '24px', fontWeight: 800, color: '#A98467' }}>Manage Area</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-start bg-light shadow-lg rounded gap-2 hov w-100 p-2" onClick={(e) => navigate('/ManageRequest')} style={{ height: '154px' }}>
                                <img src={icon_check_payment} alt="" className='' style={{ maxWidth: '90px', maxHeight: '110px', objectFit: 'cover' }} />
                                <span className='text-center' style={{ fontSize: '24px', fontWeight: 800, color: '#A98467' }}>Payment Confirmation</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-start bg-light shadow-lg rounded gap-2 hov w-100 p-2" onClick={(e) => navigate('/RequestHistory')} style={{ height: '154px' }}>
                                <img src={icon_history} alt="" style={{ maxWidth: '95px', maxHeight: '90px', objectFit: 'cover' }} />
                                <span className='text-center' style={{ fontSize: '24px', fontWeight: 800, color: '#A98467' }}>Confirmation History</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-start bg-light shadow-lg rounded gap-2 hov w-100 p-2" onClick={(e) => navigate('/ManageEvent')} style={{ height: '154px' }}>
                                <img src={icon_manage_ads} alt="" style={{ maxWidth: '90px', maxHeight: '90px', objectFit: 'cover' }} />
                                <span className='p-2 text-center' style={{ fontSize: '24px', fontWeight: 800, color: '#A98467' }}>Manage Ads</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-start bg-light shadow-lg rounded gap-2 hov w-100 p-2" onClick={(e) => navigate('/ManageUser')} style={{ height: '154px' }}>
                                <img src={icon_edit_user} alt="" style={{ maxWidth: '90px', maxHeight: '90px', objectFit: 'cover' }} />
                                <span className='p-2 text-center' style={{ fontSize: '24px', fontWeight: 800, color: '#A98467' }}>Manage Users</span>
                            </div>
                        </div>
                        <div className="col-10 d-flex flex-column align-items-center justify-content-start h-100 p-2 gap-2">
                            <div className="d-flex flex-column align-items-start justify-content-center h-50 w-100 rounded shadow-lg p-2">
                                <span style={{ color: "#000", fontSize: '18px' }}>Upcoming Market Lock Request Status ({nowDate})</span>
                                <div className="d-flex align-items-center justify-content-between  w-100">
                                    <div className='w-50 h-100 d-flex flex-column align-items-start justify-content-evenly' >
                                        {labels.map((label, index) => {
                                            const count = chartData.datasets[0].data[index]; // Raw value for each label
                                            const percentage = ((count / total) * 100).toFixed(2); // Percentage of each label
                                            return (
                                                <div key={index} className='d-flex align-items-center justify-content-center gap-4' >
                                                    <div className="p-2 rounded-circle" style={{ background: chartData.datasets[0].backgroundColor[index] }}></div>
                                                    <span
                                                        style={{
                                                            color: chartData.datasets[0].backgroundColor[index],
                                                            borderRadius: "20px",
                                                        }}
                                                    >
                                                        {label}: {count} ({percentage}%) {/* Display raw value and percentage */}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                        <span>ALL TOTAL {total} LIST</span>
                                    </div>
                                    <div style={{ margin: "0 auto" }}>
                                        <Doughnut key={JSON.stringify(chartData)} data={chartData} options={options} />
                                    </div>
                                    {/* <button className='btn btn-light shadow-lg' onClick={(e) => { navigate('/ManageRequest') }} style={{ fontSize: '18px', fontWeight: 400 }}>Manage Request</button> */}

                                </div>
                            </div>
                            <div className="d-flex flex-column align-items-start justify-content-center h-50 w-100 rounded shadow-lg p-2">
                                <div className="d-flex align-items-center justify-content-between w-100 h-100">
                                    <div className="w-50 h-100 d-flex flex-column align-items-start justify-content-evenly">
                                        <button className='btn btn-light shadow-lg' onClick={(e) => {
                                            setTypeChart('daily');
                                        }} style={{ fontSize: '18px', fontWeight: 400 }}>Daily</button>
                                        <button className='btn btn-light shadow-lg' onClick={(e) => {
                                            setTypeChart('monthly');
                                        }} style={{ fontSize: '18px', fontWeight: 400 }}>Monthly</button>
                                        <button className='btn btn-light shadow-lg' onClick={(e) => {
                                            setTypeChart('yearly');
                                        }} style={{ fontSize: '18px', fontWeight: 400 }}>Yearly</button>
                                    </div>
                                    <div className="w-50 h-100 d-flex align-items-center justify-content-center">
                                        <BarChart chartData={chartDataMoney} optionsBar={optionsBar} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : roleIsLogin === null ? (
                <>
                    <div className="container-fluid" style={{ background: `url(${bg_home})`, backgroundSize: 'cover', height: '92vh' }}>
                        <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100">
                            <div className=" row g-0 w-100" style={{ height: '69vh' }}>
                                <div className="col-4 d-flex align-items-center justify-content-center h-100">
                                    <img src={image_map} alt="" className="w-100 h-100 image-fluid" style={{ objectFit: 'contain' }} />
                                </div>
                                <div className="col d-flex flex-column align-items-center justify-content-center h-100">
                                    <div className="d-flex flex-column align-items-start justify-content-evenly h-75 w-100">
                                        <div className="d-flex flex-column align-items-start justify-content-start rounded px-5" style={{ gap: '8px' }}>
                                            <span style={{ fontSize: '60px', fontWeight: 800, color: '#6D4C3D', textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>Upcoming market <br /> days : {nowDate}</span>
                                            <span style={{ fontSize: '60px', fontWeight: 800, color: '#6D4C3D', textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>COUNTDOWN</span>
                                            <div className="p-1 px-3" style={{ background: '#A4C3B2', borderRadius: '0.2vh' }}>
                                                <span style={{ fontSize: '34px', fontWeight: 800 }}>{countdown}</span>
                                            </div>
                                            <button className='btn  px-4' onClick={(e) => {
                                                let date_is_coming = nowDate.replace(/\//g, "-");
                                                navigate(`/RequestZone`, { state: { date_is_coming } })
                                            }} style={{ fontSize: '34px', fontWeight: 800, color: '#fff', background: '#6D4C3D', border: '2px solid #000', borderRadius: '5px' }}>BOOKING</button>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="container-fluid mt-5" style={{}}>
                        <div className="w-100 h-100 rounded" style={{ background: 'rgba(234, 224, 213, 0.50)', padding: '4vh' }}>
                            <div className="w-100 d-flex align-items-center justify-content-between">
                                <div className="w-50 d-flex align-items-center">
                                    <select className="form-select w-auto" value={filterSearch} onChange={(e) => { setFilterSearch(e.target.value) }}>
                                        <option value="all" disabled>Product type filter</option>
                                        <option value="all">ALL</option>
                                        {
                                            data_shop_type.map((item, index) => {
                                                return (
                                                    <option key={index} value={item.id - 1}>{item.name}</option>
                                                )
                                            })
                                        }
                                    </select>
                                </div>
                                <div className="w-50 d-flex align-items-center justify-content-end">
                                    <input type="text" placeholder='Search' className="form-control" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ width: '30vh' }} />
                                </div>
                            </div>
                            <table className="w-100 rounded mt-2" style={{ backgroundColor: '#6D4C3D', fontSize: '2vh', color: '#EAE0D5', fontWeight: 600, maxHeight: '70vh' }}>
                                <thead>
                                    <tr style={{ height: '6vh' }}>
                                        <th scope="col" style={{ padding: '2vh' }}>ZONE</th>
                                        <th scope="col" style={{ padding: '2vh' }}>AREA</th>
                                        <th scope="col" style={{ padding: '2vh' }}>SHOP NAME</th>
                                        <th scope="col" style={{ padding: '2vh' }}>DESCRIPTION</th>
                                        <th scope="col" style={{ padding: '2vh', width: '20vh' }}>PRODUCT TYPE</th>
                                    </tr>
                                </thead>
                                <tbody className="">
                                    {
                                        data_shop.filter((item) => filterSearch === 'all' ? true : item.shop_type === parseInt(filterSearch)).filter((item) => item.shop_name.toLowerCase().includes(searchInput.toLowerCase())).map((item, index) => {
                                            return (
                                                <tr key={index} className="hov" style={{ backgroundColor: index % 2 === 0 ? '#EAE0D5' : '#A9A7A7', color: '#383838', height: '6vh' }}>
                                                    <td style={{ padding: '2vh' }}>{item.area.charAt(0).toUpperCase()}</td>
                                                    <td style={{ padding: '2vh' }}>{item.area}</td>
                                                    <td style={{ padding: '2vh' }}>{item.shop_name}</td>
                                                    <td style={{ padding: '2vh' }}>{item.shop_detail}</td>
                                                    <td style={{ padding: '2vh' }}>{data_shop_type[item.shop_type ? item.shop_type - 1 : 0].name}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>

                        </div>

                    </div>

                </>

            ) : null
        }

        </Template>
    )
}

export default Home


