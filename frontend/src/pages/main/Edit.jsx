import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import bg_edit_page from '../../assets/bg_edit_page.png'
import Modal from "../../components/Modal";
import axios from 'axios'
import { jwtDecode } from "jwt-decode";
import Template from "../../components/Template";
import Swal from 'sweetalert2';
import checkToken from '../../func/CheckToken';
function Edit() {
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataModal, setDataModal] = useState()
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const [my_data, setMyData] = useState({
        email: '',
        fullname: '',
        phone: ''
    })

    const [password_data, setPassWordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    })


    const handleInputChange = (field, value) => {
        setMyData((prevDataModal) => ({
            ...prevDataModal,
            [field]: value,
        }));

    };

    const handleInputChangePassword = (field, value) => {
        setPassWordData((prevDataModal) => ({
            ...prevDataModal,
            [field]: value,
        }));

    };

    const get_my_id = () => {
        const token = checkToken()
        const decode_token = jwtDecode(token)
        const my_id = decode_token.id
        return my_id
    }

    const getProfile = async () => {
        const my_id = get_my_id()
        try {
            const response = await axios.get(`http://localhost:3333/api/get_my_data/${my_id}`)
            const result = response.data
            if (result.status === true) {
                setMyData(result.data)
            }
        } catch (error) {
            console.log(error);
        }
    }

    const save_password = async () => {
        const my_id = get_my_id()

        if (password_data.new_password !== password_data.confirm_password) {
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: 'Password not match'
            })
            return
        }
        try {
            const response = await axios.post(`http://localhost:3333/api/update_my_password/${my_id}`, password_data)
            const result = response.data
            if (result.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Password updated'
                })
                handleCloseModal()
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed',
                    text: result.message
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: JSON.stringify(error.response.data.message)
            })
        }
    }

    const save_profile = async () => {
        const my_id = get_my_id()

        try {
            const response = await axios.post(`http://localhost:3333/api/update_my_data/${my_id}`, my_data)
            const result = response.data
            if (result.status === true) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Profile updated'
                })
                handleCloseModal()
                getProfile()
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: JSON.stringify(error.response.data.message)
            })
        }
    }

    useEffect(() => {
        getProfile()
    }, [])

    useEffect(() => {
        setDataModal({
            children: [
                <div className="card p-2" style={{ border: 'none' }}>
                    <div className="row g-0 h-100">
                        <div className="col-md-12 p-1">
                            <div className="d-flex flex-column align-items-start justify-content-start gap-2">
                                <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={my_data.fullname}
                                        className='form-control'
                                        onChange={(e) => handleInputChange('fullname', e.target.value)}
                                        style={{ height: '48px' }}
                                    />
                                </div>
                                <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                                    <label>Phone Number</label>
                                    <input
                                        type="number"
                                        value={my_data.phone}
                                        className='form-control'
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        style={{ height: '48px' }}
                                    />
                                </div>
                                <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={my_data.email}
                                        className='form-control'
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        style={{ height: '48px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ],
            footer: [
                <div className="d-flex align-items-center justify-content-center gap-2 w-100">
                    <button
                        className='btn w-100 text-white'
                        style={{ background: '#ABC4AB' }}
                        onClick={() => save_profile()}
                    >
                        SAVE
                    </button>
                </div>
            ]
        });
    }, [my_data]);

    useEffect(() => {
        setDataModal({
            children: [
                <div className="card p-2" style={{ border: 'none' }}>
                    <div className="row g-0 h-100" style={{}}>
                        <div className="col-md-12 p-1">
                            <div className="d-flex flex-column align-items-start justify-content-start gap-2">
                                <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                                    <label>Old Password</label>
                                    <input type="password" value={password_data.old_password} className='form-control' onChange={(e) => {
                                        handleInputChangePassword('old_password', e.target.value)

                                    }} style={{ height: '48px' }} />
                                </div>
                                <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                                    <label>New Password</label>
                                    <input type="password" value={password_data.new_password} className='form-control' onChange={(e) => {
                                        handleInputChangePassword('new_password', e.target.value)
                                    }} style={{ height: '48px' }} />
                                </div>
                                <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                                    <label>Confirm Password</label>
                                    <input type="password" value={password_data.confirm_password} className='form-control' onChange={(e) => {
                                        handleInputChangePassword('confirm_password', e.target.value)
                                    }} style={{ height: '48px' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ],
            footer: [
                <div className="d-flex align-items-center justify-content-center gap-2 w-100">
                    <button className='btn w-100 text-white' style={{ background: '#ABC4AB' }} onClick={(e) => {
                        save_password()
                    }}>SAVE</button>
                </div>
            ]
        });
    }, [password_data]);



    return (
        <Template use_me_bg={'#fff'}>
            <div className="container-fluid  p-2" style={{ height: '90vh' }}>
                <div className="shadow-lg h-100 row g-0 row-cols-xl-2">
                    <div className="col h-100">
                        <img src={bg_edit_page} alt="" className='w-100 h-100 img-fluid' />
                    </div>
                    <div className="col d-flex flex-column align-items-center justify-content-center h-100 rounded-end" style={{ padding: '3vh', gap: '2vh', background: '#ABC4AB' }}>
                        <h1 style={{ color: '#000' }}>My Account</h1>
                        <div className="d-flex flex-column align-items-center justify-content-start" style={{ gap: '14px', width: '467px' }}>
                            <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                                <label>Full Name</label>
                                <input type="text" disabled value={my_data.fullname} className='form-control' style={{ height: '48px' }} />
                            </div>
                            <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                                <label>Phone Number</label>
                                <input type="number" disabled value={my_data.phone} className='form-control' style={{ height: '48px' }} />
                            </div>
                            <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                                <label>Email Address</label>
                                <input type="email" disabled value={my_data.email} className='form-control' style={{ height: '48px' }} />
                            </div>
                            <div className="d-flex align-items-center justify-content-between w-100" style={{ gap: '2vh' }}>
                                <button className='btn w-50' onClick={(e) => {
                                    setDataModal({
                                        children: [
                                            <div className="card p-2" style={{ border: 'none' }}>
                                                <div className="row g-0 h-100" style={{}}>
                                                    <div className="col-md-12 p-1">
                                                        <div className="d-flex flex-column align-items-start justify-content-start gap-2">
                                                            <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                                                                <label>Full Name</label>
                                                                <input type="text" value={my_data.fullname} className='form-control' onChange={(e) => {
                                                                    handleInputChange('fullname', e.target.value)

                                                                }} style={{ height: '48px' }} />
                                                            </div>
                                                            <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                                                                <label>Phone Number</label>
                                                                <input type="number" value={my_data.phone} className='form-control' onChange={(e) => {
                                                                    handleInputChange('phone', e.target.value)
                                                                }} style={{ height: '48px' }} />
                                                            </div>
                                                            <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                                                                <label>Email Address</label>
                                                                <input type="email" value={my_data.email} className='form-control' onChange={(e) => {
                                                                    handleInputChange('email', e.target.value)
                                                                }} style={{ height: '48px' }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ],
                                        footer: [
                                            <div className="d-flex align-items-center justify-content-center gap-2 w-100">
                                                <button className='btn w-100 text-white' style={{ background: '#ABC4AB' }} onClick={(e) => {
                                                    save_profile()
                                                }}>SAVE</button>
                                            </div>
                                        ]
                                    })
                                    handleOpenModal()
                                }} style={{ height: '48px', padding: '2px 40px', borderRadius: '8px', background: 'rgba(109, 76, 61, 0.70)', border: '0.3vh solid #000' }}>Edit My Account</button>
                                <button className='btn w-50' style={{ height: '48px', padding: '2px 40px', borderRadius: '8px', background: 'rgba(109, 76, 61, 0.70)', border: '0.3vh solid #000' }}
                                    onClick={(e) => {
                                        setPassWordData({
                                            old_password: '',
                                            new_password: '',
                                            confirm_password: ''
                                        })
                                        setDataModal({
                                            children: [
                                                <div className="card p-2" style={{ border: 'none' }}>
                                                    <div className="row g-0 h-100" style={{}}>
                                                        <div className="col-md-12 p-1">
                                                            <div className="d-flex flex-column align-items-start justify-content-start gap-2">
                                                                <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                                                                    <label>Old Password</label>
                                                                    <input type="password" value={password_data.old_password} className='form-control' onChange={(e) => {
                                                                        handleInputChangePassword('old_password', e.target.value)

                                                                    }} style={{ height: '48px' }} />
                                                                </div>
                                                                <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                                                                    <label>New Password</label>
                                                                    <input type="password" value={password_data.new_password} className='form-control' onChange={(e) => {
                                                                        handleInputChangePassword('new_password', e.target.value)
                                                                    }} style={{ height: '48px' }} />
                                                                </div>
                                                                <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                                                                    <label>Confirm Password</label>
                                                                    <input type="password" value={password_data.confirm_password} className='form-control' onChange={(e) => {
                                                                        handleInputChangePassword('confirm_password', e.target.value)
                                                                    }} style={{ height: '48px' }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ],
                                            footer: [
                                                <div className="d-flex align-items-center justify-content-center gap-2 w-100">
                                                    <button className='btn w-100 text-white' style={{ background: '#ABC4AB' }} onClick={(e) => {
                                                        save_password()
                                                    }}>SAVE</button>
                                                </div>
                                            ]
                                        })
                                        handleOpenModal()
                                    }}
                                >Change Password</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {
                isModalOpen && (
                    <Modal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        title=""
                        custom_max_width='90vh'
                        children={
                            dataModal.children[0]
                        }
                        custom_footer={
                            dataModal.footer[0]
                        }
                    />
                )
            }
        </Template>
    )
}

export default Edit