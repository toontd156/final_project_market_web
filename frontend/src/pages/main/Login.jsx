import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import bg_login from '../../assets/bg_login.png'
import bg_login_2 from '../../assets/bg_login_2.png'
import logo_login from '../../assets/logo_login.png'
import axios from 'axios'
import { jwtDecode } from "jwt-decode";
import Template from "../../components/Template";

import Swal from 'sweetalert2'
function Login() {
    const navigate = useNavigate()
    const [inputEmail, setInputEmail] = useState('')
    const [inputPassword, setInputPassword] = useState('')


    useEffect(() => {
        const savePassword = localStorage.getItem('savePassword')
        if (savePassword) {
            setInputPassword(savePassword)
        }
    }, []);

    const justLogin = async () => {
        if (inputEmail === '' || inputPassword === '') {
            alert('Please input email and password')
        }

        const data = {
            email: inputEmail,
            password: inputPassword,
        }
        try {
            const response = await axios.post('http://localhost:3333/api/login', data)
            const result = response.data
            if (result.status === true && result.token) {
                const decodedToken = jwtDecode(result.token);
                const expirationTime = decodedToken.exp * 1000;
                localStorage.setItem('token', result.token);
                localStorage.setItem('expiration', expirationTime);

                navigate(-1)
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('expiration');
                }, expirationTime - Date.now());
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
            <div className="container-fluid h-100 p-2" style={{ }}>
                <div className="shadow-lg h-100 row g-0 row-cols-xl-2">
                    <div className="col h-100">
                        <img src={bg_login_2} alt="" className='w-100 h-100 img-fluid' />
                    </div>
                    <div className="col d-flex flex-column align-items-center justify-content-start bg-white" style={{  padding: '3vh', gap: '2vh' }}>
                        <div className="d-flex align-items-center justify-content-center" style={{ width: '206px', height: '207px' }} >
                            <img src={logo_login} alt="" className='w-100 h-100 img-fluid' />
                        </div>
                        <h1 style={{color: '#000'}}>Login Account</h1>
                        <div className="d-flex flex-column align-items-center justify-content-start" style={{ gap: '14px', width: '467px' }}>
                            <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                                <label>Email Address</label>
                                <input type="email" placeholder='Input your Email' value={inputEmail} onChange={(e) => setInputEmail(e.target.value)} className='form-control' style={{ height: '48px' }} />
                            </div>
                            <div className="d-flex flex-column align-items-start justify-content-start w-100" style={{ gap: '4px' }}>
                                <label>Password</label>
                                <input type="password" placeholder='Input Password' value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} className='form-control' style={{ height: '48px' }} />
                            </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between" style={{ width: '462px' }}>
                            <div className="d-flex align-items-center justify-content-start" style={{ gap: '0.9vh' }}>
                                <input type="checkbox" name="" id="" onChange={(e) => {
                                    if (e.target.checked) {
                                        localStorage.setItem('savePassword', inputPassword)
                                    } else {
                                        localStorage.removeItem('savePassword')
                                    }
                                }} />
                                <span>save password</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <Link to={'/'} style={{color: '#727D71'}}>Forgot Password?</Link>
                            </div>
                        </div>
                        <div className="d-flex flex-column align-items-center justify-content-between" style={{ gap: '2vh' }}>
                            <button className='btn' onClick={(e) => justLogin()} style={{ height: '48px', padding: '2px 40px', borderRadius: '8px', background: '#87C38F' }}>Login</button>
                            <div className="d-flex align-items-center justify-content-center" style={{ gap: '1vh' }}>
                                <span>Don't have an account?</span>
                                <Link to={'/Register'} style={{color: '#727D71'}}>Sign Up</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Template>
    )
}

export default Login