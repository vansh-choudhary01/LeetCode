import axios from "../../utils/config"
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { type page } from ".";

type formDataType = {
    email: string,
    password: string
}

type formState = [
    formData: formDataType,
    setFormData: React.Dispatch<React.SetStateAction<{
        email: string;
        password: string;
    }>>
]

function LoginPage({ page }: {page: page}) {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    }) as formState;
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        setFormData(prevState =>({
            ...prevState,
            [name]: value
        }))
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault()

        setIsLoading(true);
        axios.post(page === "loginAdmin" ? "/api/auth/admin/login" : "/api/auth/user/login", formData, {
            withCredentials: true
        }).then((res) => {
            if (res.data.status === true) {
                navigate("/problems");
            }
        }).catch((err) => {
            alert("Login Failed" + err);
        }).finally(() => {
            setIsLoading(false);
        })
    }

    return <div className="auth-form-card">
            <span className="eyebrow">{page === "loginAdmin" ? "Administrator access" : "Welcome back"}</span>
            <h2>{page === "loginAdmin" ? "Sign in as admin" : "Sign in to continue"}</h2>
            <p className="form-lead">Pick up where you left off and keep your streak moving.</p>
            <form onSubmit={handleSubmit}>
                <label className="field-label" htmlFor="login-email">Email address</label>
                <input id="login-email" type="email" placeholder="you@example.com" name="email" value={formData.email} onChange={handleChange} />
                <label className="field-label" htmlFor="login-password">Password</label>
                <input id="login-password" type="password" placeholder="Enter your password" name="password" value={formData.password} onChange={handleChange} />
                <button className="primary-button" type="submit" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign in"}</button>
            </form>
        </div>
}

export default LoginPage;
