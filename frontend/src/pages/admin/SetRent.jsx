import { useEffect, useState } from "react";
import Template from "../../components/Template";
import a_zone from "../../assets/a_zone.png";
import b_zone from "../../assets/b_zone.png";
import c_zone from "../../assets/c_zone.png";
import d_zone from "../../assets/d_zone.png";
import e_zone from "../../assets/e_zone.png";
import f_zone from "../../assets/f_zone.png";
import h_zone from "../../assets/h_zone.png";
import i_zone from "../../assets/i_zone.png";
import default_zone from "../../assets/default_zone.png";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import Modal from "../../components/Modal";
import { Link, useNavigate } from 'react-router-dom'
import checkToken from '../../func/CheckToken';
import config from '../../conf/config';
import calculatorWidthAndHeight from '../../func/CalculatorWidthAndHeight';

function SetRent() {
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nowDate, setNowDate] = useState('');
    const [toggle_status, setToggleStatus] = useState('');
    const [toggle_on_use, setToggleOnUse] = useState('0');
    const [dataModal, setDataModal] = useState(
        {
            area: '',
            category_id: 1,
            category_name: "A",
            id: 0,
            price: 0,
            rent: 0,
            size: ''
        }
    )
    const getNextWeekday = (currentDate, weekday) => {
        const date = new Date(currentDate);
        const daysToAdd = (weekday - date.getDay() + 7) % 7 || 7;
        date.setDate(date.getDate() + daysToAdd);
        return date;
    };



    const handleInputChange = (field, value) => {
        setDataModal((prevDataModal) => ({
            ...prevDataModal,
            [field]: value,
        }));
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    const [searchInput, setSearchInput] = useState('');
    const [dataImage, setDataImage] = useState({
        "a": a_zone,
        "b": b_zone,
        "c": c_zone,
        "d": d_zone,
        "e": e_zone,
        "f": f_zone,
        "h": h_zone,
        "i": i_zone
    });
    const [data, setData] = useState({
        // 'A': [
        //     {
        //         area: 'A1',
        //         price: 1000,
        //         update: '02/03/2024'
        //     },
        //     {
        //         area: 'A2',
        //         price: null
        //     }
        // ],
        // 'B': [
        //     {
        //         area: 'B1',
        //         price: 2000,
        //     },
        //     {
        //         area: 'B2',
        //         price: 3000
        //     }
        // ]
    })

    const getData = async () => {
        checkToken_in_side();
        let date_next_market = nowDate.replace(/\//g, "-");
        try {
            const response = await axios.get(config.api_url + '/api/get_rent', { params: { date_next_market } });
            const result = response.data
            if (result.status) {
                const updatedData = {};
                result.data.forEach((item) => {
                    if (!updatedData[item.category_name]) {
                        updatedData[item.category_name] = [];
                    }
                    updatedData[item.category_name].push(item);

                });
                setSearchInput('');
                setData(updatedData);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Get Data Failed',
                text: JSON.stringify(error.response.data.message)
            })

        }
    }
    const checkToken_in_side = () => {
        const token = checkToken();
        if (!token) {
            navigate('/Login')
        }
        const decodeToken = jwtDecode(token);
        if (decodeToken.role !== 'admin') {
            navigate('/Login')
        }
    }

    const updateData = async (data) => {
        checkToken_in_side();

        try {
            const response = await axios.post(config.api_url + '/api/update_rent', { data })
            const result = response.data
            if (result.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Update Success',
                    text: 'Update Success'
                })
                getData();
                handleCloseModal();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: result.message
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed2',
                text: JSON.stringify(error.response.data.message)
            })
        }
    }

    const deleteData = async (id) => {
        checkToken_in_side();

        try {
            const response = await axios.post(config.api_url + '/api/delete_rent', { id })
            const result = response.data
            if (result.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Delete Success',
                    text: 'Delete Success'
                })
                getData();
                handleCloseModal();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Delete Failed',
                    text: result.message
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Delete Failed2',
                text: JSON.stringify(error.response.data.message)
            })
        }
    }

    const insertData = async (data) => {
        checkToken_in_side();

        try {
            const response = await axios.post(config.api_url + '/api/insert_rent', { data })
            const result = response.data
            if (result.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Insert Success',
                    text: 'Insert Success'
                })
                getData();
                handleCloseModal();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Insert Failed',
                    text: result.message
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Insert Failed2',
                text: JSON.stringify(error.response.data.message)
            })
        }
    }

    useEffect(() => {
        const token = checkToken();
        if (!token) {
            navigate('/Login')
            return
        } else if (jwtDecode(token).role !== 'admin') {
            navigate(-1)
            return
        }

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
        setNowDate(selectedDate.toLocaleDateString("en-GB"));
    }, [])

    useEffect(() => {
        const token = checkToken();
        if (!token) {
            navigate('/Login')
            return
        } else if (jwtDecode(token).role !== 'admin') {
            navigate(-1)
            return
        }

        getData()
    }, [nowDate]);

    const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    }

    return (
        <Template use_me_bg='#fff'>
            {
                data.length === 0 ? (
                    <div className="d-flex align-items-center justify-content-center" style={{ height: '92vh' }}>
                        <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="container-fluid" style={{ height: '92vh' }}>
                        <div className="h-100 row g-0 p-2">
                            <div className="col-4 d-flex flex-column align-items-center justify-content-center h-100 gap-2 p-1">
                                <div className="d-flex align-items-center justify-content-start flex-column h-50 w-100 gap-1">
                                    <span className="text-start w-100" style={{ fontSize: calculatorWidthAndHeight(22), fontWeight: 500 }}>MANAGE AREA</span>
                                    <img src={dataImage[searchInput.charAt(0).toLocaleLowerCase()] || default_zone} alt="" className="w-100 rounded" style={{ objectFit: 'contain', maxHeight: '40vh' }} />
                                </div>
                                <div className="d-flex align-content-start flex-wrap gap-1 justify-content-start h-50 overflow-y-scroll w-100 p-2">
                                    {
                                        Object.keys(dataImage).map((key, index) => (
                                            <div key={key} className={`d-flex align-items-center justify-content-center p-3 shadow-lg  `} style={{ cursor: 'pointer', width: '20.3vh', background: searchInput.charAt(0).toLocaleLowerCase() === key.toLocaleLowerCase() ? '#6D4C3D' : '#A98467', border: '0.4vh solid #fff', borderRadius: '2vh' }} onClick={(e) => setSearchInput(key)}>
                                                <span>ZONE {key.toLocaleUpperCase()}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                            <div className="col-8 d-flex flex-column align-items-start justify-content-start h-100 p-2 rounded" style={{ gap: '0.4vh' }}>
                                <div className="d-flex align-items-center justify-content-between w-100  rounded" >
                                    <div className="d-flex align-items-center justify-content-start w-100" style={{ gap: '0.4vh' }}>
                                        <div className="d-flex align-items-center justify-content-between w-100">
                                            <input type="text" placeholder='Search A' className="form-control" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ width: '30vh' }} />
                                            <button className="btn text-white" style={{ background: '#727D71' }} onClick={(e) => {
                                                setDataModal({
                                                    title: 'Insert',
                                                    area: '',
                                                    category_name: "A",
                                                    price: 0,
                                                    rent: 0,
                                                    size: '',
                                                    toggle: "1"
                                                })
                                                setIsModalOpen(true)


                                            }}>INSERT</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex flex-column align-items-center justify-content-start w-100 h-100 rounded">
                                    <table className="table  rounded " >
                                        <thead className="rounded">
                                            <tr className="rounded">
                                                <th scope="col">Area</th>
                                                <th scope="col">Size(Meter)</th>
                                                <th scope="col">Price(Baht)</th>
                                                <th scope="col" onClick={(e) => {
                                                    if (toggle_status === '') {
                                                        setToggleStatus('0')
                                                    } else if (toggle_status === '0') {
                                                        setToggleStatus('1')
                                                    } else if (toggle_status === '1') {
                                                        setToggleStatus('2')
                                                    } else if (toggle_status === '2') {
                                                        setToggleStatus('')
                                                    }
                                                }}>Area Status <span style={{fontSize: calculatorWidthAndHeight(12)}}>({toggle_status == '' ? 'All' : toggle_status == '0' ? 'Available' : toggle_status == '1' ? 'Pending' : 'Reserved'})</span></th>
                                                <th scope="col">Tenant Name</th>
                                                <th scope="col" onClick={(e) => {
                                                    if (toggle_on_use === '0') {
                                                        setToggleOnUse('1')
                                                    } else if (toggle_on_use === '1') {
                                                        setToggleOnUse('2')
                                                    } else if (toggle_on_use === '2') {
                                                        setToggleOnUse('0')
                                                    }
                                                }}>On Use <span style={{fontSize: calculatorWidthAndHeight(12)}}>({toggle_on_use == '0' ? 'All' : toggle_on_use == '1' ? 'Enable' : 'Disable'})</span></th>
                                                <th scope="col" style={{ width: '28vh' }}>Update</th>
                                            </tr>
                                        </thead>
                                        <tbody className="h-100 rounded">
                                            {
                                                Object.keys(data).slice()
                                                    .sort((a, b) => a.localeCompare(b)).filter(key => key.toLowerCase().includes(searchInput.toLowerCase()) || data[key].filter(item => item.area.toLowerCase().replace(/\s+/g, '').includes(searchInput.toLowerCase())).length > 0 || data[key].filter(item => item.shop_name && item.shop_name.toLowerCase().includes(searchInput.toLowerCase())).length > 0).map((key, index) => (
                                                        data[key].filter((data_sm) => {
                                                            if (toggle_status === '') {
                                                                return data_sm
                                                            }
                                                            if (data_sm.status.toLowerCase() === toggle_status.toLowerCase()) {
                                                                return data_sm
                                                            }
                                                            if (data_sm.toggle === toggle_on_use) {
                                                                return data_sm
                                                            }
                                                        }).map((item2, index2) => (
                                                            <tr
                                                                key={`${key}-${index2}`}
                                                                className={`${!item2.price || !item2.toggle ? '' : 'table-active'} rounded `}
                                                                onClick={(e) => {
                                                                    setSearchInput(item2.area)
                                                                }}
                                                                style={{ verticalAlign: 'middle' }}

                                                            >
                                                                <td >{item2.area}</td>
                                                                <td>{item2.size}</td>
                                                                <td>
                                                                    {item2.price || 'N/A'}
                                                                    {/* <input
                                                                    type="number"
                                                                    value={item2.price || ''}
                                                                    onChange={(e) => {
                                                                        const updatedData = { ...data };
                                                                        updatedData[key][index2].price = e.target.value;
                                                                        setData(updatedData);
                                                                    }}
                                                                    placeholder={item2.price || 'N/A'}
                                                                    className="form-control"
                                                                    style={{ width: '14vh' }}
                                                                /> */}
                                                                </td>
                                                                <td>
                                                                    <select name="" id="" value={item2.status} disabled className="form-control">
                                                                        <option value="0">Available</option>
                                                                        <option value="1">Pending</option>
                                                                        <option value="2">Reserved</option>
                                                                    </select>
                                                                </td>
                                                                <td>{item2.shop_name}</td>
                                                                <td>
                                                                    <div className="d-flex align-items-center justify-content-center"
                                                                        style={{ background: !item2.toggle ? '#ABC4AB' : '#DC3543', padding: '0.9vh', borderRadius: '0.5vh' }}
                                                                    >
                                                                        <span style={{ fontWeight: 500 }}>{!item2.toggle ? 'Enable' : 'Disable'}</span>
                                                                    </div>


                                                                </td>
                                                                <td>
                                                                    <button className="btn " style={{ background: '#ABC4AB' }} onClick={(e) => {
                                                                        // updateData(item2.id, item2.price)
                                                                        setDataModal({ title: 'Edit', ...item2 })
                                                                        setIsModalOpen(true)
                                                                    }}>Edit</button>
                                                                    <span className="px-1 text-secondary" style={{ fontSize: calculatorWidthAndHeight(12) }}>
                                                                        {item2.update ? `(Last Update: ${formatDate(item2.update)})` : ''}
                                                                    </span>
                                                                </td>

                                                            </tr>
                                                        ))
                                                    ))
                                            }



                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                isModalOpen && (
                    <Modal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        title={dataModal.title}
                        children={
                            <div className="card" style={{ border: 'none' }}>
                                <div className="row g-0 h-100" style={{}}>
                                    <div className="col p-1">

                                        <div className="card-body text-start d-flex flex-column gap-2">
                                            <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Area</p>
                                            <div className="d-flex align-items-center gap-2">
                                                <select name="" id="" className="form-control" value={dataModal.category_name.toLocaleLowerCase()} onChange={(e) => {
                                                    handleInputChange('category_name', e.target.value);
                                                }}>
                                                    {
                                                        Object.keys(dataImage).map((key, index) => (
                                                            <option key={key} value={key}>{key}</option>
                                                        ))
                                                    }
                                                </select>
                                                <input type="text" className="form-control" value={dataModal.name_zone} onChange={(e) => {
                                                    handleInputChange('name_zone', e.target.value);
                                                }} />
                                            </div>
                                            <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Size (Meter)</p>
                                            <div className="d-flex align-items-center gap-2">
                                                <input type="text" className="form-control" value={dataModal.size} onChange={(e) => {
                                                    handleInputChange('size', e.target.value);
                                                }} />
                                            </div>
                                            <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Price</p>
                                            <div className="d-flex align-items-center gap-2">
                                                <input type="number" className="form-control" onChange={(e) => {
                                                    handleInputChange('price', e.target.value);
                                                }} value={dataModal.price} />
                                            </div>
                                            {/* <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Area Status</p>
                                            <div className="d-flex align-items-center gap-2">
                                                <select name="" id="" value={dataModal.status} onChange={(e) => {
                                                    handleInputChange('status', e.target.value);
                                                }} className="form-control">
                                                    <option value="0">Available</option>
                                                    <option value="1">Pending</option>
                                                    <option value="2">Reserved</option>
                                                </select>
                                            </div> */}
                                            <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Rent Status</p>
                                            <div className="d-flex align-items-center gap-2">
                                                <select name="" id="" value={dataModal.toggle} onChange={(e) => {
                                                    handleInputChange('toggle', e.target.value);
                                                }} className="form-control">
                                                    <option value="0">Disable</option>
                                                    <option value="1">Enable</option>
                                                </select>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        custom_footer={
                            <div className="d-flex align-items-center justify-content-center gap-2 w-100">
                                {/* {
                                    dataModal.title === 'Edit' && (
                                        <button className="btn w-100 btn-danger" onClick={(e) => {
                                            Swal.fire({
                                                title: 'Are you sure?',
                                                text: 'You will not be able to recover this imaginary file!',
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonText: 'Yes, delete it!',
                                                cancelButtonText: 'No, keep it'
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    Swal.fire(
                                                        'Deleted!',
                                                        'Your imaginary file has been deleted.',
                                                        'success'
                                                    )
                                                    deleteData(dataModal.id)
                                                }
                                            }
                                            )
                                        }}>DELETE</button>
                                    )
                                } */}
                                <button className="btn w-100" style={{ background: '#ABC4AB' }} onClick={(e) => {
                                    if (dataModal.title === 'Edit') {
                                        updateData(dataModal)
                                    } else if (dataModal.title === 'Insert') {
                                        insertData(dataModal)
                                    }
                                }}>SAVE</button>
                            </div>
                        }
                    />
                )
            }
        </Template>

    )
}

export default SetRent