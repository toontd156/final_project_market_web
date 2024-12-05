import { Link, useNavigate } from 'react-router-dom'
import React from 'react'
import { useState, useEffect } from 'react'
import bg_login from '../../assets/bg_login.png'
import bg_register from '../../assets/bg_register.png'
import logo_login from '../../assets/logo_login.png'
import axios from 'axios'
import Swal from 'sweetalert2'
import config from '../../conf/config';
import Template from "../../components/Template";
import calculatorWidthAndHeight from '../../func/CalculatorWidthAndHeight';

function Register() {
    const navigate = useNavigate()
    const [inputEmail, setInputEmail] = useState('')
    const [inputPassword, setInputPassword] = useState('')
    const [inputName, setInputName] = useState('')
    const [inputPhone, setInputPhone] = useState('')
    const [inputConfirmPassword, setInputConfirmPassword] = useState('')

    const justRegister = async () => {
        if (inputEmail === '' || inputPassword === '' || inputName === '' || inputPhone === '' || inputConfirmPassword === '') {
            alert('Please input all field')
        }
        if (inputPassword !== inputConfirmPassword) {
            alert('Password and Confirm Password not match')
        }

        const data = {
            email: inputEmail,
            password: inputPassword,
            fullname: inputName,
            phone: inputPhone
        }

        try {
            const response = await axios.post(config.api_url + '/api/signup', data)
            const result = response.data
            if (result.status) {
                navigate('/Login')
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Register Failed',
                    text: result.message
                })
            }

        } catch (error) {
            if (error.response && error.response.status === 400) {
                Swal.fire({
                    icon: 'error',
                    title: 'Register Failed',
                    text: error.response.data.message
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Register Failed',
                    text: error.message
                })
            }
        }

    }

    return (
        <Template>
            <div className="container-fluid h-100 p-2" style={{}}>
                <div className="shadow-lg h-100 row g-0 row-cols-xl-2">
                    <div className="col-12 col-sm-6 h-100">
                        <img src={bg_register} alt="" className='w-100 h-100 ' style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="col-12 col-sm-6 d-flex flex-column align-items-center justify-content-start bg-white h-100" style={{ padding: '3vh', gap: '2vh' }}>
                        <div className="d-flex align-items-center justify-content-center" style={{ width: calculatorWidthAndHeight(154), height: calculatorWidthAndHeight(155) }} >
                            <img src={logo_login} alt="" className='w-100 h-100 img-fluid' />
                        </div>
                        <h1 style={{ color: '#000' }}>Create Account</h1>
                        <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                            <label>Full Name</label>
                            <input type="text" placeholder='Input your Full Name' value={inputName} onChange={(e) => setInputName(e.target.value)} className='form-control' style={{ height: '48px' }} />
                        </div>
                        <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                            <label>Email Address</label>
                            <input type="email" placeholder='Input your Email' value={inputEmail} onChange={(e) => setInputEmail(e.target.value)} className='form-control' style={{ height: '48px' }} />
                        </div>
                        <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                            <label>Phone Number</label>
                            <input type="number" placeholder='Input Phone Number' value={inputPhone} onChange={(e) => setInputPhone(e.target.value)} className='form-control' style={{ height: '48px' }} />
                        </div>
                        <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                            <label>Password</label>
                            <input type="password" placeholder='Input Password' value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} className='form-control' style={{ height: '48px' }} />
                        </div>
                        <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                            <label>Confirm Password</label>
                            <input type="password" placeholder='Input Confirm Password' value={inputConfirmPassword} onChange={(e) => setInputConfirmPassword(e.target.value)} className='form-control' style={{ height: '48px' }} />
                        </div>
                        <button className='btn btn-light' onClick={(e) => justRegister()}>CREATE ACCOUNT</button>
                    </div>
                </div>
            </div>
        </Template>
    )
}

export default Register