import { useEffect, useState } from "react";
import Template from "../../components/Template";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Swal from 'sweetalert2'
import Modal from "../../components/Modal";
import icon_all_user from '../../assets/icon_all_user.png'
import icon_all_admin from '../../assets/icon_all_admin.png'
import checkToken from '../../func/CheckToken';
import config from '../../conf/config';
import calculatorWidthAndHeight from '../../func/CalculatorWidthAndHeight';

function ManageUser() {
    const [searchInput, setSearchInput] = useState('');
    const [data_user, setDataUser] = useState([]);
    const [all_user, setAllUser] = useState(0);
    const [all_admin, setAllAdmin] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchRole, setSearchRole] = useState('user');
    const [sortConfig, setSortConfig] = useState({ key: 'toggle', direction: 'asc' });


    const sortedData = data_user
        .filter((val) => {
            const inputMatch = searchInput === '' ||
                val.email.toLowerCase().includes(searchInput.toLowerCase()) ||
                val.shop_name && (val.shop_name.toLowerCase().includes(searchInput.toLowerCase())) ||
                val.fullname.toLowerCase().includes(searchInput.toLowerCase());

            const roleMatch = val.role === searchRole;

            return inputMatch && roleMatch;
        })
        .sort((a, b) => {
            if (sortConfig.key === 'toggle') {
                const direction = sortConfig.direction === 'asc' ? 1 : -1;
                return a.toggle === b.toggle ? 0 : a.toggle ? -direction : direction;
            }
            return 0; 
        });

    const [dataModal, setDataModal] = useState(
        {
            fullname: '',
            email: '',
            phone: '',
            password: '',
            shop_name: '',
            shop_detail: '',
            role: 'user'
        }
    )

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };


    const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    }

    const checkUser = async () => {
        checkMyToken();
        try {
            const response = await axios.get(config.api_url + '/api/user_all')
            const result = response.data
            if (result.status) {
                console.log(result.data)
                setDataUser(result.data)
                setAllAdmin(result.data.filter((val) => val.role === 'admin').length)
                setAllUser(result.data.filter((val) => val.role === 'user').length)
            }
        } catch (error) {
            console.log(error);
        }
    }

    const checkMyToken = () => {
        const token = checkToken();
        if (!token) {
            navigate('/Login')
        }
        const decodeToken = jwtDecode(token);
        if (decodeToken.role !== 'admin') {
            navigate('/Login')
        }
        return true
    }

    const handleInputChange = (field, value) => {
        setDataModal((prevDataModal) => ({
            ...prevDataModal,
            [field]: value,
        }));
    };

    const delete_user = async (id) => {
        checkMyToken();
        try {
            const response = await axios.post(`http://localhost:3333/api/delete_user/${id}`)
            const result = response.data
            if (result.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'User has been deleted.',
                })
                checkUser()
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: response.message,
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: JSON.stringify(error.response.data.message),
            })
        }
    }

    const change_user = async (id, role) => {
        checkMyToken();
        try {
            const response = await axios.post(`http://localhost:3333/api/change_user/${id}`, { role })
            const result = response.data
            if (result.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Changed!',
                    text: `${role} has been changed.`,
                })
                checkUser()
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: response.message,
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: JSON.stringify(error.response.data.message),
            })
        }
    }

    const change_user_toggle = async (id, bool, reason) => {
        checkMyToken();
        try {
            const response = await axios.post(`http://localhost:3333/api/change_user_toggle/${id}`, { bool, reason })
            const result = response.data
            if (result.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Changed!',
                    text: `${bool ? 'enabled' : 'disabled'} has been changed.`,
                })
                checkUser()
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: response.message,
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: JSON.stringify(error.response.data.message),
            })
        }
    }

    const action_add = async (data) => {
        checkMyToken();
        try {
            const response = await axios.post(config.api_url + '/api/add_user_with_admin', data)
            const result = response.data
            if (result.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Added!',
                    text: 'User has been added.',
                })
                checkUser()
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: response.message,
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: JSON.stringify(error.response.data.message),
            })
        }
    }

    const action_edit = async (data) => {
        checkMyToken();
        try {
            const response = await axios.post(config.api_url + '/api/edit_user_with_admin', data)
            const result = response.data
            if (result.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Edited!',
                    text: 'User has been edited.',
                })
                checkUser()
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: response.message,
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: JSON.stringify(error.response.data.message),
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
        checkUser()
    }, [])

    return (
        <Template use_me_bg={'#fff'}>
            {
                data_user.length === 0 ? (
                    <div className="d-flex align-items-center justify-content-center" style={{ height: '88vh' }}>
                        <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="container-fluid" style={{ height: '92vh' }}>
                        <div className=" h-100 row g-0">
                            <div className="col-12 d-flex flex-column align-items-start justify-content-start h-100 p-1 rounded" style={{ gap: '0.4vh' }}>
                                <div className="d-flex flex-column align-items-center justify-content-start w-100" style={{ gap: '0.4vh' }}>
                                    <div className="d-flex align-items-center justify-content-between w-100">
                                        <span className="text-start w-100" style={{ fontSize: calculatorWidthAndHeight(22), fontWeight: 500 }}>MANAGE USER</span>
                                        <div className="d-flex align-items-center justify-content-end form-group w-50" style={{ gap: '0.7vh' }}>
                                            <input type="text" placeholder='Search' className="form-control" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ width: '30vh' }} />
                                            <div className="d-flex align-items-center justify-content-between ">

                                                <div className="d-flex align-items-center justify-content-center">
                                                    <button className="btn btn-primary" style={{ fontSize: calculatorWidthAndHeight(20), maxHeight: calculatorWidthAndHeight(48) }} onClick={(e) => {
                                                        setDataModal(
                                                            {
                                                                type: 'add',
                                                                fullname: '',
                                                                email: '',
                                                                phone: '',
                                                                password: '',
                                                                shop_name: null,
                                                                shop_detail: null,
                                                                role: 'admin'
                                                            }
                                                        )
                                                        handleOpenModal()
                                                    }}>ADD ADMIN</button>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-evenly w-100 gap-2">
                                        <div className="d-flex align-items-center justify-content-center px-4 py-2 gap-4 rounded hov" onClick={(e) => setSearchRole('user')} style={{ background: '#A39967', border: searchRole === 'user' ? '0.4vh solid #000' : 'none' }}>
                                            <img src={icon_all_user} alt="" style={{ width: '10vh', height: '10vh', objectFit: 'cover' }} />
                                            <span style={{ fontSize: '4vh', fontWeight: 600 }}>ALL USER</span>
                                            <span style={{ fontSize: '4vh', fontWeight: 600 }}>{all_user}</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center px-4 py-2 gap-4 rounded hov" onClick={(e) => setSearchRole('admin')} style={{ background: '#A39967', border: searchRole === 'admin' ? '0.4vh solid #000' : 'none' }}>
                                            <img src={icon_all_admin} alt="" style={{ width: '10vh', height: '10vh', objectFit: 'cover' }} />
                                            <span style={{ fontSize: '4vh', fontWeight: 600 }}>ALL Admin</span>
                                            <span style={{ fontSize: '4vh', fontWeight: 600 }}>{all_admin}</span>
                                        </div>
                                    </div>

                                </div>
                                <div className="d-flex flex-column align-items-center justify-content-start w-100 h-100 rounded">
                                    <table className="table  rounded w-100" >
                                        <thead className="w-100">
                                            <tr>
                                                <th scope="col" style={{ width: '6vh' }}>#</th>
                                                <th scope="col">Register Date</th>
                                                <th scope="col">FULL NAME</th>
                                                <th scope="col">EMAIL</th>
                                                <th scope="col">PHONE</th>
                                                <th scope="col">ROLE</th>
                                                {
                                                    searchRole === 'user' && (
                                                        <>
                                                            <th scope="col">SHOP NAME</th>
                                                            <th scope="col">SHOP DETAIL</th>
                                                        </>
                                                    )
                                                }

                                                <th scope="col" onClick={handleSortToggle} style={{ cursor: 'pointer' }}>
                                                    TOGGLE {sortConfig.direction === 'asc' ? '▲' : '▼'}
                                                </th>
                                                <th scope="col">MANAGE</th>
                                            </tr>
                                        </thead>
                                        <tbody className="h-100 w-100">
                                            {
                                                sortedData.map((val, index) => {
                                                    return (
                                                        <tr key={index}
                                                            className=""
                                                            style={{ verticalAlign: 'middle' }}

                                                        >
                                                            <th scope="row">{index + 1}</th>
                                                            <td>{formatDate(val.create_at)}</td>
                                                            <td>{val.fullname}</td>
                                                            <td>{val.email}</td>
                                                            <td>{val.phone}</td>
                                                            <td>{val.role}</td>
                                                            {
                                                                searchRole === 'user' && (
                                                                    <>
                                                                        <td>{val.shop_name}</td>
                                                                        <td>{val.shop_detail}</td>
                                                                    </>
                                                                )
                                                            }
                                                            <td>
                                                                <div className="d-flex align-items-center justify-content-start">
                                                                    <div className=" d-flex align-items-center justify-content-center" style={{ background: val.toggle == 1 ? '#ABC4AB' : '#DC3543', color: "#fff", padding: '0.9vh 1.2vh', borderRadius: '0.6vh' }}>
                                                                        <span style={{ fontSize: '1.6vh', fontWeight: 500 }}>{val.toggle == 1 ? 'ENABLE' : 'DISABLE'}</span>
                                                                    </div>
                                                                    {/* <button className="btn" style={{ background: val.toggle ? '#ABC4AB' : '#DC3543', color: "#fff" }} onClick={(e) => {
                                                                        Swal.fire({
                                                                            title: 'Are you sure?',
                                                                            text: `You want to ${val.toggle ? 'disable' : 'enable'} ${val.email}!`,
                                                                            icon: 'warning',
                                                                            showCancelButton: true,
                                                                            confirmButtonText: 'Yes, change it!',
                                                                            cancelButtonText: 'No, keep it',
                                                                            input: 'text',
                                                                            inputPlaceholder: 'Type your Reason...',
                                                                        }).then((result) => {
                                                                            if (result.value === '') {
                                                                                Swal.fire(
                                                                                    'Cancelled',
                                                                                    'Reason is required!',
                                                                                    'error'
                                                                                )
                                                                            } else if (result.isConfirmed) {
                                                                                Swal.fire(
                                                                                    'Changed!',
                                                                                    `User has been ${val.toggle ? 'disabled' : 'enabled'}.`,
                                                                                    'success'
                                                                                )
                                                                                val.toggle = !val.toggle
                                                                                change_user_toggle(val.id, val.toggle, result.value)
                                                                            } else if (result.dismiss === Swal.DismissReason.cancel) {
                                                                                Swal.fire(
                                                                                    'Cancelled',
                                                                                    'User is safe :)',
                                                                                    'error'
                                                                                )
                                                                            }
                                                                        }
                                                                        )
                                                                    }} >{val.toggle ? 'Enable' : 'Disable'}</button> */}
                                                                </div>
                                                            </td>
                                                            <td className="d-flex align-items-center justify-content-start " style={{ gap: '0.6vh' }}>
                                                                {
                                                                    searchRole == 'user' && (
                                                                        <>
                                                                            <button className="btn text-white btn-warning" onClick={(e) => {
                                                                                setDataModal(
                                                                                    {
                                                                                        type: 'edit',
                                                                                        id: val.id,
                                                                                        fullname: val.fullname,
                                                                                        email: val.email,
                                                                                        phone: val.phone,
                                                                                        shop_name: val.shop_name,
                                                                                        shop_detail: val.shop_detail,
                                                                                        role: val.role,
                                                                                        toggle: val.toggle ? true : false,
                                                                                        reason_toggle: val.reason_toggle || undefined,
                                                                                    }
                                                                                )
                                                                                handleOpenModal()
                                                                            }}>EDIT</button>
                                                                            <button className="btn text-white" style={{ background: '#ABC4AB' }} onClick={(e) => {
                                                                                Swal.fire({
                                                                                    title: 'Are you sure?',
                                                                                    text: `You want to change ${val.email} to admin!`,
                                                                                    icon: 'warning',
                                                                                    showCancelButton: true,
                                                                                    confirmButtonText: 'Yes, change it!',
                                                                                    cancelButtonText: 'No, keep it'
                                                                                }).then((result) => {
                                                                                    if (result.isConfirmed) {
                                                                                        Swal.fire(
                                                                                            'Changed!',
                                                                                            'User has been changed to admin.',
                                                                                            'success'
                                                                                        )
                                                                                        change_user(val.id, 'admin')
                                                                                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                                                                                        Swal.fire(
                                                                                            'Cancelled',
                                                                                            'User is safe :)',
                                                                                            'error'
                                                                                        )
                                                                                    }
                                                                                }
                                                                                )
                                                                            }}>ADD NEW ADMIN</button>
                                                                        </>

                                                                    )
                                                                }
                                                                {
                                                                    searchRole == 'admin' && (
                                                                        <>
                                                                            <button className="btn text-white btn-warning" onClick={(e) => {
                                                                                setDataModal(
                                                                                    {
                                                                                        type: 'edit',
                                                                                        id: val.id,
                                                                                        fullname: val.fullname,
                                                                                        email: val.email,
                                                                                        phone: val.phone,
                                                                                        shop_name: val.shop_name,
                                                                                        shop_detail: val.shop_detail,
                                                                                        role: val.role,
                                                                                        toggle: val.toggle ? true : false,
                                                                                        reason_toggle: val.reason_toggle || undefined,
                                                                                    }
                                                                                )
                                                                                handleOpenModal()
                                                                            }}>EDIT</button>
                                                                            <button className="btn text-white" style={{ background: '#ABC4AB' }} onClick={(e) => {
                                                                                Swal.fire({
                                                                                    title: 'Are you sure?',
                                                                                    text: `You want to change ${val.email} to user!`,
                                                                                    icon: 'warning',
                                                                                    showCancelButton: true,
                                                                                    confirmButtonText: 'Yes, change it!',
                                                                                    cancelButtonText: 'No, keep it'
                                                                                }).then((result) => {
                                                                                    if (result.isConfirmed) {
                                                                                        Swal.fire(
                                                                                            'Changed!',
                                                                                            'Admin has been changed to user.',
                                                                                            'success'
                                                                                        )
                                                                                        change_user(val.id, 'user')
                                                                                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                                                                                        Swal.fire(
                                                                                            'Cancelled',
                                                                                            'Admin is safe :)',
                                                                                            'error'
                                                                                        )
                                                                                    }
                                                                                }
                                                                                )
                                                                            }}>REMOVE ADMIN ROLE</button>
                                                                        </>

                                                                    )
                                                                }

                                                            </td>
                                                        </tr>
                                                    )
                                                })
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
                        title={dataModal.type == 'add' ? 'ADD ADMIN' : 'EDIT USER'}
                        children={
                            <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{ gap: '0.6vh' }}>
                                <div className="w-100 d-flex align-items-center justify-content-center" style={{ gap: '0.2vh' }}>
                                    <div className="form-group w-50">
                                        <label htmlFor="fullname" className="form-label">Full Name</label>
                                        <input type="text" placeholder='Full Name' className="form-control" value={dataModal.fullname} onChange={(e) => handleInputChange('fullname', e.target.value)} />
                                    </div>
                                    <div className="form-group w-50">
                                        <label htmlFor="phone" className="form-label">Phone</label>
                                        <input type="text" placeholder='Phone' className="form-control" value={dataModal.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                                    </div>

                                </div>
                                <div className="w-100 d-flex align-items-center justify-content-center" style={{ gap: '0.2vh' }}>
                                    <div className="form-group w-100">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input type="email" placeholder='Email' className="form-control" value={dataModal.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                                    </div>
                                    {
                                        dataModal.password !== undefined && (
                                            <div className="form-group w-100">
                                                <label htmlFor="password" className="form-label">Password</label>
                                                <input type="password" placeholder='Password' className="form-control" value={dataModal.password} onChange={(e) => handleInputChange('password', e.target.value)} />
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="w-100 d-flex align-items-center justify-content-center" style={{ gap: '0.2vh' }}>
                                    {/* {
                                        dataModal.type === 'add' && (
                                            <div className="form-group w-100">
                                                <label htmlFor="role" className="form-label">Role</label>
                                                <select className="form-select" value={dataModal.role} onChange={(e) => handleInputChange('role', e.target.value)}>
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                        )
                                    } */}
                                    {
                                        dataModal.toggle !== undefined && (
                                            <div className="form-group w-100">
                                                <label htmlFor="toggle" className="form-label">Toggle</label>
                                                <select className="form-select" value={dataModal.toggle} onChange={(e) => {
                                                    const toggleValue = e.target.value === 'true';
                                                    handleInputChange('toggle', toggleValue);
                                                    handleInputChange('reason_toggle', toggleValue ? undefined : '');
                                                }}
                                                >
                                                    <option value={true}>Enable</option>
                                                    <option value={false}>Disable</option>
                                                </select>
                                            </div>
                                        )
                                    }

                                    {
                                        dataModal.reason_toggle !== undefined && (
                                            <div className="form-group w-100">
                                                <label htmlFor="reason_toggle" className="form-label">Reason</label>
                                                <input type="text" placeholder='Reason' className="form-control" value={dataModal.reason_toggle} onChange={(e) => handleInputChange('reason_toggle', e.target.value)} />
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        }
                        custom_footer={
                            <button className="btn btn-primary w-100" onClick={(e) => {
                                if (dataModal.type == 'add') {
                                    action_add(dataModal)
                                } else {
                                    console.log(dataModal.toggle)
                                    if (dataModal.toggle === false && dataModal.reason_toggle.length < 1) {
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Oops...',
                                            text: 'Reason is required!',
                                        })
                                        return
                                    }
                                    action_edit(dataModal)
                                }
                                handleCloseModal()
                            }} >{dataModal.type == 'add' ? 'ADD' : 'SAVE'}</button>
                        }
                    />
                )
            }
        </Template>
    )
}

export default ManageUser