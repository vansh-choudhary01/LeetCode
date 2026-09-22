import { useEffect, useState } from "react";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export type page = 'loginUser' | 'registerUser' | 'loginAdmin';

type pageState = [page, React.Dispatch<React.SetStateAction<string>>]

function Auth() {
    const [page, setPage] = useState('loginUser') as pageState;
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("/api/me", {
            withCredentials: true
        }).then((data) => {
            if (data.data.status === true) {
                navigate("/problems");
            }
        })
    }, []);

    return <>
    <div className="authBox">
        {page === 'loginUser' || page === 'loginAdmin' ? <LoginPage page={page}/> :  <RegisterPage /> }

        {page === 'registerUser' ? <span onClick={() => setPage('loginUser')}>continue with login</span> : 
            <>
                {page === 'loginAdmin' ? <span onClick={() => setPage('loginUser')}>continue with user login</span> : 
                    <span onClick={() => setPage('loginAdmin')}>continue with admin login</span>
                }
                <span onClick={() => setPage('registerUser')}>continue with Register</span> 
            </>
        }
    </div>
    </>
}

export default Auth;