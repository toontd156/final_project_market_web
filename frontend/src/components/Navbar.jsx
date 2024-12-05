import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import logo_navbar from '../assets/logo_navbar.png'
import icon_login from '../assets/icon_login.png'
import icon_user from '../assets/icon_user.png'
import arrow_down from '../assets/arrow_down.png'
import icon_logout from '../assets/icon_logout.png'
import { jwtDecode } from "jwt-decode";
import checkToken from '../func/CheckToken'
import calculatorWidthAndHeight from "../func/CalculatorWidthAndHeight";

import '../index.css'
function NavBar() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(null)
  const [dropdown, setDropdown] = useState(false)
  const [nowPath, setNowPath] = useState('')
  useEffect(() => {
    const token = checkToken();
    const exp = localStorage.getItem('expiration');
    setNowPath(window.location.pathname)
    if (token && exp) {
      if (Date.now() > parseInt(exp)) {
        localStorage.removeItem('token')
        localStorage.removeItem('expiration')
        navigate('/Login')
      }
      const decode_token = jwtDecode(token);
      setIsLogin(decode_token.role)
    } else {
      setIsLogin(null)
    }

  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('expiration')
    setIsLogin(null)
    navigate('/Login')
  }

  return (
    <>
      <div className="container-fluid m-0 p-0 " style={{ background: '#727D71' }}>
        <div className="w-100 d-flex align-items-center justify-content-between p-3 shadow-sm text-dark">
          <div className="d-flex align-items-center justify-content-start w-50" style={{ gap: calculatorWidthAndHeight(12) }}>
            <div className="d-flex align-items-center justify-content-center hov" style={{ maxHeight: calculatorWidthAndHeight(32), maxWidth: calculatorWidthAndHeight(52) }} onClick={(e) => {
              navigate('/')

            }}>
              <img src={logo_navbar} alt="" className='w-100 h-100' style={{ objectFit: 'cover' }} />
            </div>
            {/* <div className="d-flex align-items-center justify-content-center px-2">
              <input type="text" className='form-control' placeholder='Search' style={{ width: '32vh' }} />
            </div> */}
          </div>
          {
            isLogin ? (
              <div className="d-flex align-items-center justify-content-end text-white" style={{ gap: calculatorWidthAndHeight(14) }}>
                {/* <div className="d-flex align-items-center justify-content-center hov" onClick={(e) => {
                  if (isLogin === 'admin') {
                    navigate('/ManageRequest')
                  } else {
                    navigate('/RequestStatus')
                  }
                }}>
                  <span style={{ fontSize: calculatorWidthAndHeight(14), fontWeight: 500, borderBottom: '1px solid #EAE0D5' }}>STATUS</span>
                </div> */}
                {
                  isLogin === 'user' ? (
                    <>
                      <div className="d-flex align-items-center justify-content-center hov" onClick={(e) => {
                   
                          navigate('/RequestStatus')
                      }}>
                        <span style={{ fontSize: calculatorWidthAndHeight(14), fontWeight: 500, borderBottom: `${calculatorWidthAndHeight(1)} solid #EAE0D5` }}>STATUS</span>
                      </div>
                    </>
                  ) : null
                }
                {
                  isLogin === 'admin' ? (
                    <>
                      <div className="d-flex align-items-center justify-content-center hov" onClick={(e) => {
                        navigate('/')
                      }}>
                        <span style={{ fontSize: calculatorWidthAndHeight(14), fontWeight: 500, borderBottom: `${calculatorWidthAndHeight(1)} solid #EAE0D5` }}>DASHBOARD</span>
                      </div>
                      <div className="d-flex align-items-center justify-content-center hov" onClick={(e) => {
                        navigate('/ManageRequest')
                      }}>
                        <span style={{ fontSize: calculatorWidthAndHeight(14), fontWeight: 500, borderBottom: `${calculatorWidthAndHeight(1)} solid #EAE0D5` }}>PAYMENT CONFIRMATION</span>
                      </div>
                      <div className="d-flex align-items-center justify-content-center hov" onClick={(e) => {
                        navigate('/RequestHistory')
                      }}>
                        <span style={{ fontSize: calculatorWidthAndHeight(14), fontWeight: 500, borderBottom: `${calculatorWidthAndHeight(1)} solid #EAE0D5` }}>CONFIRMATION HISTORY</span>
                      </div>
                      <div className="d-flex align-items-center justify-content-center hov" onClick={(e) => {
                        navigate('/SetRent')
                      }}>
                        <span style={{ fontSize: calculatorWidthAndHeight(14), fontWeight: 500, borderBottom: `${calculatorWidthAndHeight(1)} solid #EAE0D5` }}>MANAGE AREA</span>
                      </div>
                      <div className="d-flex align-items-center justify-content-center hov" onClick={(e) => {
                        navigate('/ManageUser')
                      }}>
                        <span style={{ fontSize: calculatorWidthAndHeight(14), fontWeight: 500, borderBottom: `${calculatorWidthAndHeight(1)} solid #EAE0D5` }}>MANAGE USER</span>
                      </div>
                    </>
                  ) : null
                }


                <div className="d-flex px-1 py-1 align-items-center gap-1" onClick={(e) => {
                  setDropdown(!dropdown)
                }} style={{ borderRadius: calculatorWidthAndHeight(2), border: `${calculatorWidthAndHeight(2)} solid #EAE0D5` }}>
                  <div className="d-flex align-items-center justify-content-center hov p-2" style={{ gap: calculatorWidthAndHeight(4), borderRadius: calculatorWidthAndHeight(2), background: '#6D4C3D' }}>
                    <span style={{ fontSize: calculatorWidthAndHeight(14), fontWeight: 500 }}>{isLogin.toLocaleUpperCase()}</span>
                    <img src={icon_user} alt="" style={{ width: calculatorWidthAndHeight(21), height: calculatorWidthAndHeight(19) }} />
                  </div>
                  <img src={arrow_down} alt="" style={{ width: calculatorWidthAndHeight(15), height: calculatorWidthAndHeight(12) }} />

                  {
                    dropdown ? (
                      <div className="position-absolute bg-light p-2 d-flex flex-column align-items-center justify-content-center gap-1 z-2" style={{ top: '7.4vh', width: '11.7vh', gap: '0.4vh' }}>
                        <div className="d-flex align-items-center justify-content-start w-100 gap-2" onClick={(e) => {
                          navigate('/Edit')
                        }}>
                          <img src={icon_logout} alt="" style={{ width: calculatorWidthAndHeight(12), height: calculatorWidthAndHeight(14) }} />
                          <span className='hov' style={{ fontSize: calculatorWidthAndHeight(14), color: 'red', fontWeight: 500 }}>Edit</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-start w-100 gap-2" onClick={(e) => {
                          logout()
                        }}>
                          <img src={icon_logout} alt="" style={{ width: calculatorWidthAndHeight(12), height: calculatorWidthAndHeight(14) }} />
                          <span className='hov' style={{ fontSize: calculatorWidthAndHeight(14), color: 'red', fontWeight: 500 }}>Logout</span>
                        </div>
                      </div>
                    ) : null
                  }
                </div>
              </div>
            ) : (

              <div className="d-flex align-items-center justify-content-end text-white p-1  " style={{ border: '0.2vh solid #fff', borderRadius: '0.2vh' }} onClick={(e) => {
                window.location.pathname === '/Login' ? navigate('/') : navigate('/Login')
              }}>
                <div className="d-flex align-items-center justify-content-center hov w-100 h-100 px-4 p-1 " style={{ gap: calculatorWidthAndHeight(4), background: '#6D4C3D', borderRadius: '0.2vh' }}>
                  {/* {
                    window.location.pathname === '/Login' ? null : (
                      <img src={icon_login} alt="" style={{ width: '21px', height: '19px' }} />
                    )
                  } */}
                  <span style={{ fontSize: calculatorWidthAndHeight(14), fontWeight: 500 }}>{window.location.pathname === '/Login' ? 'HOME' : 'LOGIN'}</span>
                </div>
              </div>


            )
          }

        </div>
      </div>
    </>
  )
}

export default NavBar