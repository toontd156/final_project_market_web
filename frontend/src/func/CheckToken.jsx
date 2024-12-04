export const checkToken = () => {
    const token = localStorage.getItem('token');
    return token || false;
};

export default checkToken;
// checkToken()
// import checkToken from '../../func/CheckToken';
