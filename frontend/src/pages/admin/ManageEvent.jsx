import { useEffect, useState, useRef } from "react";
import Template from "../../components/Template";
import Modal from "../../components/Modal"; import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Swal from "sweetalert2";
import checkToken from '../../func/CheckToken';
function ManageEvent() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const inputRef = useRef(null);
    const [dataModal, setDataModal] = useState(
        {
            // name_ads: '',
            // high_light: '',
            // get_next_week: '',
        }
    )
    const [data_ads, setDataAds] = useState([]);
    const handleChangeFile = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileType = selectedFile.type;
            if (fileType === 'image/png' || fileType === 'image/jpeg') {
                dataModal.image_ads = URL.createObjectURL(selectedFile);
                handleInputChange('image_ads', dataModal.image_ads);
            } else {
                alert('กรุณาเลือกไฟล์ประเภท PNG หรือ JPG เท่านั้น');
            }
        }
    };
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const fetchData = async () => {
        const token = checkToken();
        if (!token) {
            navigate('/Login')
        }
        const decodeToken = jwtDecode(token);
        if (decodeToken.role !== 'admin') {
            navigate('/Login')
        }
        try {
            const response = await axios.get('http://localhost:3333/api/get_data_ads')
            const result = response.data
            if (result.status) {
                setDataAds(result.data)
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleClickImg = () => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    };

    useEffect(() => {
        fetchData()
    }, [])

    const handleInputChange = (field, value) => {
        setDataModal((prevDataModal) => ({
            ...prevDataModal,
            [field]: value,
        }));
    };

    const handleAddAds = async () => {
        const newData = new FormData();
        newData.append('file', inputRef.current.files[0]);
        newData.append('name_ads', dataModal.name_ads);
        newData.append('high_light', dataModal.high_light);
        newData.append('get_next_week', dataModal.get_next_week ? 1 : 0);

        console.log('FormData:', Object.fromEntries(newData.entries())); // ตรวจสอบข้อมูลที่เพิ่มใน FormData

        try {
            const response = await axios.post('http://localhost:3333/api/add_data_ads', newData)
            const result = response.data
            if (result.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'เพิ่มข้อมูลสำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                })
                handleCloseModal()
                fetchData()
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: `${dataModal.name_ads} ${dataModal.high_light} ${dataModal.get_next_week}`,
                text: JSON.stringify(error.response.data.message),
                showConfirmButton: false,

            })
        }
    }

    const handleEditAds = async () => {
        const newData = new FormData();
        newData.append('file', inputRef.current.files[0]);
        newData.append('name_ads', dataModal.name_ads);
        newData.append('high_light', dataModal.high_light);
        newData.append('get_next_week', dataModal.get_next_week ? 1 : 0);
        newData.append('status_open', dataModal.status_open ? 1 : 0);
        newData.append('id', dataModal.id);

        console.log('FormData:', Object.fromEntries(newData.entries())); // ตรวจสอบข้อมูลที่เพิ่มใน FormData

        try {
            const response = await axios.post('http://localhost:3333/api/edit_data_ads', newData)
            const result = response.data
            if (result.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'แก้ไขข้อมูลสำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                })
                handleCloseModal()
                fetchData()
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: `${dataModal.name_ads} ${dataModal.high_light} ${dataModal.get_next_week}`,
                text: JSON.stringify(error.response.data.message),
                showConfirmButton: false,
                timer: 1500
            })
        }
    }

    return (
        <Template use_me_bg='#fff'>
            {
                // data_ads.length === 0 ? (
                //     <div className="d-flex align-items-center justify-content-center" style={{ height: '88vh' }}>
                //         <div className="spinner-border text-danger" role="status">
                //             <span className="visually-hidden">Loading...</span>
                //         </div>
                //     </div>
                // ) : (
                <div className="container-fluid " style={{ height: '88vh' }}>
                    <div className="shadow-lg h-100 d-flex flex-column align-items-start justify-content-start p-2 position-relative" onClick={(e) => {

                    }}>
                        <div className="d-flex align-items-center justify-content-between w-100">
                            <h2 className="px-1">Manage Ads</h2>
                            <div className="d-flex align-items-center justify-content-end w-50" style={{ gap: '0.8vh' }}>
                                <input type="text" placeholder='Search A' className="form-control" style={{ width: '30vh' }} />
                                <button className="btn btn-primary" onClick={(e) => {
                                    setDataModal({
                                        type: 'add',
                                        name_ads: '',
                                        high_light: '',
                                        get_next_week: true
                                    })
                                    handleOpenModal()
                                }}>ADD ADS</button>
                            </div>

                        </div>
                        <table className="table  rounded " >
                            <thead>
                                <tr>
                                    <th scope="col" style={{ width: '6vh' }}>#</th>
                                    <th scope="col">EVENT NAME</th>
                                    <th scope="col">EVEN DETAIL</th>
                                    <th scope="col">NEXT WEEK</th>
                                    <th scope="col">STATUS</th>
                                    <th scope="col">CREATE AT</th>
                                </tr>
                            </thead>
                            <tbody className="h-100 ">
                                {
                                    data_ads.map((item, index) => {
                                        return (
                                            <tr key={index} className="hov"
                                                onClick={(e) => {
                                                    setDataModal({
                                                        image_ads: `http://localhost:3333${item.image_ads}`,
                                                        name_ads: item.name_ads,
                                                        high_light: item.high_light,
                                                        get_next_week: item.get_next_week,
                                                        type: 'edit',
                                                        id: item.id,
                                                        status_open: item.status_open
                                                    })
                                                    handleOpenModal()
                                                }}
                                            >
                                                <th scope="row">{item.id}</th>
                                                <td>{item.name_ads}</td>
                                                <td>{item.high_light}</td>
                                                <td>{item.get_next_week == 0 ?
                                                    <span className="badge bg-danger">NO</span> :
                                                    <span className="badge bg-success">YES</span>
                                                }</td>
                                                <td>
                                                    {
                                                        item.status_open == 0 ? (
                                                            <span className="badge bg-danger">CLOSE</span>
                                                        ) : (
                                                            <span className="badge bg-success">OPEN</span>
                                                        )

                                                    }
                                                </td>
                                                <td>{item.create_at}</td>

                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                // )
            }
            {
                isModalOpen && (
                    <Modal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        title={dataModal.type === 'add' ? 'Add Ads' : 'Edit Ads'}
                        // custom_max_width='90vh'
                        children={
                            <div className="card" style={{ border: 'none' }}>
                                <div className="row g-0 h-100" style={{}}>
                                    <div className="col-md-5 p-1 h-100 " onClick={(e) => {
                                    }}>
                                        <div className="w-100" style={{ height: '24vh' }}>
                                            <img src={dataModal.image_ads}

                                                className="w-100 h-100 img-fluid rounded" alt="..." style={{ objectFit: 'cover' }} />
                                        </div>
                                        <input className="mt-1" type="file"
                                            ref={inputRef}
                                            onChange={handleChangeFile} />
                                    </div>
                                    <div className="col-md-7 p-1">

                                        <div className="card-body text-start h-100">
                                            <div className="d-flex align-items-start justify-content-center flex-column">
                                                <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>EVENT NAME</p>
                                                <input type="text" className="form-control" value={dataModal.name_ads} onChange={(e) => { handleInputChange('name_ads', e.target.value) }} />
                                            </div>
                                            <div className="d-flex align-items-start justify-content-center flex-column mt-1">
                                                <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>EVENT DETAIL (HIGHT LIGHT)</p>
                                                <input type="text" className="form-control" value={dataModal.high_light} onChange={(e) => { handleInputChange('high_light', e.target.value) }} />
                                            </div>
                                            <div className="w-100 d-flex align-items-center justify-content-center mt-1">
                                                <div className="d-flex align-items-start justify-content-center flex-column w-100">
                                                    <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>USE NEXT WEEK</p>
                                                    <div class="form-check form-switch">
                                                        {
                                                            dataModal.get_next_week ? (
                                                                <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault" checked onChange={(e) => { handleInputChange('get_next_week', e.target.checked) }} />
                                                            ) : (
                                                                <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault" onChange={(e) => { handleInputChange('get_next_week', e.target.checked) }} />
                                                            )
                                                        }
                                                        <label class="form-check-label" for="flexSwitchCheckDefault">{dataModal.get_next_week ? 'ON' : 'OFF'}</label>
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-start justify-content-center flex-column w-100">
                                                    <p className="card-text m-0 p-0" style={{ fontWeight: 800 }}>STATUS OPEN</p>
                                                    <div class="form-check form-switch">
                                                        {
                                                            dataModal.status_open ? (
                                                                <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault" checked onChange={(e) => { handleInputChange('status_open', e.target.checked) }} />
                                                            ) : (
                                                                <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault" onChange={(e) => { handleInputChange('status_open', e.target.checked) }} />
                                                            )
                                                        }
                                                        <label class="form-check-label" for="flexSwitchCheckDefault">{dataModal.status_open ? 'OPEN' : 'CLOSE'}</label>
                                                    </div>
                                                </div>

                                            </div>


                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        custom_footer={
                            <button className="btn btn-primary w-100" onClick={(e) => {
                                dataModal.type === 'add' ? handleAddAds() : handleEditAds()
                            }}>{dataModal.type === 'add' ? 'ADD' : 'EDIT'}</button>
                        }
                    />
                )
            }

        </Template>
    )
}

export default ManageEvent