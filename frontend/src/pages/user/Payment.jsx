import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from "react";
import Template from "../../components/Template";
import qr_code from "../../assets/qr_code.png"
import noImage from "../../assets/noImage.png"
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from "sweetalert2";
import { jwtDecode } from 'jwt-decode';
import config from '../../conf/config';
import checkToken from '../../func/CheckToken';
import calculatorWidthAndHeight from '../../func/CalculatorWidthAndHeight';

function Payment() {
    const navigate = useNavigate()
    const location = useLocation();
    const { area, shopName, description, price, areaIndex, zoneId, date_is_coming, nowDate, areaSelect, productType } = location.state || {};
    // const [area, setArea] = useState(props.area)
    // const [shopName, setShopName] = useState(props.shopName)
    // const [description, setDescription] = useState(props.description)
    // const [price, setPrice] = useState(props.price)

    useEffect(() => {
        const token = checkToken();
        if (!token) {
            navigate('/Login')
            return
        } else if (jwtDecode(token).role !== 'user') {
            navigate(-1)
            return
        }
    }, [])

    const [file, setFile] = useState();
    const inputRef = useRef(null);
    const handleChangeFile = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileType = selectedFile.type;
            if (fileType === 'image/png' || fileType === 'image/jpeg') {
                setFile(URL.createObjectURL(selectedFile));
            } else {
                alert('กรุณาเลือกไฟล์ประเภท PNG หรือ JPG เท่านั้น');
            }
        }
    };
    const handleClickImg = () => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    };

    const sendRequest = () => {
        if (!inputRef.current.files[0]) {
            Swal.fire({
                icon: 'error',
                title: 'Please select file',
                text: 'Please select file'
            })
            return
        }
        const token = checkToken();
        if (!token) {
            navigate('/Login')
            return
        }
        const decodeToken = jwtDecode(token);
        const data = new FormData();
        data.append('file', inputRef.current.files[0]);
        data.append('area', area);
        data.append('shopName', shopName);
        data.append('description', description);
        data.append('price', price);
        data.append('id_user', decodeToken.id);
        data.append('areaIndex', areaIndex);
        data.append('zoneId', zoneId);
        data.append('date_is_coming', date_is_coming);
        data.append('nowDate', nowDate);
        data.append('productType', productType);
        axios.post(config.api_url + '/api/payment_zone', data)
            .then((response) => {
                const result = response.data
                if (result.status) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Request Success',
                        text: 'Request Success',
                        timer: 2000
                    })
                    navigate('/')

                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Request Failed',
                        text: result.message
                    })
                }
            })
            .catch((error) => {
                console.log(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Request Failed',
                    text: error.message
                })
            })
    }

    return (
        <Template use_me_bg='#fff'>
            <div className="container-fluid" style={{ height: '92vh' }}>
                <div className="h-100 row g-0  w-100 p-2 gap-4">
                    <div className="col d-flex flex-column align-items-center justify-content-center h-100 w-100 p-2 rounded" style={{ background: '#ABC4AB' }}>
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 w-75" style={{ gap: calculatorWidthAndHeight(12) }}>
                            <div className="p-2 d-flex flex-column align-items-center justify-content-start  rounded w-100 h-50" style={{ gap: calculatorWidthAndHeight(12) }}>
                                <img src={qr_code} alt="" className="w-100 h-100 img-fluid" style={{ objectFit: 'cover', borderRadius: calculatorWidthAndHeight(8) }} />
                            </div>
                            <div className="h-50 p-2 d-flex flex-column align-items-center justify-content-center w-100 gap-1">
                                <div className="p-2 h-75 d-flex align-items-center justify-content-center w-100" style={{ border: '1px solid #ccc', borderRadius: calculatorWidthAndHeight(8), background: '#A98467' }}>
                                    <input
                                        type="file"
                                        ref={inputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleChangeFile}
                                    />
                                    <img
                                        src={file || noImage}
                                        alt="Upload Preview"
                                        onClick={handleClickImg}
                                        className="w-100 h-100"
                                        style={{ cursor: 'pointer', objectFit: 'contain' }}
                                    />

                                </div>
                                <div className="d-flex flex-column align-items-center justify-content-center px-5 rounded" style={{ gap: calculatorWidthAndHeight(4), height: calculatorWidthAndHeight(42), background: '#EAE0D5', border: `${calculatorWidthAndHeight(1)} solid black` }}>
                                    <span>Total amount {price} baht</span>
                                </div>
                            </div>

                            {/* <button className='btn btn-light' onClick={(e) => { sendRequest() }}>Confirm</button> */}

                        </div>
                    </div>
                    <div className="col d-flex flex-column align-items-center justify-content-center h-100 w-100 p-2 rounded" style={{ background: '#727D71' }}>
                        <div className="p-2 d-flex flex-column align-items-center justify-content-between w-75 h-100 rounded" style={{ gap: calculatorWidthAndHeight(12) }}>
                            <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                <label>Upcoming market days</label>
                                <input type="text" disabled value={date_is_coming} className='form-control' style={{ height: calculatorWidthAndHeight(48) }} />
                            </div>
                            <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                <label>Booking date</label>
                                <input type="text" disabled value={nowDate} className='form-control' style={{ height: calculatorWidthAndHeight(48) }} />
                            </div>
                            <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                <label>Product type</label>
                                <select className='form-select' value={productType} onChange={(e) => {

                                }} style={{ height: calculatorWidthAndHeight(48) }}>
                                    <option value="0" selected disabled>Food</option>
                                    <option value="1" selected disabled>Clothes</option>
                                </select>
                            </div>
                            <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                <label>Select zone</label>
                                <select className='form-select' value={areaSelect} onChange={(e) => {
                                }} style={{ height: calculatorWidthAndHeight(48) }}>
                                    <option value="0" selected disabled>{areaSelect}</option>
                                </select>
                            </div>
                            <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                <label>Area</label>
                                <input type="text" disabled value={area} className='form-control' style={{ height: calculatorWidthAndHeight(48) }} />
                            </div>
                            <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                <label>Shop Name</label>
                                <input type="text" placeholder='Input your Shop Name' value={shopName} className='form-control' style={{ height: calculatorWidthAndHeight(48) }} />
                            </div>
                            <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                <label>Description</label>
                                <textarea className="w-100 rounded" style={{ height: '14vh' }} value={description} name="" id=""></textarea>
                            </div>
                            <div className="d-flex align-items-center justify-content-evenly gap-2 w-100">

                                <button className='btn px-4' style={{ background: '#FFE8D6', border: `${calculatorWidthAndHeight(1)} solid #000`, color: '#6D4C3D', fontSize: calculatorWidthAndHeight(14), fontWeight: 500 }} onClick={(e) => { sendRequest() }}>BACK</button>
                                <button className='btn px-4' style={{ background: '#6D4C3D', border: `${calculatorWidthAndHeight(1)} solid #000`, color: '#FFE8D6', fontSize: calculatorWidthAndHeight(14), fontWeight: 500 }} onClick={(e) => { sendRequest() }}>CONFIRM</button>
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </Template>
    )
}

export default Payment