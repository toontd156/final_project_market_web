import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import bg_login from '../../assets/bg_login.png'
import bg_login_2 from '../../assets/bg_login_2.png'
import logo_login from '../../assets/logo_login.png'
import axios from 'axios'
import { jwtDecode } from "jwt-decode";
import Template from "../../components/Template";
import config from '../../conf/config';
import calculatorWidthAndHeight from '../../func/CalculatorWidthAndHeight';

import Swal from 'sweetalert2'
function ForgerPassword() {
    const navigate = useNavigate()
    const [inputEmail, setInputEmail] = useState('')
    const [inputPassword, setInputPassword] = useState('')
    const [inputOtp, setInputOtp] = useState('')
    const [confirmInputPassword, setConfirmInputPassword] = useState('')
    const [typeAction, setTypeAction] = useState('')


    const justLogin = async () => {
        if (inputEmail === '') {
            alert('Please input email ')
        }

        const data = {
            email: inputEmail,
        }
        try {
            const response = await axios.post(config.api_url + '/api/forgetPassword', data)
            const result = response.data
            if (result.status === true) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: result.message
                })
                setTypeAction('otp')
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: result.message
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: error.response.data.message
            })


        }
    }

    const sendOtpForVerify = async () => {
        if (inputPassword === '') {
            alert('Please input OTP ')
        }

        const data = {
            email: inputEmail,
            otp: inputOtp
        }
        try {
            const response = await axios.post(config.api_url + '/api/verifyOtp', data)
            const result = response.data
            if (result.status === true) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: result.message
                })
                setTypeAction('pass')
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: result.message
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: error.response.data.message
            })
        }
    }

    const resetPassword = async () => {
        if (inputPassword === '' || confirmInputPassword === '') {
            alert('Please input password ')
        }

        if (inputPassword !== confirmInputPassword) {
            alert('Password not match')
        }

        const data = {
            email: inputEmail,
            password: inputPassword
        }
        try {
            const response = await axios.post(config.api_url + '/api/resetPassword', data)
            const result = response.data
            if (result.status === true) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: result.message
                })
                navigate('/Login')
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: result.message
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: error.response.data.message
            })
        }
    }

    return (
        <Template>
            <div className="container-fluid h-100 p-2" style={{}}>
                <div className="shadow-lg h-100 row g-0 row-cols-xl-2">
                    <div className="col-12 col-sm-6 h-100">
                        <img src={bg_login_2} alt="" className='w-100 h-100 img-fluid' />
                    </div>
                    <div className="col-12 col-sm-6 d-flex flex-column align-items-center justify-content-start bg-white" style={{ padding: '3vh', gap: '2vh' }}>
                        <div className="d-flex align-items-center justify-content-center" style={{ width: calculatorWidthAndHeight(206), height: calculatorWidthAndHeight(207) }} >
                            <img src={logo_login} alt="" className='w-100 h-100 img-fluid' />
                        </div>
                        <h1 style={{ color: '#000' }}>ForgerPassword</h1>
                        {
                            typeAction == 'pass' ? (
                                <div className="d-flex flex-column align-items-center justify-content-start w-50 mt-4" style={{ gap: calculatorWidthAndHeight(14) }}>
                                    <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                        <label>New Password</label>
                                        <input type="password" placeholder='Input your Password' value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} className='form-control' style={{ height: calculatorWidthAndHeight(48) }} />
                                    </div>
                                    <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                        <label>Confirm New Password</label>
                                        <input type="password" placeholder='Input your Password' value={confirmInputPassword} onChange={(e) => setConfirmInputPassword(e.target.value)} className='form-control' style={{ height: calculatorWidthAndHeight(48) }} />
                                    </div>
                                </div>
                            ) : typeAction == 'otp' ? (
                                <div className="d-flex flex-column align-items-center justify-content-start w-50 mt-4" style={{ gap: calculatorWidthAndHeight(14) }}>
                                    <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                        <label>OTP</label>
                                        <input type="text" placeholder='Input your OTP' value={inputOtp} onChange={(e) => setInputOtp(e.target.value)} className='form-control' style={{ height: calculatorWidthAndHeight(48) }} />
                                    </div>
                                 
                                </div>
                            ) : (
                                <div className="d-flex flex-column align-items-center justify-content-start w-50 mt-4" style={{ gap: calculatorWidthAndHeight(14) }}>
                                    <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: calculatorWidthAndHeight(4) }}>
                                        <label>Email Address</label>
                                        <input type="email" placeholder='Input your Email' value={inputEmail} onChange={(e) => setInputEmail(e.target.value)} className='form-control' style={{ height: calculatorWidthAndHeight(48) }} />
                                    </div>
                                </div>
                            )
                        }
                        <button className='btn btn-primary w-50 p-2' onClick={(e) => {
                            if (typeAction === '') {
                                justLogin()
                            } else if (typeAction === 'otp') {
                                sendOtpForVerify()
                            } else if (typeAction === 'pass') {
                                resetPassword()
                            }
                        }}>{typeAction == '' ? 'Check Email' : typeAction == 'otp' ? 'Send OTP' : 'Reset Password'}</button>
                    </div>
                </div>
            </div>
        </Template>
    )
}

export default ForgerPassword