import { useEffect, useState } from "react";
import Template from "../../components/Template";
import Modal from "../../components/Modal";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom'
import { jwtDecode } from "jwt-decode";
import config from '../../conf/config';
import checkToken from '../../func/CheckToken';
import calculatorWidthAndHeight from '../../func/CalculatorWidthAndHeight';

function RequestStatus() {

    const [data_request, setDataRequest] = useState([
        // {
        //     area: 'A8',
        //     date: '2021-08-01',
        //     status: 'Pending'
        // },
        // {
        //     area: 'A8',
        //     date: '2021-08-01',
        //     status: 'Approved'
        // },
        // {
        //     area: 'A8',
        //     date: '2021-08-01',
        //     status: 'Disapproved'
        // },
        // {
        //     area: 'A8',
        //     date: '2021-08-01',
        //     status: 'Pending'
        // },
        // {
        //     area: 'A8',
        //     date: '2021-08-01',
        //     status: 'Pending'
        // },
        // {
        //     area: 'A8',
        //     date: '2021-08-01',
        //     status: 'Pending'
        // },
        // {
        //     area: 'A8',
        //     date: '2021-08-01',
        //     status: 'Pending'
        // },
    ]);

    // const [config.data_shop_type, setDataShopType] = useState([
    //     {
    //         name: 'Food'
    //     },
    //     {
    //         name: 'Clothes'
    //     },
    // ])
    const navigate = useNavigate()

    const checkRequest = async () => {
        const token = checkToken();
        if (!token) {
            navigate('/Login')
        }
        const decodeToken = jwtDecode(token);
        try {
            const response = await axios.post(config.api_url + '/api/request_status', { id: decodeToken.id, email: decodeToken.email })
            const result = response.data
            if (result.status) {
                setDataRequest(result.data)
            }
        } catch (error) {
            console.log(error);
        }
    }
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataModal, setDataModal] = useState(
        {
            image_name: '',
            area_name: '',
            date_market: '',
            date: '',
            shop_type: '',
            shop_name: '',
            shop_detail: '',
            email: '',
            status: ''
        }
    )


    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        const token = checkToken();
        if (!token) {
            navigate('/Login')
            return
        } else if (jwtDecode(token).role !== 'user') {
            navigate(-1)
            return
        }
        checkRequest();
    }, [])

    return (
        <Template use_me_bg='#fff'>
            {
                data_request.length === 0 ? (
                    <div className="d-flex align-items-center justify-content-center" style={{ height: '88vh' }}>
                        <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="container-fluid" style={{ height: '92vh' }}>
                        <div className="h-100 d-flex flex-column align-items-start justify-content-start p-2">
                            <div className="d-flex align-items-center justify-content-between w-100">
                                <h2 className="px-1">Status</h2>
                                <div className="d-flex align-items-center justify-content-center p1-2">
                                    <input type="text" className='form-control' placeholder='Search' style={{ width: '32vh', background: 'rgba(213, 213, 213, 0.50)' }} />
                                </div>
                            </div>
                            <div className="w-100 row g-0 row-cols-3 overflow-y-auto">
                                {
                                    data_request.map((item, index) => {
                                        console.log(item);
                                        return (
                                            <div className="col p-1" key={index}>
                                                <div className="card hov" style={{ height: '35vh', background: '#ABC4AB ' }}
                                                    onClick={(e) => {
                                                        setDataModal({
                                                            image_name: `http://localhost:3333${item.image_name}`,
                                                            area_name: item.area,
                                                            date_market: item.date_market,
                                                            date: item.date,
                                                            shop_type: item.shop_type,
                                                            shop_name: item.shop_name,
                                                            shop_detail: item.shop_detail,
                                                            email: item.email,
                                                            status: item.status
                                                        })
                                                        handleOpenModal()

                                                    }}
                                                >
                                                    <div className="row g-0 h-100">
                                                        <div className="col-md-5  h-100" onClick={(e) => {
                                                        }}>
                                                            <img src={`http://localhost:3333${item.image_name}`} className="w-100 h-100 img-fluid rounded-start" alt="..." style={{ objectFit: 'cover' }} />
                                                        </div>
                                                        <div className="col-md-7">

                                                            <div className="card-body text-center">
                                                                <h3 className="card-title" style={{ fontWeight: 800 }}>{item.area}</h3>
                                                                <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Upcoming market days</p>
                                                                <p className="card-text m-0 p-0">{item.date_market}</p>
                                                                <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Booking date</p>
                                                                <p className="card-text m-0 p-0">{item.date}</p>
                                                                <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Product type</p>
                                                                <p className="card-text m-0 p-0">{config.data_shop_type[item.shop_type ? item.shop_type - 1 : 0].name}</p>
                                                                <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Shop Name</p>
                                                                <p className="card-text m-0 p-0">{item.shop_name}</p>
                                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                                    <div className={`spinner-grow ${item.status == 'Approved' ? 'text-success' : item.status == 'Disapproved' ? 'text-danger' : 'text-warning'}`} role="status">
                                                                        <span className="visually-hidden">Loading...</span>
                                                                    </div>
                                                                    <p className="card-text m-0 p-0" style={{ fontWeight: 800, color: item.status == 'Approved' ? '#59A964' : item.status == 'Disapproved' ? '#C55D5D' : 'rgba(209, 168, 19, 0.99)' }}>{item.status}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
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
                        title=""
                        custom_max_width='90vh'
                        children={
                            <div className="card" style={{ height: '52vh', border: 'none' }}>
                                <div className="row g-0 h-100" style={{}}>
                                    <div className="col-md-5 p-1 h-100 " onClick={(e) => {
                                    }}>
                                        <img src={dataModal.image_name} className="w-100 h-100 img-fluid rounded" alt="..." style={{ objectFit: 'cover' }} />
                                    </div>
                                    <div className="col-md-7 p-1">

                                        <div className="card-body text-start">
                                            <h1 className="card-title m-0 p-0" style={{ fontWeight: 800 }}>{dataModal.area_name}</h1>
                                            <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Upcoming market days</p>
                                            <p className="card-text m-0 p-0">{dataModal.date_market}</p>
                                            <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Booking date</p>
                                            <p className="card-text m-0 p-0">{dataModal.date}</p>
                                            <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Product type</p>
                                            <p className="card-text m-0 p-0">{config.data_shop_type[dataModal.shop_type ? dataModal.shop_type - 1 : 0].name}</p>
                                            <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Shop Name</p>
                                            <p className="card-text m-0 p-0">{dataModal.shop_name}</p>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        custom_footer={
                            <div className="d-flex align-items-center justify-content-center gap-2 w-100">
                                <div className={`spinner-grow ${dataModal.status == 'Approved' ? 'text-success' : dataModal.status == 'Disapproved' ? 'text-danger' : 'text-warning'}`} role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="card-text m-0 p-0" style={{ fontWeight: 800, color: dataModal.status == 'Approved' ? '#59A964' : dataModal.status == 'Disapproved' ? '#C55D5D' : 'rgba(209, 168, 19, 0.99)' }}>{dataModal.status}</p>
                            </div>
                        }
                    />
                )
            }

        </Template >
    )
}

export default RequestStatus