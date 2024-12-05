import { useEffect, useState } from "react";
import Template from "../../components/Template";
import Modal from "../../components/Modal"; import { jwtDecode } from "jwt-decode";
import axios from "axios";
import config from '../../conf/config';
import checkToken from '../../func/CheckToken'
function RequestHistory() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchInput, setSearchInput] = useState('');
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
    const [data_history, setDataHistory] = useState([]);
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const fetchData = async () => {
        // const token = checkToken();
        // const decode_token = jwtDecode(token);
        // const res = await axios.get(`http://localhost:8000/api/request/history_q`, {
        //     headers: {
        //         Authorization: `Bearer ${token}`
        //     }
        // })
        // setDataHistory(res.data)

        const token = checkToken();
        if (!token) {
            navigate('/Login')
        }
        const decodeToken = jwtDecode(token);
        if (decodeToken.role !== 'admin') {
            navigate('/Login')
        }
        try {
            const response = await axios.get(config.api_url + '/api/history_request')
            const result = response.data
            if (result.status) {
                setDataHistory(result.data)
            }
        } catch (error) {
            console.log(error);
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
        fetchData()
    }, [])

    // const [config.data_shop_type, setDataShopType] = useState([
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
                data_history.length === 0 ? (
                    <div className="d-flex align-items-center justify-content-center" style={{ height: '88vh' }}>
                        <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="container-fluid " style={{ height: '88vh' }}>
                        <div className="shadow-lg h-100 d-flex flex-column align-items-start justify-content-start p-2 position-relative" onClick={(e) => {

                        }}>
                            <div className="d-flex align-items-center justify-content-between w-100">
                                <h2 className="px-1">Confirmation History</h2>
                                <input type="text" placeholder='Search A' className="form-control" style={{ width: '30vh' }} />

                            </div>
                            <table className="table  rounded " >
                                <thead>
                                    <tr>
                                        <th scope="col" style={{ width: '6vh' }}>#</th>
                                        <th scope="col">ZONE</th>
                                        <th scope="col">AREA</th>
                                        <th scope="col">SHOP NAME</th>
                                        <th scope="col">DESCRIPTION</th>
                                        <th scope="col">PRODUCT TYPE</th>
                                        <th scope="col">STATUS</th>
                                        <th scope="col">DATE MARKET</th>
                                    </tr>
                                </thead>
                                <tbody className="h-100 ">
                                    {
                                        data_history.filter((item) => {
                                            if (searchInput === '') {
                                                return item
                                            } else if (item.area.toLowerCase().includes(searchInput.toLowerCase)) {
                                                return item
                                            } else if (item.shop_name.toLowerCase().includes(searchInput.toLowerCase)) {
                                                return item
                                            } else if (item.shop_detail.toLowerCase().includes(searchInput.toLowerCase)) {
                                                return item
                                            } else if (item.date_market.toLowerCase().includes(searchInput.toLowerCase)) {
                                                return item
                                            }
                                        })
                                            .map((item, index) => {
                                                return (
                                                    <tr key={index} className="hov"
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
                                                                status: item.status,
                                                                payment_id: item.payment_id
                                                            })
                                                            handleOpenModal()
                                                        }}
                                                    >
                                                        <td scope="row">{index + 1}</td>
                                                        <td>{item.area.charAt(0).toUpperCase()}</td>
                                                        <td>{item.area}</td>
                                                        <td>{item.shop_name}</td>
                                                        <td>{item.shop_detail}</td>
                                                        <td>{config.data_shop_type[item.shop_type ? item.shop_type - 1 : 0].name}</td>
                                                        <td>

                                                            <p className="card-text m-0 p-0" style={{ fontWeight: 800, color: item.status == 'Approved' ? '#59A964' : item.status == 'Disapproved' ? '#C55D5D' : 'rgba(209, 168, 19, 0.99)' }}>{item.status}</p>
                                                        </td>
                                                        <td>{item.date_market}</td>
                                                    </tr>
                                                )
                                            })
                                    }
                                </tbody>
                            </table>
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

        </Template>
    )
}

export default RequestHistory