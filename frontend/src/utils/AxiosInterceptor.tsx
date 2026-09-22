import { useEffect } from "react";
import axios from "./config";
import { useNavigate } from "react-router-dom";

function AxiosInterceptor() {
    const navigate = useNavigate();
    useEffect(() => {
        const interceptors = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    navigate("/");
                } 

                return Promise.reject(error)
            }
        )

        return () => {
            axios.interceptors.response.eject(interceptors)
        }
    }, []);

    return <></>
}

export default AxiosInterceptor;