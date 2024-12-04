import { useEffect, useState } from "react";
import Template from "../../components/Template";
import Modal from "../../components/Modal";
import icon_check from "../../assets/icon_check.png";
import icon_cancel from "../../assets/icon_cancel.png";
import slip_test from "../../assets/slip_test.png";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom'
import data_shop_type from '../../conf/config';
import checkToken from '../../func/CheckToken';
import Swal from 'sweetalert2'
function ManageRequest() {
    const navigate = useNavigate()

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
            status: '',
            payment_id: ''
        }
    )
    const [data_request, setDataRequest] = useState([
        {
            area: 'A8',
            date: '2021-08-01',
            status: 'Pending',
            shopName: 'Shop A',
            slip: slip_test,
            detailShop: 'Shop A 1234567890 Shop A 1234567890 Shop A 1234567890 Shop A 1234567890',
            price: 1000
        },
        {
            area: 'A9',
            date: '2021-08-02',
            status: 'Pending',
            shopName: 'Shop B',
            slip: slip_test,
            detailShop: 'Shop B 1234567890',
            price: 1000
        }
    ]);


    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };


    const checkRequest = async () => {
        const token = checkToken();
        if (!token) {
            navigate('/Login')
        }
        const decodeToken = jwtDecode(token);
        if (decodeToken.role !== 'admin') {
            navigate('/Login')
        }
        try {
            const response = await axios.get('http://localhost:3333/api/request_status_admin')
            const result = response.data
            if (result.status) {
                setDataRequest(result.data)
            }
        } catch (error) {
            console.log(error);
        }
    }


    useEffect(() => {
        checkRequest()
    }, [])

    const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    }

    const cancelRequest = async (payment_id) => {
        try {
            const response = await axios.post('http://localhost:3333/api/cancel_request', { payment_id })
            const result = response.data
            if (result.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Cancel Success',
                    text: result.message
                })
                checkRequest()
                handleCloseModal()
            }
        } catch (error) {
            console.log(error);
        }
    }

    const approveRequest = async (payment_id) => {
        try {
            const response = await axios.post('http://localhost:3333/api/approve_request', { payment_id })
            const result = response.data
            if (result.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Approve Success',
                    text: result.message
                })
                checkRequest()
                handleCloseModal()
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Approve Failed',
                    text: result.message
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Approve Failed',
                text: JSON.stringify(error.response.data.message)
            })
        }
    }

    // const [data_shop_type, setDataShopType] = useState([
    //     {
    //         name: 'Food'
    //     },
    //     {
    //         name: 'Clothes'
    //     },
    // ])

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
                    <div className="container-fluid " style={{ height: '88vh' }}>
                        <div className="shadow-lg h-100 d-flex flex-column align-items-start justify-content-start p-2 position-relative" onClick={(e) => {
                        
                        }}>
                       
                            <div className="d-flex align-items-center justify-content-start">
                                <h2 className="px-1">Payment Confirmation</h2>
                            </div>
                            <div className="w-100 row g-0 row-cols-3 overflow-y-auto" >
                                {
                                    data_request.map((item, index) => {
                                        return (
                                            <div className="col p-1" key={index} >
                                                <div className="card hov" onClick={(e) => {
                                                    setDataModal({
                                                        image_name: `http://localhost:3333${item.image_name}`,
                                                        area_name: item.area,
                                                        date_market: item.date_market,
                                                        date: item.date,
                                                        shop_type: item.shop_type,
                                                        shop_name: item.shop_name,
                                                        shop_detail: item.shop_detail,
                                                        email: item.email,
                                                        status: item.status,
                                                        payment_id: item.payment_id
                                                    })
                                                    handleOpenModal()

                                                }} style={{ height: '35vh', background: '#ABC4AB ' }}>
                                                    <div className="row g-0 h-100">
                                                        <div className="col-md-5 hov h-100">
                                                            <img src={`http://localhost:3333${item.image_name}`} className="w-100 h-100 img-fluid rounded-start" alt="..." style={{ objectFit: 'cover' }} />
                                                        </div>
                                                        <div className="col-md-7">
                                                            <div className="card-body text-center h-100 d-flex flex-column align-items-center justify-content-evenly">
                                                                <h3 className="card-title" style={{ fontWeight: 800 }}>{item.area}</h3>
                                                                <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Upcoming market days</p>
                                                                <p className="card-text m-0 p-0">{item.date_market}</p>
                                                                <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Booking date</p>
                                                                <p className="card-text m-0 p-0">{item.date}</p>
                                                                <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Product type</p>
                                                                <p className="card-text m-0 p-0">{data_shop_type[item.shop_type ? item.shop_type - 1 : 0].name}</p>
                                                                <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Shop Name</p>
                                                                <p className="card-text m-0 p-0">{item.shop_name}</p>
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
                                            <p className="card-text m-0 p-0">{data_shop_type[dataModal.shop_type ? dataModal.shop_type - 1 : 0].name}</p>
                                            <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Shop Name</p>
                                            <p className="card-text m-0 p-0">{dataModal.shop_name}</p>
                                            <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Shop Detail</p>
                                            <p className="card-text m-0 p-0">{dataModal.shop_detail}</p>
                                            <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>Booking by</p>
                                            <p className="card-text m-0 p-0">{dataModal.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        custom_footer={
                            <div className="d-flex align-items-end justify-content-between h-25 w-100" style={{ gap: '0.3vh' }}>
                            <button className="btn btn-light w-50 d-flex align-items-center justify-content-center p-2 btn-outline-danger" onClick={(e) => {
                                cancelRequest(dataModal.payment_id)
                            }}>
                                <img src={icon_cancel} alt="" style={{ width: '14px', height: '14px', objectFit: 'cover' }} />
                            </button>
                            <button className="btn btn-light w-50 d-flex align-items-center justify-content-center p-2 btn-outline-success" onClick={(e) => {
                                approveRequest(dataModal.payment_id)
                            }}>
                                <img src={icon_check} alt="" style={{ width: '14px', height: '14px', objectFit: 'cover' }} />
                            </button>
                        </div>
                        }
                    />
                )
            }

        </Template>
    )
}

export default ManageRequest