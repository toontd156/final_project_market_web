import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { useEffect, useState } from "react";
import Template from "../../components/Template";
import image_map from '../../assets/image_map.png'
import '../../index.css'
import axios from 'axios'
import a_zone from "../../assets/a_zone.png";
import b_zone from "../../assets/b_zone.png";
import c_zone from "../../assets/c_zone.png";
import d_zone from "../../assets/d_zone.png";
import e_zone from "../../assets/e_zone.png";
import f_zone from "../../assets/f_zone.png";
import h_zone from "../../assets/h_zone.png";
import i_zone from "../../assets/i_zone.png";
import default_zone from "../../assets/default_zone.png";
import { jwtDecode } from "jwt-decode";
import checkToken from '../../func/CheckToken';
import Swal from 'sweetalert2'
import config from '../../conf/config';
import calculatorWidthAndHeight from '../../func/CalculatorWidthAndHeight';

function RequestZone() {
    const location = useLocation();
    const { date_is_coming } = location.state || {};
    const [area, setArea] = useState('')
    const [areaIndex, setAreaIndex] = useState('')
    const [areaSelect, setAreaSelect] = useState('')
    const [zoneId, setZoneId] = useState('')
    const [shopName, setShopName] = useState('')
    const [description, setDescription] = useState('')
    const [areaList, setAreaList] = useState([])
    const navigate = useNavigate()
    const [price, setPrice] = useState(0)
    const [nowDate, setNowDate] = useState('')
    const [productType, setProductType] = useState("0")
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
    const getArea = async () => {
        try {
            const response = await axios.get(config.api_url + '/api/get_area')
            const result = response.data
            if (result.status) {
                for (let i = 0; i < result.data.length; i++) {
                    let sm_data = result.data[i]
                    sm_data.rent = 0
                    if (sm_data.date_market === date_is_coming) {
                        if (sm_data.status == 'Approved') {
                            sm_data.rent = 2
                        } else if (sm_data.status == 'Pending') {
                            sm_data.rent = 1
                        }
                    }
                }
                setAreaList(result.data)

            }
        } catch (error) {
            console.log(error);
        }
    }

    const shopDetail = async () => {
        const token = checkToken();
        if (!token) {
            // navigate('/Login')
        }
        const decodeToken = jwtDecode(token);
        try {
            const response = await axios.post(config.api_url + '/api/shop_detail', { id: decodeToken.id, email: decodeToken.email })
            const result = response.data
            if (result.status) {
                setShopName(result.data.shop_name || '')
                setDescription(result.data.shop_detail || '')
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
        } else if (jwtDecode(token).role !== 'user') {
            navigate(-1)
            return
        }
        getArea();
        shopDetail();
        setNowDate(new Date().toISOString().split('T')[0].split('-').reverse().join('-'))
    }, []);

    const justRequest = () => {
        const token = checkToken();
        if (!token) {
            navigate('/Login')
            return
        }
        if (area === '' || shopName === '' || description === '') {
            alert('Please input all field')
        }
        navigate('/Payment', {
            state: { area, shopName, description, price, areaIndex, zoneId, date_is_coming, nowDate, areaSelect, productType },
        });
    }

    return (

        <Template use_me_bg='#fff'>
            {
                areaList.length === 0 ? (
                    <div className="d-flex align-items-center justify-content-center" style={{ height: '88vh' }}>
                        <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="container-fluid" style={{ height: '92vh' }}>
                        <div className="h-100 row g-0  w-100 p-2 gap-4">
                            <div className="col d-flex flex-column align-items-center justify-content-center h-100 w-100 p-2 rounded" style={{ background: '#ABC4AB' }}>
                                <div className="h-50 d-flex align-items-center justify-content-center w-75 p-2">
                                    <img src={
                                        areaSelect
                                            ? dataImage[areaSelect.toLowerCase()] || default_zone
                                            : default_zone
                                    } alt="" className="w-100 h-100 img-fluid rounded" style={{ objectFit: 'cover' }} />
                                </div>
                                <div className="h-50 overflow-y-scroll d-flex align-items-start  justify-content-start gap-2 w-75 p-2">
                                    {
                                        areaList.filter((item) => {
                                            if (areaSelect === '') {
                                                return item.zone_name.startsWith('A') || item.zone_name.startsWith('a');
                                            }
                                            return item.zone_name.startsWith(areaSelect.toUpperCase()) || item.zone_name.startsWith(areaSelect.toLowerCase());
                                        }).map((item, index) => {
                                            return (
                                                <div className="d-flex align-items-center justify-content-center py-1 hov" key={index} onClick={(e) => {
                                                    if (item.toggle == 1) {
                                                        Swal.fire({
                                                            icon: 'error',
                                                            title: 'Oops...',
                                                            text: 'This area is not available',
                                                        })
                                                        return
                                                    } else if (item.rent != 0) {
                                                        Swal.fire({
                                                            icon: 'error',
                                                            title: 'Oops...',
                                                            text: 'This area is already booked',
                                                        })
                                                        return
                                                    }
                                                    setAreaSelect(item.zone_name.charAt(0).toLowerCase())
                                                    setArea(item.zone_name)
                                                    setPrice(item.price)
                                                    setAreaIndex(item.category_id)
                                                    setZoneId(item.id)
                                                }} style={{ width: calculatorWidthAndHeight(94), background: item.toggle == 0 ? item.rent == 0 ? '#87C38F' : item.rent == 1 ? 'yellow' : '#C55D5D' : '#383838', borderRadius: calculatorWidthAndHeight(5), border: area == item.zone_name ? `${calculatorWidthAndHeight(2)} solid #fff` : `${calculatorWidthAndHeight(2)} solid #000` }}>
                                                    <p className='m-0 p-0' style={{color : item.toggle == 0 ? '#383838' : '#fff'}}>{item.zone_name}</p>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                            <div className="col d-flex flex-column align-items-center justify-content-center h-100 w-100 p-2 rounded" style={{ background: '#727D71' }}>
                                <div className="d-flex flex-column align-items-center justify-content-start h-100 w-75" style={{ gap: calculatorWidthAndHeight(12) }}>
                                    <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                        <label>Upcoming market days</label>
                                        <input type="text" disabled value={date_is_coming} onChange={(e) => setShopName(e.target.value)} className='form-control' style={{ height: calculatorWidthAndHeight(48) }} />
                                    </div>
                                    <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                        <label>Booking date</label>
                                        <input type="text" disabled value={nowDate} onChange={(e) => setShopName(e.target.value)} className='form-control' style={{ height: calculatorWidthAndHeight(48) }} />
                                    </div>
                                    <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                        <label>Product type</label>
                                        <select className='form-select' onChange={(e) => {
                                            setProductType(e.target.value)

                                        }} style={{ height: calculatorWidthAndHeight(48) }}>
                                            <option value="0" selected >Food</option>
                                            <option value="1"  >Clothes</option>
                                        </select>
                                    </div>
                                    <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                        <label>Select zone</label>
                                        <select className='form-select' value={areaSelect} onChange={(e) => {
                                            setAreaSelect(e.target.value)
                                        }} style={{ height: calculatorWidthAndHeight(48) }}>
                                            <option value="-1" selected disabled>Please Select Area</option>
                                            {
                                                Object.keys(dataImage).map((item, index) => {
                                                    return (
                                                        <option key={index} value={item}>{item.toUpperCase()}</option>
                                                    )
                                                })
                                            }
                                        </select>
                                    </div>
                                    <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                        <label>Area</label>
                                        <input type="text" disabled value={area} onChange={(e) => setShopName(e.target.value)} className='form-control' style={{ height: calculatorWidthAndHeight(48) }} />
                                    </div>
                                    <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                        <label>Shop Name</label>
                                        <input type="text" placeholder='Input your Shop Name' value={shopName} onChange={(e) => setShopName(e.target.value)} className='form-control' style={{ height: calculatorWidthAndHeight(48) }} />
                                    </div>
                                    <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                        <label>Description</label>
                                        <textarea className="w-100 rounded" style={{ height: '14vh' }} value={description} onChange={(e) => setDescription(e.target.value)} name="" id=""></textarea>
                                    </div>
                                    <button className='btn px-4' style={{ background: '#6D4C3D', border: `${calculatorWidthAndHeight(1)} solid #000`, color: '#FFE8D6', fontSize: calculatorWidthAndHeight(14), fontWeight: 500 }} onClick={(e) => { justRequest() }}>NEXT</button>

                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

        </Template>
    )
}

export default RequestZone